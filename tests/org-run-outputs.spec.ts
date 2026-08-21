import { test, expect } from "@playwright/test";
import path from "node:path";

function uniqueEmail() {
  return `orgrun-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `orgrun${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

async function uploadAnOrg(page: import("@playwright/test").Page) {
  await page.goto("/community/orgs");
  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST" && !res.url().includes("/runs"),
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "valid-org.json"));
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };
  return created.id;
}

test("upload a run with a markdown and an HTML file, view both", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  const orgId = await uploadAnOrg(page);

  await page.goto(`/community/orgs/${orgId}`);
  await page.getByRole("button", { name: "Outputs" }).click();
  await page.getByRole("button", { name: "Upload output" }).click();
  await page.fill("#run-label", "First run");

  const fileInput = page.locator("#run-files");
  await fileInput.setInputFiles([
    path.join(__dirname, "fixtures", "run-output.md"),
    path.join(__dirname, "fixtures", "run-output.html"),
  ]);
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page.getByText("First run")).toBeVisible();
  await page.getByText("First run").click();
  await expect(page.getByText("run-output.md")).toBeVisible();
  await expect(page.getByText("run-output.html")).toBeVisible();

  await page.getByText("run-output.md").click();
  await expect(page.getByRole("heading", { name: "Run Summary" })).toBeVisible();

  await page.getByText("run-output.html").click();
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("#report-heading")).toHaveText("Run Report");
});

test("a run's uploader can delete their own run", async ({ page }) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  const orgId = await uploadAnOrg(page);

  await page.goto(`/community/orgs/${orgId}`);
  await page.getByRole("button", { name: "Outputs" }).click();
  await page.getByRole("button", { name: "Upload output" }).click();
  const fileInput = page.locator("#run-files");
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "run-output.md"));
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page.getByText("Untitled run")).toBeVisible();
  const runCard = page.locator("div", { has: page.getByText("Untitled run") }).last();
  await runCard.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Untitled run")).not.toBeVisible();
});

test("a non-uploader without moderator/admin role cannot see a delete button on someone else's run", async ({
  page,
  browser,
}) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  const orgId = await uploadAnOrg(page);

  await page.goto(`/community/orgs/${orgId}`);
  await page.getByRole("button", { name: "Outputs" }).click();
  await page.getByRole("button", { name: "Upload output" }).click();
  const fileInput = page.locator("#run-files");
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "run-output.md"));
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText("Untitled run")).toBeVisible();

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  try {
    await registerAndOnboard(otherPage, uniqueEmail(), uniqueUsername());
    await otherPage.goto(`/community/orgs/${orgId}`);
    await otherPage.getByRole("button", { name: "Outputs" }).click();
    await expect(otherPage.getByText("Untitled run")).toBeVisible();
    await expect(otherPage.getByRole("button", { name: "Delete" })).not.toBeVisible();
  } finally {
    await otherContext.close();
  }
});
