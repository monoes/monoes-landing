import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { guessKind, sha256Hex, slugify, validateArtifact } from "./validate.ts";
import { LibraryError } from "./types.ts";
import { listZipEntries, readZipEntry, ZipError } from "./zip.ts";
import { makeMpkg, makeZip } from "../../../tests/helpers/make-zip.ts";

const json = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));

async function rejects(p: Promise<unknown>, status: number, pattern?: RegExp) {
  await assert.rejects(p, (err: unknown) => {
    assert.ok(err instanceof LibraryError, `expected LibraryError, got ${err}`);
    assert.equal(err.status, status);
    if (pattern) assert.match(err.message, pattern);
    return true;
  });
}

describe("zip reader", () => {
  it("reads deflated and stored entries", async () => {
    for (const method of [0, 8] as const) {
      const zip = makeZip({ "a.txt": "hello", "dir/b.txt": "world".repeat(100) }, method);
      assert.deepEqual(listZipEntries(zip).map((e) => e.name), ["a.txt", "dir/b.txt"]);
      const b = await readZipEntry(zip, "dir/b.txt", 10_000);
      assert.equal(new TextDecoder().decode(b!), "world".repeat(100));
      assert.equal(await readZipEntry(zip, "missing", 100), null);
    }
  });

  it("refuses entries over the size cap and non-zips", async () => {
    const zip = makeZip({ "big.txt": "x".repeat(5000) });
    await assert.rejects(readZipEntry(zip, "big.txt", 100), ZipError);
    assert.throws(() => listZipEntries(new TextEncoder().encode("not a zip at all, just text")), ZipError);
  });
});

describe("validateArtifact: automation", () => {
  it("derives meta from automation.json", async () => {
    const a = await validateArtifact("automation", makeMpkg());
    assert.equal(a.slug, "demo-site");
    assert.equal(a.name, "Demo Site");
    assert.equal(a.version, "1.0.0");
    assert.equal(a.contentType, "application/zip");
    assert.equal(a.filename, "demo-site-1.0.0.mpkg");
    assert.deepEqual(a.meta, {
      automation_id: "demo-site",
      publisher: "Tester",
      site_domains: ["demo.example"],
      actions: ["read_page", "like_post"],
      requires_native: true,
      policy_tier: "social",
      native: "demo",
      engine: ">=0.70.0",
    });
  });

  it("marks packages without requires.native as not native", async () => {
    const a = await validateArtifact("automation", makeMpkg({ requires: {}, policy: undefined }));
    assert.equal(a.meta.requires_native, false);
    assert.equal(a.meta.policy_tier, "standard");
  });

  it("rejects a zip without automation.json, a bad manifest, and non-zips", async () => {
    await rejects(validateArtifact("automation", makeZip({ "x.json": "{}" })), 400, /no automation\.json/);
    await rejects(validateArtifact("automation", makeMpkg({ schema: "other/v1" })), 400, /schema/);
    await rejects(validateArtifact("automation", makeMpkg({ id: "Bad Id" })), 400, /id/);
    await rejects(validateArtifact("automation", makeMpkg({ version: "1.0" })), 400, /version/);
    await rejects(validateArtifact("automation", makeMpkg({ actions: "nope" })), 400, /actions/);
    await rejects(validateArtifact("automation", json({ a: 1 })), 400, /\.mpkg/);
  });

  it("returns 413 above 20 MB", async () => {
    await rejects(validateArtifact("automation", new Uint8Array(20 * 1024 * 1024 + 1)), 413);
  });
});

describe("validateArtifact: workflow", () => {
  it("derives node, trigger and automation lists", async () => {
    const a = await validateArtifact(
      "workflow",
      json({
        name: "Daily Digest",
        description: "Sends a digest",
        nodes: [{ type: "trigger.cron" }, { type: "instagram.like_posts" }, { type: "core.log" }, { type: "core.log" }],
        connections: [],
        automations: { instagram: { version: "1.0.0", sha256: "x", mpkg: "" } },
        unbundledAutomations: { legacy: { reason: "r" } },
      }),
    );
    assert.equal(a.slug, "daily-digest");
    assert.equal(a.filename, "daily-digest.json");
    assert.deepEqual(a.meta, {
      node_types: ["core.log", "instagram.like_posts", "trigger.cron"],
      trigger_types: ["trigger.cron"],
      required_automations: ["instagram", "legacy"],
    });
  });

  it("rejects non-workflow JSON", async () => {
    await rejects(validateArtifact("workflow", new TextEncoder().encode("{oops")), 400, /JSON/);
    await rejects(validateArtifact("workflow", json({ name: "x" })), 400, /nodes/);
    await rejects(validateArtifact("workflow", json({ nodes: [{}] })), 400, /type/);
  });
});

describe("validateArtifact: org", () => {
  it("accepts an OrgDefSchema org and derives meta", async () => {
    const a = await validateArtifact("org", json({ name: "Growth Team", goal: "Grow", topology: "hierarchical", roles: [{ id: "boss" }, { id: "dev" }] }));
    assert.equal(a.slug, "growth-team");
    assert.equal(a.description, "Grow");
    assert.deepEqual(a.meta, { role_count: 2, topology: "hierarchical" });
  });

  it("rejects orgs that fail the schema or exceed 500 KB", async () => {
    await rejects(validateArtifact("org", json({ roles: [] })), 400, /Org JSON/);
    await rejects(validateArtifact("org", new Uint8Array(500_001)), 413);
  });
});

describe("helpers", () => {
  it("sha256Hex matches the known digest of 'abc'", async () => {
    assert.equal(
      await sha256Hex(new TextEncoder().encode("abc")),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("slugify falls back when nothing is left", () => {
    assert.equal(slugify("Café Déjà Vu!", "x"), "cafe-deja-vu");
    assert.equal(slugify("!!!", "workflow"), "workflow");
  });

  it("guessKind tells the three artifact kinds apart", () => {
    assert.equal(guessKind("x.mpkg", new Uint8Array()), "automation");
    assert.equal(guessKind("x.json", json({ nodes: [] })), "workflow");
    assert.equal(guessKind("x.json", json({ roles: [] })), "org");
    assert.equal(guessKind("x.json", json({})), null);
  });
});
