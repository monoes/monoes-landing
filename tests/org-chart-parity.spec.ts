import { test, expect } from "@playwright/test";
import path from "node:path";

function uniqueEmail() {
  return `org-chart-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `orgchart${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

test("org chart renders report + communication edges with a matching legend, and role clicks still open the modal", async ({
  page,
}) => {
  await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
  await page.goto("/community/orgs");

  const fileInput = page.locator('input[type="file"]');
  const uploadResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/community/orgs") && res.request().method() === "POST",
  );
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "org-with-communication.json"));
  const uploadResponse = await uploadResponsePromise;
  const created = (await uploadResponse.json()) as { id: string };

  await page.goto(`/community/orgs/${created.id}`);
  await page.waitForLoadState("networkidle");

  // 2 report edges (boss→writer, boss→reviewer) + 3 communication edges
  // (command, handoff, feedback) = 5 lines.
  await expect(page.locator("#org-chart-svg line")).toHaveCount(5);

  // All 4 edge types are present in this fixture, so the legend shows all 4 labels.
  for (const label of ["Command", "Report", "Feedback", "Handoff"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  // Clicking a role node still opens the existing role modal (regression check).
  await page.locator("#org-chart-svg circle").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
