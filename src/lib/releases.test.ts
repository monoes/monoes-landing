import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeVersion, toRelease } from "./releases.ts";

test("normalizeVersion strips a leading v and product-name prefixes", () => {
  assert.equal(normalizeVersion("v2.16.4"), "2.16.4");
  assert.equal(normalizeVersion("2.16.4"), "2.16.4");
  assert.equal(normalizeVersion("MonoClip v0.2.19"), "0.2.19");
  assert.equal(normalizeVersion("Monotask v1.4.0"), "1.4.0");
  assert.equal(normalizeVersion("v1.0.0-beta.2"), "1.0.0-beta.2");
  assert.equal(normalizeVersion("nightly"), null);
});

test("toRelease maps GitHub fields and rejects malformed entries", () => {
  const r = toRelease({
    tag_name: "v0.66.0",
    name: "",
    html_url: "https://github.com/monoes/mono-agent/releases/tag/v0.66.0",
    published_at: "2026-09-20T10:00:00Z",
    prerelease: true,
    body: "- fix",
  });
  assert.deepEqual(r, {
    tag: "v0.66.0",
    version: "0.66.0",
    name: "v0.66.0",
    url: "https://github.com/monoes/mono-agent/releases/tag/v0.66.0",
    publishedAt: "2026-09-20T10:00:00Z",
    prerelease: true,
    body: "- fix",
  });
  assert.equal(toRelease({ name: "x" }), null);
});
