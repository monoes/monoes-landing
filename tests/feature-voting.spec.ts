import { test, expect } from "@playwright/test";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { feature, user } from "../src/lib/db/schema";

function uniqueEmail() {
  return `feat-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `feat${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

// Promotes a user's role directly via D1 — mirrors scripts/seed-admin.ts,
// since there's no test-only sign-up flow that grants elevated roles.
async function setUserRole(email: string, role: "admin" | "moderator") {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB);
    await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.email, email));
  } finally {
    await dispose();
  }
}

// Looks up the most recently created feature with the given title directly
// via D1 — there's no GET-by-title API (the list endpoint only exists as an
// authenticated POST for creation; reads happen server-side in the page).
async function getFeatureIdByTitle(title: string): Promise<string> {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB);
    const rows = await db
      .select({ id: feature.id })
      .from(feature)
      .where(eq(feature.title, title))
      .orderBy(desc(feature.createdAt))
      .limit(1);
    if (rows.length === 0) throw new Error(`No feature found with title "${title}"`);
    return rows[0].id;
  } finally {
    await dispose();
  }
}

test("submit a feature, then upvote it and see the score update", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/features");

  await page.getByRole("button", { name: "Suggest a feature" }).click();
  const title = `Test feature ${Date.now()}`;
  await page.fill("#feature-title", title);
  await page.fill("#feature-description", "This is a test feature description.");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(title)).toBeVisible();

  // Scope to the specific FeatureCard root (its distinctive class combo),
  // not a generic "div containing this text" — a bare `div` locator also
  // matches every ancestor div (the list wrapper, the flex layout div
  // inside the card), and with more than one feature in the (shared, never
  // reset) local D1 database across test runs, `.first()` on an unscoped
  // match can resolve to the outer list wrapper instead of this one card.
  const card = page.locator("div.rounded-lg.border-ivory-linen.bg-ivory", { hasText: title });
  await card.getByLabel("Upvote").click();
  await expect(card.getByText("1", { exact: true })).toBeVisible();
});

test("logged-out visitor to /community/features is redirected to login", async ({ page }) => {
  await page.goto("/community/features");
  await expect(page).toHaveURL(/\/community\/login$/);
});

test("admin changes a feature's status", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/features");
  await page.getByRole("button", { name: "Suggest a feature" }).click();
  const title = `Admin status test ${Date.now()}`;
  await page.fill("#feature-title", title);
  await page.fill("#feature-description", "Feature awaiting admin triage.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(title)).toBeVisible();

  const adminEmail = uniqueEmail();
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  try {
    await registerAndOnboard(adminPage, adminEmail, uniqueUsername());
    await setUserRole(adminEmail, "admin");

    await adminPage.goto("/community/admin");
    await adminPage.getByRole("button", { name: "Feature requests" }).click();
    const row = adminPage.locator("tr", { hasText: title }).last();
    await row.locator("select").selectOption("planned");
    await expect(row.locator("select")).toHaveValue("planned");
  } finally {
    await adminContext.close();
  }
});

// NOTE: the /community/admin *page* itself (and the middleware guarding it)
// only admits role === "admin", even though the DELETE (and block-user)
// route handlers explicitly permit "moderator" too (see
// src/app/api/community/features/[id]/route.ts and
// src/app/api/community/admin/users/[id]/block/route.ts). A moderator can
// therefore never reach the admin panel's delete button in the current
// build, so this test exercises the moderator's DELETE permission directly
// against the API (using the moderator's authenticated browser session)
// rather than through the (currently unreachable, for moderators) admin UI.
test("moderator deletes a feature", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/features");
  await page.getByRole("button", { name: "Suggest a feature" }).click();
  const title = `Moderator delete test ${Date.now()}`;
  await page.fill("#feature-title", title);
  await page.fill("#feature-description", "Feature to be removed by a moderator.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(title)).toBeVisible();

  const modEmail = uniqueEmail();
  const modContext = await browser.newContext();
  const modPage = await modContext.newPage();
  try {
    await registerAndOnboard(modPage, modEmail, uniqueUsername());
    await setUserRole(modEmail, "moderator");

    const id = await getFeatureIdByTitle(title);
    const deleteResponse = await modPage.request.delete(`/api/community/features/${id}`);
    expect(deleteResponse.ok()).toBe(true);

    await modPage.goto("/community/features");
    await expect(modPage.getByText(title)).not.toBeVisible();
  } finally {
    await modContext.close();
  }
});
