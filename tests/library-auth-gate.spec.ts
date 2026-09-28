import { test, expect, type Page } from "@playwright/test";
import { makeMpkg } from "./helpers/make-zip";
import { monoagentLogin, registerAndOnboard, unique } from "./helpers/library-auth";

const LOGIN_REQUIRED = { error: { code: "unauthorized", message: "Log in to monoes.me to browse the library" } };

type Item = { id: string; slug: string; kind: string; artifact_url: string };

async function publishPublicAutomation(page: Page): Promise<Item> {
  const res = await page.request.post("/api/library/items", {
    multipart: {
      kind: "automation",
      visibility: "public",
      file: { name: "a.mpkg", mimeType: "application/zip", buffer: Buffer.from(makeMpkg({ id: unique("gate-") })) },
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as Item;
}

async function callMcp(baseURL: string, body: unknown, authHeader?: string) {
  const res = await fetch(new URL("/api/mcp", baseURL), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...(authHeader ? { authorization: authHeader } : {}) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text.split("\n").find((l) => l.startsWith("data:")) ?? text;
  return JSON.parse(data.replace(/^data:\s*/, ""));
}

test("every library endpoint refuses anonymous callers; sessions and library:read tokens get in", async ({ page, browser, baseURL }) => {
  await registerAndOnboard(page);
  const item = await publishPublicAutomation(page);
  const api = (p: string) => new URL(`/api/library${p}`, baseURL).toString();

  // Anonymous: every read and write is a 401 with the log-in message.
  for (const path of ["/items", "/items?scope=official", `/items/${item.id}`, `/items/automation/${item.slug}`, `/items/${item.id}/artifact`, `/items/${item.id}/versions`, "/me"]) {
    const res = await fetch(api(path));
    expect(res.status, path).toBe(401);
    expect(await res.json(), path).toEqual(LOGIN_REQUIRED);
  }
  for (const [method, path] of [["POST", "/items"], ["PUT", `/items/${item.id}/artifact`], ["PATCH", `/items/${item.id}`], ["DELETE", `/items/${item.id}`]] as const) {
    expect((await fetch(api(path), { method })).status, `${method} ${path}`).toBe(401);
  }
  // Community votes and comments on library items need a login too.
  for (const path of [`/api/community/library/${item.id}/vote`, `/api/community/library/${item.id}/comments`]) {
    const res = await fetch(new URL(path, baseURL), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 1, body: "hi" }) });
    expect(res.status, path).toBe(401);
  }

  // A web session reads everything, the artifact included.
  expect((await page.request.get(`/api/library/items?q=${item.slug}`)).status()).toBe(200);
  expect((await page.request.get(`/api/library/items/${item.id}/artifact`)).status()).toBe(200);

  // A MonoAgent token with library:read reads; a token without it is refused.
  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await registerAndOnboard(other);
  const full = await monoagentLogin(other, baseURL!);
  const bearer = { Authorization: `Bearer ${full.access_token}` };
  expect((await fetch(api(`/items/${item.id}`), { headers: bearer })).status).toBe(200);
  expect((await fetch(api(`/items/${item.id}/artifact`), { headers: bearer })).status).toBe(200);
  // A second user: the first already consented to the wider scopes, so the consent screen would be skipped.
  const third = await ctx.newPage();
  await ctx.clearCookies();
  await registerAndOnboard(third);
  const communityOnly = await monoagentLogin(third, baseURL!, "openid community:read");
  const res = await fetch(api("/items"), { headers: { Authorization: `Bearer ${communityOnly.access_token}` } });
  expect(res.status).toBe(403);
  expect(((await res.json()) as { error: { code: string } }).error.code).toBe("insufficient_scope");

  // MCP: the library tools need an authenticated caller.
  const call = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_library_items", arguments: { q: item.slug } } };
  const anon = await callMcp(baseURL!, call);
  expect(anon.result.isError).toBe(true);
  expect(anon.result.content[0].text).toBe("Log in to monoes.me to browse the library");
  const authed = await callMcp(baseURL!, call, `Bearer ${full.access_token}`);
  expect(authed.result.isError).not.toBe(true);
  expect(JSON.parse(authed.result.content[0].text).items.map((i: Item) => i.id)).toEqual([item.id]);
  await ctx.close();
});

test("gated pages send visitors to login and bring them back to the same page", async ({ page, browser }) => {
  const setup = await browser.newPage();
  const username = await registerAndOnboard(setup);
  const item = await publishPublicAutomation(setup);
  await setup.close();

  for (const path of ["/library", "/community/workflows", "/community/automations", "/community/orgs", "/library/upload"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(new RegExp(`/community/login\\?next=${encodeURIComponent(path)}$`));
  }

  const target = `/library/automations/${item.slug}`;
  await page.goto(target);
  await expect(page).toHaveURL(new RegExp(`/community/login\\?next=${encodeURIComponent(target)}$`));
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await expect(page.getByRole("button", { name: "Add to MonoAgent" })).toBeVisible();

  // The query survives the round trip too.
  await page.context().clearCookies();
  await page.goto("/library/upload?kind=workflow&visibility=public");
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/library\/upload\?kind=workflow&visibility=public$/);
  await expect(page.getByLabel("Kind")).toHaveValue("workflow");
});

test("the login page ignores off-site next= values", async ({ page, browser }) => {
  const setup = await browser.newPage();
  const username = await registerAndOnboard(setup);
  await setup.close();
  await page.goto(`/community/login?next=${encodeURIComponent("//evil.example/x")}`);
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);
});

test("anonymous visitors see no orgs, workflows or web automations in the feed or on the hub", async ({ page, browser, baseURL }) => {
  const setup = await browser.newPage();
  await registerAndOnboard(setup);
  const item = await publishPublicAutomation(setup);

  const anonFeed = (await (await fetch(new URL("/api/community/feed", baseURL))).json()) as { items: { id: string; type: string }[] };
  expect(anonFeed.items.filter((i) => ["org", "workflow", "automation"].includes(i.type))).toEqual([]);
  const memberFeed = (await (await setup.request.get("/api/community/feed")).json()) as { items: { id: string; type: string }[] };
  expect(memberFeed.items.map((i) => i.id)).toContain(item.id);

  await page.goto("/community");
  await expect(page.getByRole("heading", { name: "What's happening" })).toBeVisible();
  await expect(page.locator("section[aria-labelledby=feed-title] article", { hasText: "Web automation" })).toHaveCount(0);
  await expect(page.getByText("Members only").first()).toBeVisible();
  // The gallery links stay, and lead to login.
  await page.getByRole("link", { name: "Workflow gallery", exact: true }).first().click();
  await expect(page).toHaveURL(/\/community\/login\?next=%2Fcommunity%2Fworkflows$/);
  await setup.close();
});

test("gated pages are noindex, and the sitemap no longer lists them", async ({ page, baseURL }) => {
  await registerAndOnboard(page);
  for (const path of ["/library", "/community/workflows", "/community/automations", "/community/orgs"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute("content", /noindex/);
  }
  const sitemap = await (await fetch(new URL("/sitemap.xml", baseURL))).text();
  expect(sitemap).not.toMatch(/monoes\.me\/(library|community\/orgs|community\/workflows|community\/automations)/);
  const robots = await (await fetch(new URL("/robots.txt", baseURL))).text();
  expect(robots).toContain("Disallow: /library");
});
