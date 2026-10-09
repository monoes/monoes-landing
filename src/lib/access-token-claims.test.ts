import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { accessTokenClaims, PLAN_FREE } from "./access-token-claims.ts";

describe("accessTokenClaims", () => {
  it("puts everyone on the free plan until plans exist", () => {
    assert.equal(PLAN_FREE, "free");
    assert.deepEqual(accessTokenClaims(), { plan: "free" });
  });
});
