import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { isModerator } from "./is-moderator.ts";

describe("isModerator", () => {
  it("rejects a null session", () => {
    assert.equal(isModerator(null), false);
  });

  it("rejects a session with no role", () => {
    assert.equal(isModerator({ user: {} }), false);
  });

  it("rejects a regular member", () => {
    assert.equal(isModerator({ user: { role: "member" } }), false);
  });

  it("accepts an admin", () => {
    assert.equal(isModerator({ user: { role: "admin" } }), true);
  });

  it("accepts a moderator", () => {
    assert.equal(isModerator({ user: { role: "moderator" } }), true);
  });

  it("rejects a blocked moderator", () => {
    assert.equal(isModerator({ user: { role: "moderator", blockedAt: new Date() } }), false);
  });

  it("rejects a blocked admin", () => {
    assert.equal(isModerator({ user: { role: "admin", blockedAt: new Date() } }), false);
  });
});
