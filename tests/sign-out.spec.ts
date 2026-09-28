import { test, expect } from "@playwright/test";
import { registerAndOnboard } from "./helpers/library-auth";

// Regression: signing out while already on "/" left the avatar in the navbar
// (a client-side push to the same URL didn't reset the cached signed-in state).
for (const start of ["/", "/community", "/blog"]) {
  test(`signing out from ${start} leaves you signed out on the homepage`, async ({ page }) => {
    await registerAndOnboard(page);
    await page.goto(start);
    const avatar = page.getByRole("button", { name: /^Account menu for/ });
    await avatar.click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: /^Account menu for/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.filter((c) => c.name.includes("session_token"))).toEqual([]);
  });
}
