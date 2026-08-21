import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canDeleteOrgRun } from "./can-delete-org-run.ts";

describe("canDeleteOrgRun", () => {
  it("allows the run's own uploader", () => {
    assert.equal(canDeleteOrgRun({ id: "u1", role: "member" }, "u1"), true);
  });

  it("allows an admin who is not the uploader", () => {
    assert.equal(canDeleteOrgRun({ id: "u2", role: "admin" }, "u1"), true);
  });

  it("allows a moderator who is not the uploader", () => {
    assert.equal(canDeleteOrgRun({ id: "u2", role: "moderator" }, "u1"), true);
  });

  it("rejects a regular member who is not the uploader", () => {
    assert.equal(canDeleteOrgRun({ id: "u2", role: "member" }, "u1"), false);
  });

  it("rejects a user with no role who is not the uploader", () => {
    assert.equal(canDeleteOrgRun({ id: "u2" }, "u1"), false);
  });
});
