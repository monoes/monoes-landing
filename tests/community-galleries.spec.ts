import { test, expect, type Page } from "@playwright/test";
import { makeMpkg } from "./helpers/make-zip";
import { registerAndOnboard, unique } from "./helpers/library-auth";

type Item = { id: string; slug: string; score: number; kind: string };

async function publish(page: Page, kind: "workflow" | "automation", visibility: "public" | "private", tag: string) {
  const buffer =
    kind === "automation"
      ? Buffer.from(makeMpkg({ id: unique("gal-"), name: `Gallery ${tag}` }))
      : Buffer.from(JSON.stringify({ name: `Gallery ${tag}`, description: `A ${tag} flow`, nodes: [{ type: "trigger.manual" }] }));
  const res = await page.request.post("/api/library/items", {
    multipart: {
      kind,
      visibility,
      ...(kind === "automation" ? { description: `A ${tag} automation` } : {}),
      file: { name: kind === "automation" ? "a.mpkg" : "w.json", mimeType: "application/octet-stream", buffer },
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as Item;
}

test("workflow and web automation galleries: listing, votes, comments, Popular sort and the feed", async ({ browser }) => {
  const tag = unique("t");
  const aliceCtx = await browser.newContext();
  const alice = await aliceCtx.newPage();
  await registerAndOnboard(alice);
  const flow = await publish(alice, "workflow", "public", tag);
  const auto = await publish(alice, "automation", "public", tag);
  const hidden = await publish(alice, "workflow", "private", `${tag}-hidden`);

  const bobCtx = await browser.newContext();
  const bob = await bobCtx.newPage();
  const bobName = await registerAndOnboard(bob);

  // Votes: private items and anonymous callers are refused.
  const vote = (page: Page, id: string, value: number) =>
    page.request.post(`/api/community/library/${id}/vote`, { data: { value } });
  expect((await vote(bob, hidden.id, 1)).status()).toBe(404);
  expect((await bob.context().request.fetch(`/api/community/library/${flow.id}/vote`, { method: "POST", data: { value: 1 }, headers: { cookie: "" } })).status()).toBe(401);
  expect(await (await vote(bob, auto.id, 1)).json()).toEqual({ score: 1, myVote: 1 });
  expect(await (await vote(alice, auto.id, 1)).json()).toEqual({ score: 2, myVote: 1 });
  expect(await (await vote(alice, auto.id, 0)).json()).toEqual({ score: 1, myVote: 0 });

  // The gallery lists public items only; Popular ranks by votes.
  await bob.goto(`/community/workflows?q=${tag}`);
  await expect(bob.getByRole("heading", { name: "Workflow gallery" })).toBeVisible();
  await expect(bob.getByText(`Gallery ${tag}`, { exact: true })).toBeVisible();
  await expect(bob.getByText(`Gallery ${tag}-hidden`)).toHaveCount(0);
  const popular = (await (await bob.request.get(`/api/library/items?sort=popular&q=${tag}`)).json()) as { items: Item[] };
  expect(popular.items.map((i) => i.id)).toEqual([auto.id, flow.id]);
  expect(popular.items[0].score).toBe(1);

  // Vote from the gallery card.
  const card = bob.locator("div.rounded-lg", { hasText: `Gallery ${tag}` }).first();
  await card.getByRole("button", { name: "Upvote" }).click();
  await expect(card.getByRole("button", { name: "Upvote" })).toHaveAttribute("aria-pressed", "true");
  await expect(card.getByText("1", { exact: true })).toBeVisible();

  // Detail page: votes and comments.
  // Wait for hydration: text typed into the server-rendered textarea before React takes over is reset.
  await bob.goto(`/library/automations/${auto.slug}`, { waitUntil: "networkidle" });
  const votes = bob.getByTestId("item-votes");
  await expect(votes.getByRole("button", { name: "Upvote" })).toHaveAttribute("aria-pressed", "true");
  // On a cold dev server React can still be hydrating after networkidle, and
  // hydration resets the controlled textarea; retry until the comment lands.
  await expect(async () => {
    await bob.getByPlaceholder("Add a comment…").fill(`Nice one ${tag}`);
    await bob.getByRole("button", { name: "Post comment" }).click();
    await expect(bob.getByText(`Nice one ${tag}`).first()).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30_000 });
  await bob.reload();
  await expect(bob.getByText(`Nice one ${tag}`).first()).toBeVisible();
  await expect(bob.getByText(bobName, { exact: false }).first()).toBeVisible();

  // The community feed carries both kinds with their chips and library links.
  const feed = (await (await bob.request.get("/api/community/feed")).json()) as { items: { id: string; type: string; url?: string; score: number }[] };
  const fromFeed = new Map(feed.items.map((i) => [i.id, i]));
  expect(fromFeed.get(flow.id)).toMatchObject({ type: "workflow", url: `/library/workflows/${flow.slug}`, score: 1 });
  expect(fromFeed.get(auto.id)).toMatchObject({ type: "automation", url: `/library/automations/${auto.slug}`, score: 1 });
  expect(fromFeed.has(hidden.id)).toBe(false);
  await bob.goto("/community");
  const feedCard = bob.locator("section[aria-labelledby=feed-title] article", { hasText: `Gallery ${tag}` }).filter({ hasText: "Web automation" }).first();
  await expect(feedCard).toBeVisible();
  await expect(feedCard.getByRole("link")).toHaveAttribute("href", `/library/automations/${auto.slug}`);

  // Deleting an item takes its votes and comments with it.
  expect((await alice.request.delete(`/api/library/items/${auto.id}`)).status()).toBe(200);
  expect((await vote(bob, auto.id, 1)).status()).toBe(404);

  await aliceCtx.close();
  await bobCtx.close();
});

test("the galleries are public and linked from /community", async ({ page }) => {
  await page.goto("/community");
  for (const name of ["Org gallery", "Workflow gallery", "Web automation gallery"]) {
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await page.getByRole("link", { name: "Web automation gallery", exact: true }).click();
  await expect(page).toHaveURL(/\/community\/automations$/);
  await expect(page.getByRole("heading", { name: "Web automation gallery" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in to share" })).toBeVisible();
  await page.getByRole("link", { name: "Popular" }).click();
  await expect(page).toHaveURL(/sort=popular/);
  await page.goto("/community/workflows");
  await expect(page.getByRole("heading", { name: "Workflow gallery" })).toBeVisible();
});

test("sharing from a gallery opens the upload form with the kind and Public preselected", async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto("/community/workflows");
  await page.getByRole("link", { name: "Share a workflow" }).click();
  await expect(page).toHaveURL(/\/library\/upload\?kind=workflow&visibility=public$/);
  await expect(page.getByLabel("Kind")).toHaveValue("workflow");
  await expect(page.getByLabel("Visibility")).toHaveValue("public");
});
