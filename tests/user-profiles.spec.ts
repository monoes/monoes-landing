import { test, expect } from "@playwright/test";
import path from "node:path";

function uniqueEmail() {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `profile${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

test("edit profile fields, upload an avatar, and see them on the public profile page", async ({ page }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);

  await page.goto("/community/settings/profile");
  await page.fill("#tagline", "Building agentic systems.");
  await page.fill("#jobTitle", "Senior Engineer");
  await page.fill("#company", "Acme Inc.");
  await page.fill("#tag-input", "rust");
  await page.keyboard.press("Enter");
  await page.fill("#tag-input", "ai-agents");
  await page.keyboard.press("Enter");
  await page.fill("#githubUrl", "https://github.com/monoes");

  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/profile/avatar") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "avatar.png"));
  await uploadResponsePromise;

  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(new RegExp(`/community/u/${username}$`));

  await expect(page.getByText("Building agentic systems.")).toBeVisible();
  await expect(page.getByText("Senior Engineer at Acme Inc.")).toBeVisible();
  await expect(page.getByText("rust")).toBeVisible();
  await expect(page.getByText("ai-agents")).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/monoes");
  await expect(page.locator("img[alt$=\"'s avatar\"]")).toBeVisible();
});

test("logged-out visitor can view a public profile page", async ({ page, context }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);
  await context.clearCookies();

  await page.goto(`/community/u/${username}`);
  await expect(page).toHaveURL(new RegExp(`/community/u/${username}$`));
  await expect(page.getByText(`@${username}`)).toBeVisible();
});

test("visiting a nonexistent username shows a not-found page", async ({ page }) => {
  const res = await page.goto("/community/u/definitely-does-not-exist-12345");
  expect(res?.status()).toBe(404);
});

test("My profile link on /community goes to the signed-in user's profile", async ({ page }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);
  await page.goto("/community");
  await page.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(new RegExp(`/community/u/${username}$`));
});
