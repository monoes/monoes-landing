import { test, expect, type Browser } from "@playwright/test";
import { createHash } from "node:crypto";
import { makeMpkg } from "./helpers/make-zip";
import { monoagentLogin, registerAndOnboard, unique } from "./helpers/library-auth";

type Item = {
  id: string;
  kind: string;
  slug: string;
  version: string;
  visibility: string;
  tags: string[];
  sha256: string;
  size: number;
  meta: Record<string, unknown>;
  owner: { username: string };
  url: string;
  artifact_url: string;
};

async function userToken(browser: Browser, baseURL: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const username = await registerAndOnboard(page);
  const tokens = await monoagentLogin(page, baseURL);
  await context.close();
  return { username, auth: { Authorization: `Bearer ${tokens.access_token}` } };
}

function upload(fields: Record<string, string>, file: Uint8Array | string, filename: string) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  form.set("file", new Blob([file as BlobPart]), filename);
  return form;
}

test("library API: create, visibility, versions, listing, gallery orgs, delete", async ({ browser, baseURL }) => {
  const api = (path: string) => new URL(`/api/library${path}`, baseURL).toString();
  const alice = await userToken(browser, baseURL!);
  const bob = await userToken(browser, baseURL!);

  // Anonymous: the public catalog lists; writes need a token.
  const anonList = await fetch(api("/items?per_page=5"));
  expect(anonList.status).toBe(200);
  expect(await anonList.json()).toMatchObject({ page: 1, per_page: 5 });
  expect((await fetch(api("/items?scope=mine"))).status).toBe(401);
  expect((await fetch(api("/items"), { method: "POST", body: upload({ kind: "org" }, "{}", "x.json") })).status).toBe(401);

  // Validation errors.
  const bad = await fetch(api("/items"), { method: "POST", headers: alice.auth, body: upload({ kind: "automation" }, "not a zip", "x.mpkg") });
  expect(bad.status).toBe(400);
  expect(((await bad.json()) as { error: { code: string } }).error.code).toBe("invalid_artifact");
  const big = await fetch(api("/items"), { method: "POST", headers: alice.auth, body: upload({ kind: "org" }, "x".repeat(500_001), "big.json") });
  expect(big.status).toBe(413);
  const official = await fetch(api("/items"), {
    method: "POST",
    headers: alice.auth,
    body: upload({ kind: "automation", visibility: "official" }, makeMpkg({ id: unique("e2e-") }), "a.mpkg"),
  });
  expect(official.status).toBe(403);

  // Create a private automation.
  const automationId = unique("e2e-");
  const mpkg = makeMpkg({ id: automationId });
  const created = await fetch(api("/items"), {
    method: "POST",
    headers: alice.auth,
    body: upload({ kind: "automation", tags: "Social, e2e" }, mpkg, `${automationId}.mpkg`),
  });
  expect(created.status).toBe(201);
  const item = (await created.json()) as Item;
  expect(item).toMatchObject({ kind: "automation", slug: automationId, version: "1.0.0", visibility: "private", tags: ["social", "e2e"] });
  expect(item.owner.username).toBe(alice.username);
  expect(item.sha256).toBe(createHash("sha256").update(mpkg).digest("hex"));
  expect(item.size).toBe(mpkg.byteLength);
  expect(item.meta).toMatchObject({ automation_id: automationId, site_domains: ["demo.example"], requires_native: true, policy_tier: "social" });
  expect(item.url).toMatch(new RegExp(`/library/automations/${automationId}$`));

  // Private: invisible to anonymous callers and other users, visible to the owner.
  expect((await fetch(api(`/items/${item.id}`))).status).toBe(404);
  expect((await fetch(api(`/items/${item.id}/artifact`))).status).toBe(401); // downloading needs a login
  expect((await fetch(api(`/items/${item.id}/artifact`), { headers: bob.auth })).status).toBe(404);
  expect((await fetch(api(`/items/${item.id}`), { headers: bob.auth })).status).toBe(404);
  expect((await fetch(api(`/items/automation/${automationId}`), { headers: alice.auth })).status).toBe(200);
  const artifact = await fetch(api(`/items/${item.id}/artifact`), { headers: alice.auth });
  expect(artifact.status).toBe(200);
  expect(artifact.headers.get("content-type")).toBe("application/zip");
  expect(artifact.headers.get("x-content-sha256")).toBe(item.sha256);
  expect(artifact.headers.get("content-length")).toBe(String(mpkg.byteLength));
  expect(artifact.headers.get("content-disposition")).toContain(`${automationId}-1.0.0.mpkg`);
  expect(Buffer.from(await artifact.arrayBuffer()).equals(Buffer.from(mpkg))).toBe(true);

  const mine = (await (await fetch(api("/items?scope=mine&kind=automation"), { headers: alice.auth })).json()) as { items: Item[] };
  expect(mine.items.map((i) => i.id)).toContain(item.id);
  const publicList = (await (await fetch(api(`/items?q=${automationId}`))).json()) as { items: Item[] };
  expect(publicList.items).toHaveLength(0);

  // Only the owner edits; making it public shows it to everyone.
  const bobPatch = await fetch(api(`/items/${item.id}`), {
    method: "PATCH",
    headers: { ...bob.auth, "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: "public" }),
  });
  expect(bobPatch.status).toBe(404);
  const patched = await fetch(api(`/items/${item.id}`), {
    method: "PATCH",
    headers: { ...alice.auth, "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: "public", description: "Now public" }),
  });
  expect(patched.status).toBe(200);
  expect(await patched.json()).toMatchObject({ visibility: "public", description: "Now public" });
  const bobPatch2 = await fetch(api(`/items/${item.id}`), {
    method: "PATCH",
    headers: { ...bob.auth, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Mine now" }),
  });
  expect(bobPatch2.status).toBe(403);
  const listed = (await (await fetch(api(`/items?kind=automation&q=${automationId}&tag=e2e`))).json()) as { items: Item[]; total: number };
  expect(listed.items.map((i) => i.id)).toEqual([item.id]);
  expect(listed.total).toBe(1);

  // New versions must be newer; old versions stay downloadable.
  const v11 = makeMpkg({ id: automationId, version: "1.1.0" });
  const put = await fetch(api(`/items/${item.id}/artifact`), { method: "PUT", headers: alice.auth, body: upload({}, v11, "v11.mpkg") });
  expect(put.status).toBe(200);
  expect(await put.json()).toMatchObject({ version: "1.1.0", sha256: createHash("sha256").update(v11).digest("hex") });
  const again = await fetch(api(`/items/${item.id}/artifact`), { method: "PUT", headers: alice.auth, body: upload({}, v11, "v11.mpkg") });
  expect(again.status).toBe(409);
  const otherId = await fetch(api(`/items/${item.id}/artifact`), {
    method: "PUT",
    headers: alice.auth,
    body: upload({}, makeMpkg({ id: "someone-else", version: "2.0.0" }), "x.mpkg"),
  });
  expect(otherId.status).toBe(400);
  const versions = (await (await fetch(api(`/items/${item.id}/versions`))).json()) as { versions: { version: string; artifact_url: string }[] };
  expect(versions.versions.map((v) => v.version)).toEqual(["1.1.0", "1.0.0"]);
  const old = await fetch(versions.versions[1].artifact_url, { headers: bob.auth });
  expect(old.headers.get("x-content-sha256")).toBe(item.sha256);

  // Workflows and orgs.
  const wf = await fetch(api("/items"), {
    method: "POST",
    headers: alice.auth,
    body: upload(
      { kind: "workflow", visibility: "public", version: "0.3.0" },
      JSON.stringify({ name: unique("Flow "), nodes: [{ type: "trigger.manual" }, { type: `${automationId}.read_page` }], connections: [] }),
      "flow.json",
    ),
  });
  expect(wf.status).toBe(201);
  expect(await wf.json()).toMatchObject({ kind: "workflow", version: "0.3.0", meta: { trigger_types: ["trigger.manual"] } });
  const orgName = unique("E2E Org ");
  const org = await fetch(api("/items"), {
    method: "POST",
    headers: alice.auth,
    body: upload({ kind: "org" }, JSON.stringify({ name: orgName, goal: "Test", roles: [{ id: "boss" }, { id: "dev" }] }), "org.json"),
  });
  expect(org.status).toBe(201);
  expect(await org.json()).toMatchObject({ kind: "org", visibility: "private", meta: { role_count: 2 } });
  const badOrg = await fetch(api("/items"), { method: "POST", headers: alice.auth, body: upload({ kind: "org" }, JSON.stringify({ roles: [] }), "o.json") });
  expect(badOrg.status).toBe(400);

  // Community gallery orgs show up as public kind=org items.
  const galleryName = unique("gallery-org-");
  const gallery = await fetch(new URL("/api/community/orgs", baseURL), {
    method: "POST",
    headers: { ...bob.auth, "Content-Type": "application/json" },
    body: JSON.stringify({ orgJson: JSON.stringify({ name: galleryName, goal: "Gallery goal", roles: [{ id: "boss" }] }) }),
  });
  expect(gallery.status).toBe(201);
  const galleryRow = (await gallery.json()) as { id: string; slug: string };
  const galleryItem = (await (await fetch(api(`/items/org/${galleryRow.slug}`))).json()) as Item;
  expect(galleryItem).toMatchObject({ id: galleryRow.id, kind: "org", visibility: "public", version: "1.0.0", meta: { gallery: true } });
  const orgList = (await (await fetch(api(`/items?kind=org&q=${galleryName}`))).json()) as { items: Item[] };
  expect(orgList.items.map((i) => i.id)).toEqual([galleryRow.id]);
  const galleryArtifact = await fetch(galleryItem.artifact_url, { headers: bob.auth });
  expect(galleryArtifact.headers.get("x-content-sha256")).toBe(galleryItem.sha256);
  const galleryPut = await fetch(api(`/items/${galleryRow.id}/artifact`), { method: "PUT", headers: bob.auth, body: upload({}, "{}", "o.json") });
  expect(galleryPut.status).toBe(409);

  // Delete: other users can't; the owner can.
  expect((await fetch(api(`/items/${item.id}`), { method: "DELETE", headers: bob.auth })).status).toBe(403);
  expect((await fetch(api(`/items/${item.id}`), { method: "DELETE", headers: alice.auth })).status).toBe(200);
  expect((await fetch(api(`/items/${item.id}`))).status).toBe(404);
  expect((await fetch(api(`/items/${galleryRow.id}`), { method: "DELETE", headers: bob.auth })).status).toBe(200);
});
