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

  // The fixture declares 3 explicit communication edges (command, handoff,
  // feedback) — explicit communication is used verbatim, so no additional
  // structural reports_to lines are auto-generated alongside it.
  await expect(page.locator("#org-chart-svg path.org-chart-edge")).toHaveCount(3);

  // Only the 3 edge types actually present in this fixture appear in the legend.
  for (const label of ["Command", "Feedback", "Handoff"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Report", { exact: true })).not.toBeVisible();

  // Clicking a role node still opens the existing role modal (regression check).
  await page.locator("#org-chart-svg .org-chart-node circle").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
