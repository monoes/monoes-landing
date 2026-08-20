import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canDeleteOrgUpload } from "./can-delete-org-upload.ts";

describe("org upload delete authorization", () => {
  it("canDeleteOrgUpload allows the uploader", () => {
    assert.equal(canDeleteOrgUpload({ id: "u1", role: "member" }, "u1"), true);
  });

  it("canDeleteOrgUpload allows moderators regardless of uploader", () => {
    assert.equal(canDeleteOrgUpload({ id: "u2", role: "moderator" }, "u1"), true);
  });

  it("canDeleteOrgUpload allows admins regardless of uploader", () => {
    assert.equal(canDeleteOrgUpload({ id: "u2", role: "admin" }, "u1"), true);
  });

  it("canDeleteOrgUpload rejects a different member who isn't the uploader", () => {
    assert.equal(canDeleteOrgUpload({ id: "u2", role: "member" }, "u1"), false);
  });
});
