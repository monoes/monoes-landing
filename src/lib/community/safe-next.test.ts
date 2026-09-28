import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loginUrlFor, safeNext } from "./safe-next.ts";

describe("safeNext", () => {
  it("keeps same-site paths with their query", () => {
    assert.equal(safeNext("/library/automations/instagram"), "/library/automations/instagram");
    assert.equal(safeNext("/community/workflows?sort=popular"), "/community/workflows?sort=popular");
  });

  it("falls back to /community for anything that could leave the site", () => {
    for (const bad of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/a\nb"]) {
      assert.equal(safeNext(bad), "/community", String(bad));
    }
  });

  it("builds the login URL with the path encoded", () => {
    assert.equal(loginUrlFor("/community/workflows?sort=popular"), "/community/login?next=%2Fcommunity%2Fworkflows%3Fsort%3Dpopular");
  });
});
