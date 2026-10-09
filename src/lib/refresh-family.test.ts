import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema.ts";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/db/schema") return next("./db/schema.ts", context);
    if (specifier === "@/lib/community/hash-token") return next("./community/hash-token.ts", context);
    if (specifier === "@/lib/monoagent-token") return next("./monoagent-token.ts", context);
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { endFamily, refreshTokenOf, revokeCaller, revokedTokenOf, tokenRouteActs } = await import("./refresh-family.ts");

const FORM = "application/x-www-form-urlencoded";
const revokeRequest = (body: string, contentType = FORM) =>
  new Request("https://monoes.test/api/auth/oauth2/revoke", { method: "POST", headers: { "Content-Type": contentType }, body });

describe("what a request presents, read as the provider reads it", () => {
  it("is a refresh at the token route whatever spaces surround grant_type, and the token as sent", () => {
    assert.equal(refreshTokenOf({ grant_type: "refresh_token", refresh_token: "r1" }), "r1");
    assert.equal(refreshTokenOf({ grant_type: "refresh_token ", refresh_token: " r1 " }), " r1 ");
    assert.equal(refreshTokenOf({ grant_type: "authorization_code", code: "c" }), undefined);
    assert.equal(refreshTokenOf({ grant_type: "refresh_token" }), undefined);
  });

  it("is a refresh token at the revoke route under any hint but access_token, trimmed and without its scheme", () => {
    assert.equal(revokedTokenOf({ token: "r1" }), "r1");
    assert.equal(revokedTokenOf({ token: "Bearer r1", token_type_hint: "x" }), "r1");
    assert.equal(revokedTokenOf({ token: " r1 ", token_type_hint: "refresh_token" }), "r1");
    assert.equal(revokedTokenOf({ token: "r1", token_type_hint: "access_token" }), undefined);
    assert.equal(revokedTokenOf({}), undefined);
  });
});

describe("revokeCaller", () => {
  it("reads the single non-empty client_id of the raw request text, as the provider does", async () => {
    assert.equal(await revokeCaller(revokeRequest("token=t&client_id=monoagent"), {}), "monoagent");
    assert.equal(await revokeCaller(revokeRequest("token=t&client_id=monoagent&client_id="), { client_id: "" }), "monoagent");
    assert.equal(await revokeCaller(revokeRequest("token=t&client_id=monoagent&client_id=other"), {}), undefined);
    assert.equal(await revokeCaller(revokeRequest("token=t"), { client_id: "monoagent" }), undefined);
  });

  it("finds the client_id where better-call's parsed body has none: a +json media type, a leading U+FEFF", async () => {
    const json = revokeRequest(JSON.stringify({ token: "t", note: "&client_id=monoagent&" }), `${FORM}+json`);
    assert.equal(await revokeCaller(json, { token: "t", note: "&client_id=monoagent&" }), "monoagent");
    assert.equal(await revokeCaller(revokeRequest("﻿client_id=monoagent&token=t"), { "﻿client_id": "monoagent" }), "monoagent");
  });

  it("leaves the request readable for the provider, and reads an auth.api call's body", async () => {
    const request = revokeRequest("token=t&client_id=monoagent");
    await revokeCaller(request, {});
    assert.equal(await request.text(), "token=t&client_id=monoagent");
    assert.equal(await revokeCaller(undefined, { client_id: "monoagent" }), "monoagent");
    assert.equal(await revokeCaller(undefined, { client_id: "" }), undefined);
  });
});

describe("tokenRouteActs", () => {
  const now = new Date("2026-10-07T12:00:00Z");
  const seconds = (n: number) => new Date(now.getTime() + n * 1000);
  // A MonoAgent refresh token rotated away ten minutes ago: its 300-second reuse window has passed.
  const rotated = {
    id: "row-1",
    token: "hash",
    clientId: "monoagent",
    sessionId: null,
    userId: "user-1",
    referenceId: null,
    authorizationCodeId: "code-1",
    resources: ["https://monoes.me/api/monoagent"],
    requestedUserInfoClaims: null,
    expiresAt: seconds(30 * 24 * 3600),
    createdAt: seconds(-3600),
    revoked: seconds(-600),
    rotatedAt: seconds(-600),
    rotationReplayResponse: null,
    rotationReplayExpiresAt: seconds(-300),
    authTime: null,
    confirmation: null,
    scopes: ["openid", "offline_access", "library:read"],
  };

  it("acts on a MonoAgent token rotated away and presented after the reuse window, or revoked with no rotation", () => {
    assert.equal(tokenRouteActs(rotated, now), true);
    assert.equal(tokenRouteActs({ ...rotated, rotatedAt: null, rotationReplayExpiresAt: null }, now), true);
  });

  it("leaves the reuse window to the provider, judged 10 seconds early", () => {
    assert.equal(tokenRouteActs({ ...rotated, rotationReplayExpiresAt: seconds(60) }, now), false);
    assert.equal(tokenRouteActs({ ...rotated, rotationReplayExpiresAt: seconds(10) }, now), false);
    assert.equal(tokenRouteActs({ ...rotated, rotationReplayExpiresAt: seconds(9) }, now), true);
  });

  it("leaves a live, expired or missing token, and another client's, to the provider", () => {
    assert.equal(tokenRouteActs({ ...rotated, revoked: null, rotatedAt: null, rotationReplayExpiresAt: null }, now), false);
    assert.equal(tokenRouteActs({ ...rotated, expiresAt: now }, now), false);
    assert.equal(tokenRouteActs({ ...rotated, expiresAt: null }, now), false);
    assert.equal(tokenRouteActs({ ...rotated, clientId: "some-agent" }, now), false);
    assert.equal(tokenRouteActs(undefined, now), false);
  });
});

describe("endFamily", () => {
  // Never executed: the statements are only rendered.
  const db = drizzle({} as never, { schema });

  it("deletes the family's access tokens, then its refresh tokens, keyed on client, user and authorization_code_id", () => {
    const [access, refresh] = endFamily(db, { id: "row-1", clientId: "monoagent", userId: "user-1", authorizationCodeId: "code-1" }).map((s) => s.toSQL());
    const family = `"oauth_refresh_token"."client_id" = ? and "oauth_refresh_token"."user_id" = ? and "oauth_refresh_token"."authorization_code_id" = ?`;
    assert.equal(access.sql, `delete from "oauth_access_token" where "oauth_access_token"."refresh_id" in (select "id" from "oauth_refresh_token" where (${family}))`);
    assert.equal(refresh.sql, `delete from "oauth_refresh_token" where (${family})`);
    for (const { params } of [access, refresh]) assert.deepEqual(params, ["monoagent", "user-1", "code-1"]);
  });

  it("never keys a delete on a null authorization_code_id: such a row ends alone", () => {
    for (const { sql, params } of endFamily(db, { id: "row-1", clientId: "monoagent", userId: "user-1", authorizationCodeId: null }).map((s) => s.toSQL())) {
      assert.ok(!sql.includes("authorization_code_id"), sql);
      assert.deepEqual(params, ["row-1"]);
    }
  });
});
