import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canEditOrgUpload } from "./can-edit-org-upload.ts";

describe("org upload edit authorization", () => {
  it("canEditOrgUpload allows the uploader", () => {
    assert.equal(canEditOrgUpload({ id: "u1", role: "member" }, "u1"), true);
  });

  it("canEditOrgUpload allows moderators regardless of uploader", () => {
    assert.equal(canEditOrgUpload({ id: "u2", role: "moderator" }, "u1"), true);
  });

  it("canEditOrgUpload allows admins regardless of uploader", () => {
    assert.equal(canEditOrgUpload({ id: "u2", role: "admin" }, "u1"), true);
  });

  it("canEditOrgUpload rejects a different member who isn't the uploader", () => {
    assert.equal(canEditOrgUpload({ id: "u2", role: "member" }, "u1"), false);
  });
});
