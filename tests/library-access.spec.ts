import { test, expect, type Page } from "@playwright/test";
import { makeMpkg } from "./helpers/make-zip";
import { monoagentLogin, registerAndOnboard, unique } from "./helpers/library-auth";

// Browsing is open to everyone; voting, commenting and downloading need a login.

type Item = { id: string; slug: string; artifact_url: string };

async function publishPublicAutomation(page: Page): Promise<Item> {
  const res = await page.request.post("/api/library/items", {
    multipart: {
      kind: "automation",
      visibility: "public",
      file: { name: "a.mpkg", mimeType: "application/zip", buffer: Buffer.from(makeMpkg({ id: unique("open-") })) },
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as Item;
}

async function logInHere(page: Page, username: string) {
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
}

test("anyone can browse the library API; downloading, voting and commenting need a login", async ({ page, browser, baseURL }) => {
  await registerAndOnboard(page);
  const item = await publishPublicAutomation(page);
  const api = (p: string) => new URL(`/api/library${p}`, baseURL).toString();

  for (const path of ["/items", "/items?scope=official", `/items/${item.id}`, `/items/automation/${item.slug}`, `/items/${item.id}/versions`]) {
    expect((await fetch(api(path))).status, path).toBe(200);
  }
  const download = await fetch(api(`/items/${item.id}/artifact`));
  expect(download.status).toBe(401);
  expect(await download.json()).toEqual({ error: { code: "unauthorized", message: "Log in to monoes.me to download" } });
  for (const path of [`/api/community/library/${item.id}/vote`, `/api/community/library/${item.id}/comments`]) {
    const res = await fetch(new URL(path, baseURL), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 1, body: "hi" }) });
    expect(res.status, path).toBe(401);
  }

  // Logged in: a web session and a MonoAgent token both download.
  expect((await page.request.get(`/api/library/items/${item.id}/artifact`)).status()).toBe(200);
  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await registerAndOnboard(other);
  const tokens = await monoagentLogin(other, baseURL!);
  expect((await fetch(api(`/items/${item.id}/artifact`), { headers: { Authorization: `Bearer ${tokens.access_token}` } })).status).toBe(200);
  await ctx.close();
});

test("logged-out visitors browse galleries, orgs, bugs, features and library pages without being sent to login", async ({ page, browser }) => {
  const setup = await browser.newPage();
  await registerAndOnboard(setup);
  const item = await publishPublicAutomation(setup);
  await setup.close();

  for (const path of ["/community", "/community/orgs", "/community/workflows", "/community/automations", "/community/bugs", "/community/features", "/library", `/library/automations/${item.slug}`]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(new RegExp(`${path.replace(/[?]/g, "\\?")}$`));
  }
  // The feed shows gallery items to everyone.
  const feed = (await (await page.request.get("/api/community/feed")).json()) as { items: { id: string }[] };
  expect(feed.items.map((i) => i.id)).toContain(item.id);
});

test("voting and downloading while logged out go to login and come back to the same page", async ({ page, browser }) => {
  const setup = await browser.newPage();
  const username = await registerAndOnboard(setup);
  const item = await publishPublicAutomation(setup);
  await setup.close();
  const itemPage = `/library/automations/${item.slug}`;

  await page.goto(itemPage);
  await page.getByTestId("item-votes").getByRole("button", { name: "Upvote" }).click();
  await expect(page).toHaveURL(new RegExp(`/community/login\\?next=${encodeURIComponent(itemPage)}$`));
  await expect(page.getByText("Log in to vote, comment or download.")).toBeVisible();
  await logInHere(page, username);
  await expect(page).toHaveURL(new RegExp(`${itemPage}$`));
  await expect(page.getByRole("link", { name: "Download", exact: true })).toBeVisible();

  await page.context().clearCookies();
  await page.goto(itemPage);
  await page.getByRole("link", { name: "Log in to download", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/community/login\\?next=${encodeURIComponent(itemPage)}$`));
  await page.goto(itemPage);
  await page.getByRole("button", { name: "Log in to leave a comment" }).click();
  await expect(page).toHaveURL(new RegExp(`/community/login\\?next=${encodeURIComponent(itemPage)}$`));
});

test("pages that act as you still need a login, and return there after", async ({ page, browser }) => {
  const setup = await browser.newPage();
  const username = await registerAndOnboard(setup);
  await setup.close();
  await page.goto("/library/upload?kind=workflow&visibility=public");
  await expect(page).toHaveURL(/\/community\/login\?next=%2Flibrary%2Fupload%3Fkind%3Dworkflow%26visibility%3Dpublic$/);
  await logInHere(page, username);
  await expect(page).toHaveURL(/\/library\/upload\?kind=workflow&visibility=public$/);
  await expect(page.getByLabel("Kind")).toHaveValue("workflow");
});

test("the login page ignores off-site next= values", async ({ page, browser }) => {
  const setup = await browser.newPage();
  const username = await registerAndOnboard(setup);
  await setup.close();
  await page.goto(`/community/login?next=${encodeURIComponent("//evil.example/x")}`);
  await logInHere(page, username);
  await expect(page).toHaveURL(/\/community$/);
});
