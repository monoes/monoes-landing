import { test, expect, type Page } from "@playwright/test";

function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `user${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

async function registerAndOnboard(page: Page, email: string, username: string) {
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/community\/onboarding$/);

  await page.fill("#username", username);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/community$/);
}

test("register -> onboarding -> protected route roundtrip", async ({ page }) => {
  const email = uniqueEmail();
  const username = uniqueUsername();
  await registerAndOnboard(page, email, username);

  await expect(page.locator("text=Join the community")).toHaveCount(0);
  await expect(page.locator("text=Admin dashboard")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View on GitHub ↗" })).toBeVisible();
});

test("non-admin is redirected away from /community/admin", async ({ page }) => {
  const email = uniqueEmail();
  const username = uniqueUsername();
  await registerAndOnboard(page, email, username);

  await page.goto("/community/admin");
  await expect(page).toHaveURL(/\/community$/);
});

test("logged-out visitor to /community/admin is redirected to login", async ({ page }) => {
  await page.goto("/community/admin");
  await expect(page).toHaveURL(/\/community\/login$/);
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
});
