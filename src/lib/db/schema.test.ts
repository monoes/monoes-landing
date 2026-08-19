import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { user, session, account, verification } from "./schema.ts";

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
});
