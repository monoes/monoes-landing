import { test, expect } from "@playwright/test";

function uniqueEmail() {
  return `feat-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `feat${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

async function registerAndOnboard(page: import("@playwright/test").Page) {
  const email = uniqueEmail();
  const username = uniqueUsername();
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community\/onboarding$/);
  await page.fill("#username", username);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);
}

test("submit a feature, then upvote it and see the score update", async ({ page }) => {
  await registerAndOnboard(page);
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
