import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bumpPatch, compareSemver, isSemver } from "./semver.ts";
import { canDelete, canEdit, canSetVisibility, canView } from "./access.ts";
import { contentDisposition, parseItemPath, parseListQuery, parseTags } from "./http.ts";
import { byScoreDesc, byUpdatedDesc, galleryOrgToApiItem, installRef, toApiItem } from "./serialize.ts";
import { LibraryError, parseKind } from "./types.ts";

const status = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    if (err instanceof LibraryError) return err.status;
    throw err;
  }
  return 0;
};

describe("semver", () => {
  it("validates, compares and bumps", () => {
    assert.ok(isSemver("1.4.0"));
    assert.ok(isSemver("1.4.0-beta.2"));
    assert.ok(!isSemver("1.4"));
    assert.ok(!isSemver("v1.4.0"));
    assert.ok(compareSemver("1.10.0", "1.9.9") > 0);
    assert.ok(compareSemver("1.0.0", "1.0.0-rc.1") > 0);
    assert.ok(compareSemver("1.0.0-rc.2", "1.0.0-rc.10") < 0);
    assert.equal(compareSemver("2.0.0+build", "2.0.0"), 0);
    assert.equal(bumpPatch("1.4.2"), "1.4.3");
    assert.equal(bumpPatch("1.4.2-beta"), "1.4.2");
  });
});

describe("access", () => {
  const owner = { id: "u1", role: "member" };
  const other = { id: "u2", role: "member" };
  const admin = { id: "a1", role: "admin" };

  it("hides private items from everyone but the owner", () => {
    const item = { ownerId: "u1", visibility: "private" as const };
    assert.ok(canView(item, owner));
    assert.ok(!canView(item, other));
    assert.ok(!canView(item, admin));
    assert.ok(!canView(item, null));
    assert.ok(canView({ ownerId: "u1", visibility: "public" }, null));
  });

  it("lets owners edit, admins manage official items and delete anything", () => {
    assert.ok(canEdit({ ownerId: "u1", visibility: "public" }, owner));
    assert.ok(!canEdit({ ownerId: "u1", visibility: "public" }, admin));
    assert.ok(canEdit({ ownerId: "u1", visibility: "official" }, admin));
    assert.ok(canDelete({ ownerId: "u1", visibility: "private" }, admin));
    assert.ok(!canDelete({ ownerId: "u1", visibility: "public" }, other));
    assert.ok(!canEdit({ ownerId: "u1", visibility: "public" }, { ...owner, blockedAt: new Date() }));
  });

  it("reserves official visibility for admins", () => {
    assert.ok(canSetVisibility("official", admin));
    assert.ok(!canSetVisibility("official", owner));
    assert.ok(canSetVisibility("public", owner));
    assert.ok(!canSetVisibility("official", { ...admin, blockedAt: new Date() }));
  });
});

describe("http", () => {
  it("parses list queries with defaults", () => {
    const q = parseListQuery(new URLSearchParams(""));
    assert.deepEqual(q, { kind: null, scope: "public", q: "", tag: null, page: 1, perPage: 24, sort: "latest" });
    const q2 = parseListQuery(new URLSearchParams("kind=automations&scope=official&q=%20insta%20&tag=Social&page=2&per_page=100&sort=popular"));
    assert.deepEqual(q2, { kind: "automation", scope: "official", q: "insta", tag: "social", page: 2, perPage: 100, sort: "popular" });
  });

  it("rejects bad list queries with 400", () => {
    assert.equal(status(() => parseListQuery(new URLSearchParams("per_page=101"))), 400);
    assert.equal(status(() => parseListQuery(new URLSearchParams("page=0"))), 400);
    assert.equal(status(() => parseListQuery(new URLSearchParams("kind=plugin"))), 400);
    assert.equal(status(() => parseListQuery(new URLSearchParams("scope=all"))), 400);
    assert.equal(status(() => parseListQuery(new URLSearchParams("sort=hot"))), 400);
  });

  it("normalizes tags", () => {
    assert.deepEqual(parseTags(" Social, scraping ,social,"), ["social", "scraping"]);
    assert.deepEqual(parseTags(["a", "b"]), ["a", "b"]);
    assert.equal(status(() => parseTags("no spaces allowed")), 400);
    assert.equal(status(() => parseTags(Array.from({ length: 11 }, (_, i) => `t${i}`))), 400);
  });

  it("parses item paths", () => {
    assert.deepEqual(parseItemPath(["abc"]), { ref: { id: "abc" }, sub: null });
    assert.deepEqual(parseItemPath(["abc", "artifact"]), { ref: { id: "abc" }, sub: "artifact" });
    assert.deepEqual(parseItemPath(["abc", "versions"]), { ref: { id: "abc" }, sub: "versions" });
    assert.deepEqual(parseItemPath(["automation", "instagram"]), { ref: { kind: "automation", slug: "instagram" }, sub: null });
    assert.deepEqual(parseItemPath(["orgs", "team", "artifact"]), { ref: { kind: "org", slug: "team" }, sub: "artifact" });
    assert.equal(parseItemPath(["abc", "nope"]), null);
    assert.equal(parseItemPath(["workflow", "x", "nope"]), null);
    assert.equal(parseItemPath(["a", "b", "c", "d"]), null);
  });

  it("builds a safe Content-Disposition", () => {
    assert.equal(contentDisposition("insta-1.0.0.mpkg"), `attachment; filename="insta-1.0.0.mpkg"; filename*=UTF-8''insta-1.0.0.mpkg`);
    assert.match(contentDisposition('a"b é.json'), /filename="a_b _\.json"/);
  });

  it("parseKind accepts singular and plural", () => {
    assert.equal(parseKind("orgs"), "org");
    assert.equal(parseKind("Workflow"), "workflow");
    assert.equal(parseKind("x"), null);
  });
});

describe("serialize", () => {
  const date = new Date("2026-09-01T10:00:00Z");
  it("maps a library row to the API Item", () => {
    const item = toApiItem(
      {
        id: "i1",
        kind: "automation",
        slug: "instagram",
        name: "Instagram",
        description: "d",
        visibility: "official",
        tagsJson: '["social"]',
        ownerId: "u1",
        version: "1.4.0",
        sha256: "ab",
        size: 10,
        metaJson: '{"automation_id":"instagram"}',
        createdAt: date,
        updatedAt: date,
      },
      { id: "u1", username: "monoes", name: "Monoes" },
      "https://monoes.me",
    );
    assert.equal(item.url, "https://monoes.me/library/automations/instagram");
    assert.equal(item.artifact_url, "https://monoes.me/api/library/items/i1/artifact");
    assert.deepEqual(item.tags, ["social"]);
    assert.deepEqual(item.meta, { automation_id: "instagram" });
    assert.equal(item.created_at, "2026-09-01T10:00:00.000Z");
  });

  it("maps a gallery org to a public kind=org Item", () => {
    const item = galleryOrgToApiItem(
      {
        id: "g1",
        slug: "growth-team",
        name: "Growth Team",
        goal: "Grow",
        tagline: null,
        description: null,
        topology: "mesh",
        roleCount: 3,
        orgJson: "{}",
        uploaderId: "u9",
        createdAt: date,
      },
      undefined,
      { sha256: "cd", size: 2 },
      "http://localhost:3100",
    );
    assert.equal(item.visibility, "public");
    assert.equal(item.version, "1.0.0");
    assert.equal(item.description, "Grow");
    assert.equal(item.owner.id, "u9");
    assert.deepEqual(item.meta, { role_count: 3, topology: "mesh", gallery: true });
    assert.equal(item.url, "http://localhost:3100/library/orgs/growth-team");
  });

  it("installs public items by a stable slug and everything else by id", () => {
    const base = { id: "i1", kind: "automation" as const, slug: "instagram", visibility: "official" as const, meta: { automation_id: "instagram" } };
    assert.equal(installRef(base), "instagram");
    assert.equal(installRef({ ...base, visibility: "private" }), "i1");
    assert.equal(installRef({ ...base, slug: "instagram-2" }), "i1");
    assert.equal(installRef({ ...base, kind: "workflow", slug: "daily-digest", meta: {} }), "daily-digest");
    assert.equal(installRef({ ...base, kind: "org", slug: "growth-team-2", visibility: "public", meta: {} }), "i1");
  });

  it("ranks by score, then newest", () => {
    const mk = (id: string, score: number, updated_at: string) => ({ id, score, updated_at }) as Parameters<typeof byScoreDesc>[0];
    const sorted = [mk("a", 1, "2026-01-01"), mk("b", 3, "2026-01-01"), mk("c", 1, "2026-02-01")].sort(byScoreDesc);
    assert.deepEqual(sorted.map((i) => i.id), ["b", "c", "a"]);
  });

  it("sorts newest first with a stable tiebreak", () => {
    const mk = (id: string, updated_at: string) => ({ id, updated_at }) as Parameters<typeof byUpdatedDesc>[0];
    const sorted = [mk("b", "2026-01-01"), mk("a", "2026-01-01"), mk("c", "2026-02-01")].sort(byUpdatedDesc);
    assert.deepEqual(sorted.map((i) => i.id), ["c", "a", "b"]);
  });
});
