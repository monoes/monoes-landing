import { test, expect } from "@playwright/test";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { user } from "../src/lib/db/schema";

function uniqueEmail() {
  return `bug-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `bug${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

async function registerAndOnboard(page: import("@playwright/test").Page, email: string, username: string) {
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community\/onboarding$/);
  await page.fill("#username", username);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);
}

// Promotes a user's role directly via D1 — mirrors the equivalent helper in
// tests/feature-voting.spec.ts, since there's no test-only sign-up flow that
// grants elevated roles.
async function setUserRole(email: string, role: "admin" | "moderator") {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB);
    await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.email, email));
  } finally {
    await dispose();
  }
}

test("submit a bug, comment on it, and see the comment appear", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/bugs");

  await page.getByRole("button", { name: "Report a bug" }).click();
  const title = `Test bug ${Date.now()}`;
  await page.fill("#bug-title", title);
  await page.fill("#bug-description", "This is a test bug description.");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(title)).toBeVisible();
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/community\/bugs\/.+/);

  await page.fill("textarea[placeholder='Add a comment…']", "I can reproduce this too.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("I can reproduce this too.")).toBeVisible();
});

test("logged-out visitor to /community/bugs is redirected to login", async ({ page }) => {
  await page.goto("/community/bugs");
  await expect(page).toHaveURL(/\/community\/login$/);
});

test("admin changes status/severity and attaches a label", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/bugs");
  await page.getByRole("button", { name: "Report a bug" }).click();
  const title = `Admin triage test ${Date.now()}`;
  await page.fill("#bug-title", title);
  await page.fill("#bug-description", "Bug awaiting admin triage.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(title)).toBeVisible();
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/community\/bugs\/.+/);
  const bugUrl = page.url();

  const adminEmail = uniqueEmail();
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  try {
    await registerAndOnboard(adminPage, adminEmail, uniqueUsername());
    await setUserRole(adminEmail, "admin");

    await adminPage.goto(bugUrl);
    await adminPage.getByLabel("Status").selectOption("in_progress");
    await expect(adminPage.getByLabel("Status")).toHaveValue("in_progress");
    await adminPage.getByLabel("Severity").selectOption("critical");
    await expect(adminPage.getByLabel("Severity")).toHaveValue("critical");

    const labelName = `regression-${Date.now()}`;
    await adminPage.getByRole("button", { name: "+ new label" }).click();
    await adminPage.fill("input[placeholder='Label name']", labelName);
    await adminPage.getByRole("button", { name: "Create" }).click();
    await expect(adminPage.getByText(labelName)).toBeVisible();

    await adminPage.goto("/community/admin");
    await adminPage.getByRole("button", { name: "Bug reports" }).click();
    await expect(adminPage.getByRole("cell", { name: title })).toBeVisible();
  } finally {
    await adminContext.close();
  }
});

// Unlike /community/admin (admin-only), the bug detail page's moderator
// controls are reachable by both "admin" and "moderator" roles (see Task 7's
// `canModerate` check), so this test exercises the actual "Delete bug
// report" button rather than falling back to a direct API call.
test("moderator deletes a bug report", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/bugs");
  await page.getByRole("button", { name: "Report a bug" }).click();
  const title = `Moderator delete test ${Date.now()}`;
  await page.fill("#bug-title", title);
  await page.fill("#bug-description", "Bug to be removed by a moderator.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(title)).toBeVisible();
  await page.getByText(title).click();
  await expect(page).toHaveURL(/\/community\/bugs\/.+/);
  const bugUrl = page.url();

  const modEmail = uniqueEmail();
  const modContext = await browser.newContext();
  const modPage = await modContext.newPage();
  try {
    await registerAndOnboard(modPage, modEmail, uniqueUsername());
    await setUserRole(modEmail, "moderator");

    await modPage.goto(bugUrl);
    await modPage.getByRole("button", { name: "Delete bug report" }).click();
    await expect(modPage).toHaveURL(/\/community\/bugs$/);
    await expect(modPage.getByText(title)).not.toBeVisible();
  } finally {
    await modContext.close();
  }
});
