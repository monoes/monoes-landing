import { test, expect } from "@playwright/test";

function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

test("register -> onboarding -> protected route roundtrip", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/community\/onboarding$/);

  const username = `user${Date.now()}`;
  await page.fill("#username", username);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/community$/);
  await expect(page.locator("text=Join the community")).toHaveCount(0);
});

test("non-admin is redirected away from /community/admin", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community\/onboarding$/);
  await page.fill("#username", `user${Date.now()}`);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);

  await page.goto("/community/admin");
  await expect(page).toHaveURL(/\/community$/);
});

test("logged-out visitor to /community/admin is redirected to login", async ({ page }) => {
  await page.goto("/community/admin");
  await expect(page).toHaveURL(/\/community\/login$/);
});
