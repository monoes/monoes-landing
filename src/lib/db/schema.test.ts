import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { user, session, account, verification, feature, featureVote } from "./schema.ts";

describe("db schema", () => {
  it("exports a user table with the required columns", () => {
    const columns = Object.keys(user);
    for (const col of [
      "id",
      "name",
      "email",
      "emailVerified",
      "image",
      "username",
      "role",
      "blockedAt",
      "blockedBy",
      "createdAt",
      "updatedAt",
    ]) {
      assert.ok(columns.includes(col), `missing column: ${col}`);
    }
  });

  it("user.role column has 'member' as its default", () => {
    assert.equal(user.role.default, "member");
  });

  it("exports session, account, and verification tables", () => {
    assert.ok(session);
    assert.ok(account);
    assert.ok(verification);
  });

  it("exports a feature table with the required columns", () => {
    const columns = Object.keys(feature);
    for (const col of ["id", "title", "description", "authorId", "status", "createdAt", "updatedAt"]) {
      assert.ok(columns.includes(col), `missing column: ${col}`);
    }
  });

  it("feature.status column has 'open' as its default", () => {
    assert.equal(feature.status.default, "open");
  });

  it("exports a featureVote table with the required columns", () => {
    const columns = Object.keys(featureVote);
    for (const col of ["id", "featureId", "userId", "value", "createdAt"]) {
      assert.ok(columns.includes(col), `missing column: ${col}`);
    }
  });
});
