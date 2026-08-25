import { test, expect } from "@playwright/test";
import path from "node:path";

function uniqueEmail() {
  return `org-edit-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `orgedit${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

async function uploadFixtureOrg(page: import("@playwright/test").Page): Promise<string> {
  await page.goto("/community/orgs");
  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "valid-org.json"));
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };
  return created.id;
}

test("owner can edit tagline, description, body, and add an image", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  const orgId = await uploadFixtureOrg(page);

  await page.goto(`/community/orgs/${orgId}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page).toHaveURL(`/community/orgs/${orgId}/edit`);

  await page.fill("#tagline", "Ships docs while you sleep");
  await page.fill("#description", "A team of agents that plan, write, and review documentation end to end.");
  await page.fill("#body", "# Why this org exists\n\nWe got tired of stale docs.");

  const imageInput = page.locator('input[type="file"][accept*="image"]');
  const imageUploadPromise = page.waitForResponse(
    (res) => res.url().includes(`/api/community/orgs/${orgId}/images`) && res.request().method() === "POST",
    // First-time Turbopack compilation of this route in this sandbox can
    // exceed the default 30s wait (see tests/oauth.spec.ts for the same pattern).
    { timeout: 90_000 },
  );
  await imageInput.setInputFiles({
    name: "diagram.png",
    mimeType: "image/png",
    // Minimal valid 1x1 PNG.
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  const imageUploadResponse = await imageUploadPromise;
  const { url: imageUrl } = (await imageUploadResponse.json()) as { url: string };
  await expect(page.locator("#body")).toContainText(imageUrl);

  const saveResponsePromise = page.waitForResponse(
    (res) => res.url().includes(`/api/community/orgs/${orgId}`) && res.request().method() === "PATCH",
    { timeout: 90_000 },
  );
  await page.getByRole("button", { name: "Save org" }).click();
  await saveResponsePromise;
  await expect(page).toHaveURL(`/community/orgs/${orgId}`);

  await expect(page.getByText("Ships docs while you sleep")).toBeVisible();
  await expect(
    page.getByText("A team of agents that plan, write, and review documentation end to end."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this org exists" })).toBeVisible();
  await expect(page.locator(`img[src="${imageUrl}"]`)).toBeVisible();
});

test("a non-owner visiting the edit page directly is redirected away", async ({ page, browser }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  const orgId = await uploadFixtureOrg(page);

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await registerAndOnboard(otherPage, uniqueEmail(), uniqueUsername());
  await otherPage.goto(`/community/orgs/${orgId}/edit`);
  await expect(otherPage).toHaveURL(`/community/orgs/${orgId}`);
  await expect(otherPage.getByRole("link", { name: "Edit" })).toHaveCount(0);

  await otherContext.close();
});
