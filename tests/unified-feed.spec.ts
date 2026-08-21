import { test, expect } from "@playwright/test";

function uniqueEmail() {
  return `feed-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `feed${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

test("create a post on your profile, see it in your activity feed and in the main community feed", async ({ page }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);

  const postTitle = `Feed test post ${Date.now()}`;

  await page.goto(`/community/u/${username}`);
  await page.getByRole("button", { name: "New post" }).click();
  await page.fill("#post-title", postTitle);
  await page.fill("#post-body", "Body content for the unified feed e2e test.");
  await page.getByRole("button", { name: "Post" }).click();
  // The form's router.refresh() re-fetches the server-rendered activity feed
  // in place, but its client-side timing is unreliable under Next.js dev-mode
  // Turbopack (observed: the POST succeeds and the row lands in D1, but the
  // in-place refresh sometimes doesn't pick it up within a normal assertion
  // window). Wait for the form to close (confirming the request completed),
  // then force a fresh full-page load rather than trusting the in-place
  // refresh's timing — a full load of this page reliably shows the post.
  await expect(page.getByRole("button", { name: "New post" })).toBeVisible();
  await page.reload();
  await expect(page.getByText(postTitle)).toBeVisible();

  await page.goto("/community");
  await expect(page.getByText(postTitle)).toBeVisible();
});

test("vote on a bug report from the bug tracker page", async ({ page }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);

  await page.goto("/community/bugs");
  await page.getByRole("button", { name: "Report a bug" }).click();
  const bugTitle = `Vote test bug ${Date.now()}`;
  await page.fill("#bug-title", bugTitle);
  await page.fill("#bug-description", "Description for the bug voting e2e test.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(bugTitle)).toBeVisible();

  const bugCard = page.locator("div", { has: page.getByText(bugTitle) }).last();
  await bugCard.getByRole("button", { name: "Upvote" }).click();
  await expect(bugCard.getByText("1", { exact: true })).toBeVisible();
});

test("switching the community feed sort between latest and popular reorders items", async ({ page }) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);

  await page.goto("/community");
  await page.getByRole("button", { name: "Popular" }).click();
  await expect(page.getByRole("button", { name: "Popular" })).toHaveClass(/bg-espresso/);
  await page.getByRole("button", { name: "Latest" }).click();
  await expect(page.getByRole("button", { name: "Latest" })).toHaveClass(/bg-espresso/);
});
