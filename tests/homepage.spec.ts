import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("hero headline renders in the server HTML without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("staffed");
    await context.close();
  });

  test("both CTAs are present and route correctly", async ({ page }) => {
    await page.goto("/");

    const hireCta = page.getByRole("link", { name: /hire your ai team/i, includeHidden: true }).first();
    await expect(hireCta).toHaveAttribute("href", "#hire");
    const selfHostCta = page.getByRole("link", { name: /run it yourself, free/i, includeHidden: true }).first();
    await expect(selfHostCta).toHaveAttribute("href", "/product#projects");
    await expect(page.locator("#hire")).toHaveCount(1);
  });

  test("no horizontal scroll on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("respects prefers-reduced-motion by showing every desk staffed and no pinned scenes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const desks = page.locator(".hero-floor .desk:visible");
    expect(await desks.count()).toBeGreaterThan(0);
    await expect(page.locator(".hero-floor .desk.on:visible")).toHaveCount(await desks.count());
    await expect(page.locator(".trace-track .step.active")).toHaveCount(5);
  });

  test("the roster reports the catalog size", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: /23 departments\. 136 named workers\./, includeHidden: true })).toBeAttached();
  });

  test("the process switcher defaults to sales follow-up and swaps the flow", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("tab", { includeHidden: true });
    await expect(tabs).toHaveCount(5);
    await expect(page.getByRole("tab", { name: "Sales follow-up", includeHidden: true })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#trace-title")).toContainText("A new lead comes in.");
    await page.locator("#trace-tab-support").dispatchEvent("click");
    await expect(page.locator("#trace-title")).toContainText("A ticket arrives.");
    await expect(page.locator(".trace-track .step")).toHaveCount(5);
  });
});
