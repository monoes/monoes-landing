import { test, expect } from "@playwright/test";
import { registerAndOnboard } from "./helpers/library-auth";

// The galleries and the library need a login, so these tests sign in first.

const SECTIONS = ["Home", "Orgs", "Workflows", "Web automations", "Library", "Feature requests", "Bug reports"];

test("every community and library page carries the section menu, with the current section marked", async ({ page }) => {
  await registerAndOnboard(page);
  for (const [path, current] of [
    ["/community", "Home"],
    ["/community/orgs", "Orgs"],
    ["/community/workflows", "Workflows"],
    ["/community/automations", "Web automations"],
    ["/library", "Library"],
  ] as const) {
    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Community sections" });
    for (const label of SECTIONS) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.locator('[aria-current="page"]')).toHaveText(current);
  }
});

test("moving between sections works from a section page, including by keyboard", async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto("/community/orgs");
  const nav = page.getByRole("navigation", { name: "Community sections" });
  await nav.getByRole("link", { name: "Web automations", exact: true }).click();
  await expect(page).toHaveURL(/\/community\/automations$/);
  await expect(page.getByRole("heading", { name: "Web automation gallery" })).toBeVisible();

  const workflows = nav.getByRole("link", { name: "Workflows", exact: true });
  await workflows.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/community\/workflows$/);
  await expect(nav.locator('[aria-current="page"]')).toHaveText("Workflows");
});

test("on a phone the section menu scrolls sideways and still reaches every section", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await registerAndOnboard(page);
  await page.goto("/community/workflows");
  const nav = page.getByRole("navigation", { name: "Community sections" });
  const bugs = nav.getByRole("link", { name: "Bug reports", exact: true });
  await bugs.scrollIntoViewIfNeeded();
  await expect(bugs).toBeInViewport();
  await nav.getByRole("link", { name: "Library", exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  await context.close();
});

test("sign-in screens stay focused, without the section menu", async ({ page }) => {
  await page.goto("/community/login");
  await expect(page.getByRole("navigation", { name: "Community sections" })).toHaveCount(0);
});

test("the hub shows the hero, the three galleries and the feed", async ({ page }) => {
  await page.goto("/community");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Build agents together.");
  for (const name of ["Org gallery", "Workflow gallery", "Web automation gallery"]) {
    await expect(page.getByRole("heading", { name, exact: false }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "What's happening" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Latest" })).toHaveAttribute("aria-pressed", "true");
});
