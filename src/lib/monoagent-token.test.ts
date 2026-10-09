import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MONOAGENT_AUDIENCE, MONOAGENT_CLIENT_ID, authIssuer } from "./monoagent-token.ts";

const original = process.env.BETTER_AUTH_URL;
afterEach(() => {
  if (original === undefined) delete process.env.BETTER_AUTH_URL;
  else process.env.BETTER_AUTH_URL = original;
});

describe("the MonoAgent token constants", () => {
  it("are the values mono-agent pins", () => {
    assert.equal(MONOAGENT_AUDIENCE, "https://monoes.me/api/monoagent");
    assert.equal(MONOAGENT_CLIENT_ID, "monoagent");
  });

  it("make the issuer the Better-Auth base URL plus its base path", () => {
    process.env.BETTER_AUTH_URL = "https://monoes.me";
    assert.equal(authIssuer(), "https://monoes.me/api/auth");
    delete process.env.BETTER_AUTH_URL;
    assert.equal(authIssuer(), "http://localhost:3000/api/auth");
  });
});

describe("migration 0017_monoagent_audience.sql", () => {
  const read = () => readFileSync(new URL("../../drizzle/0017_monoagent_audience.sql", import.meta.url), "utf8");

  it("registers exactly the audience the code verifies, and links only the monoagent client to it", () => {
    const sql = read();
    assert.ok(sql.includes(`'${MONOAGENT_AUDIENCE}'`));
    assert.match(sql, /INSERT OR IGNORE INTO `oauth_resource`/);
    assert.match(sql, /INSERT OR IGNORE INTO `oauth_client_resource`[\s\S]*'monoagent'/);
    assert.equal(sql.match(/INSERT OR IGNORE INTO `oauth_client_resource`/g)?.length, 1);
  });

  it("leaves allowed_scopes NULL, because a list would narrow every token's scopes", () => {
    const sql = read();
    const resourceInsert = sql.slice(sql.indexOf("INSERT OR IGNORE INTO `oauth_resource`"), sql.indexOf("--> statement-breakpoint"));
    const values = resourceInsert.slice(resourceInsert.indexOf("VALUES")).replace(/\s+/g, " ");
    assert.match(values, /'MonoAgent', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0,/);
  });
});

describe("the refresh-token reuse window", () => {
  // mono-agent presents a refresh token whose answer was lost again, at once, for as long as 240 seconds after the
  // first send (pendingRetryWindow in internal/account/guard.go, spec A24), and the provider answers that repeat only
  // inside this window. The two numbers change together, and the client's must stay below this one.
  it("is the 300 seconds the owner approved: the client's 240-second retry window (A24) sits inside it", () => {
    const auth = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");
    assert.ok(/refreshTokenReuseInterval: 300,/.test(auth), "src/lib/auth.ts sets refreshTokenReuseInterval: 300");
  });
});
