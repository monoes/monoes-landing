import { test, expect } from "@playwright/test";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { user } from "../src/lib/db/schema";
import path from "node:path";

function uniqueEmail() {
  return `org-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `org${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

async function setUserRole(email: string, role: "admin" | "moderator") {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB);
    await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.email, email));
  } finally {
    await dispose();
  }
}

test("upload a valid org, view its chart, click a role to see the modal, download it", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/orgs");

  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "valid-org.json"));
  // The gallery persists org uploads across test runs (local D1, no cleanup),
  // so previous runs may leave other cards with this same fixture name. A bare
  // ".first()" text match can race ahead of the optimistic re-render and land
  // on a stale card instead of this test's own upload — wait for the upload
  // response and navigate to the exact org this test just created.
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };
  await page.locator(`a[href="/community/orgs/${created.id}"]`).click();
  await expect(page).toHaveURL(/\/community\/orgs\/.+/);
  // On a cold dev-server hit, this dynamic route can take several seconds to
  // compile; the page can be Playwright-actionable before React finishes
  // hydrating and attaches its onClick handlers, which makes an immediate
  // click a silent no-op. Wait for the client bundle to finish loading first.
  await page.waitForLoadState("networkidle");

  // Chart tab is the default; click the "boss" node's circle to open the modal.
  await page.locator("svg circle").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("plan work");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();

  // Roles tab shows the same roles as clickable cards.
  await page.getByRole("button", { name: "Roles" }).click();
  // "Writer" also appears in the "id: writer · reports to: boss" meta line on
  // the same card (case-insensitive substring match), so scope to the first match.
  await expect(page.getByText("Writer").first()).toBeVisible();
  await page.getByText("Writer").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("write docs");
  await page.getByRole("button", { name: "Close" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("e2e-test-org.json");
});

test("uploading an invalid org JSON shows a validation error", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/orgs");

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "invalid-org.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ roles: [] })),
  });

  await expect(page.getByRole("alert")).toBeVisible();
});

test("logged-out visitor to /community/orgs is redirected to login", async ({ page }) => {
  await page.goto("/community/orgs");
  await expect(page).toHaveURL(/\/community\/login$/);
});

test("uploader deletes their own org upload", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/orgs");

  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "minimal-org.json"));
  // Unlike the accumulation caveat above (where ".first()" reliably means "newest"),
  // this gallery already has many leftover "minimal-org" cards from earlier runs, so
  // ".first()" can race ahead of the optimistic re-render and match a stale card
  // uploaded by a different user (whose "Delete" button we can't see). Wait for the
  // upload response and navigate to the exact org this test just created instead.
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };
  await page.locator(`a[href="/community/orgs/${created.id}"]`).click();
  // On a cold dev-server hit, this dynamic route can take several seconds to
  // compile; the "Delete" button is present in the server-rendered HTML (and
  // so is Playwright-actionable) before React finishes hydrating and attaches
  // its onClick handler, which makes an immediate click a silent no-op. Wait
  // for the client bundle to finish loading/executing first.
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL(/\/community\/orgs$/);
  // Scope to this org's own link — the gallery can have other leftover
  // "minimal-org" cards uploaded by other users/runs, so a bare text match
  // would be a strict-mode violation (or, worse, a false pass/fail on the
  // wrong card).
  await expect(page.locator(`a[href="/community/orgs/${created.id}"]`)).not.toBeVisible();
});

test("moderator deletes someone else's org upload", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/orgs");
  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "valid-org.json"));
  // Other tests in this run (and prior runs, since local D1 is never reset) may
  // have uploaded the same fixture (same org name) — wait for the upload
  // response and navigate to the exact org this test just created rather than
  // racing a text match against accumulated stale cards.
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };
  await page.locator(`a[href="/community/orgs/${created.id}"]`).click();
  const orgUrl = page.url();

  const modEmail = uniqueEmail();
  const modContext = await browser.newContext();
  const modPage = await modContext.newPage();
  try {
    await registerAndOnboard(modPage, modEmail, uniqueUsername());
    await setUserRole(modEmail, "moderator");

    await modPage.goto(orgUrl);
    // Same cold-compile hydration race as the uploader-delete test.
    await modPage.waitForLoadState("networkidle");
    await modPage.getByRole("button", { name: "Delete" }).click();
    await expect(modPage).toHaveURL(/\/community\/orgs$/);
  } finally {
    await modContext.close();
  }
});
