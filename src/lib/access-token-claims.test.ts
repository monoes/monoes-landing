import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { accessTokenClaims, PLAN_FREE } from "./access-token-claims.ts";

describe("accessTokenClaims", () => {
  it("puts everyone on the free plan until plans exist", () => {
    assert.equal(PLAN_FREE, "free");
    assert.deepEqual(accessTokenClaims({ id: "u1", blockedAt: null }), { plan: "free" });
    assert.deepEqual(accessTokenClaims({ id: "u1" }), { plan: "free" });
  });

  it("has no user to look at for a machine-to-machine token", () => {
    assert.deepEqual(accessTokenClaims(undefined), { plan: "free" });
    assert.deepEqual(accessTokenClaims(null), { plan: "free" });
  });

  it("refuses a blocked account with invalid_grant, the answer mono-agent reads as a refusal", () => {
    assert.throws(
      () => accessTokenClaims({ id: "u1", blockedAt: new Date() }),
      (err: { body?: { error?: string; error_description?: string }; statusCode?: number }) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.body?.error, "invalid_grant");
        assert.match(err.body?.error_description ?? "", /blocked/);
        return true;
      },
    );
  });
});
