import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { getTableName } from "drizzle-orm";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/db/schema") return next("../db/schema.ts", context);
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { revokeOAuthAccess } = await import("./revoke-oauth-access.ts");

// A db whose delete(table).where(condition) just records what it was asked.
const recordingDb = {
  delete: (table: unknown) => ({ where: (condition: unknown) => ({ table, condition }) }),
};

describe("revokeOAuthAccess", () => {
  it("deletes the user's OAuth access tokens, refresh tokens and web sessions, and only theirs", () => {
    const statements = revokeOAuthAccess(recordingDb as never, "user-1") as unknown as { table: never; condition: never }[];
    assert.deepEqual(
      statements.map((s) => getTableName(s.table)),
      ["oauth_access_token", "oauth_refresh_token", "session"],
    );
    const dialect = new SQLiteSyncDialect();
    for (const statement of statements) {
      const query = dialect.sqlToQuery(statement.condition);
      assert.match(query.sql, /"user_id" = \?/);
      assert.deepEqual(query.params, ["user-1"]);
    }
  });
});
