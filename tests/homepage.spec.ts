import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("hero headline renders in the server HTML without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Automate the work");
    await context.close();
  });

  test("both CTAs are present and route correctly", async ({ page }) => {
    await page.goto("/");

    const githubCta = page.getByRole("link", { name: /star on github/i }).first();
    await expect(githubCta).toHaveAttribute("href", "https://github.com/monoes/monomind");

    const discoveryCta = page.getByRole("link", { name: /book a discovery call/i }).first();
    await expect(discoveryCta).toHaveAttribute("href", "/workforce");
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

  test("respects prefers-reduced-motion by showing the hero diagram unanimated", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const firstNode = page.locator("svg [data-node]").first();
    await expect(firstNode).toHaveCSS("opacity", "1");
  });
});
