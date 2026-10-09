import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MONOAGENT_AUDIENCE, MONOAGENT_CLIENT_ID } from "../monoagent-token.ts";
import { PLAN_FREE } from "../access-token-claims.ts";

const page = readFileSync(new URL("../../app/docs/authentication/page.tsx", import.meta.url), "utf8");

describe("the authentication docs page", () => {
  it("documents the audience, the client and every claim mono-agent verifies", () => {
    const mentioned = [
      MONOAGENT_AUDIENCE,
      `client_id=${MONOAGENT_CLIENT_ID}`,
      "https://monoes.me/api/auth",
      "/api/auth/jwks",
      "EdDSA",
      "at+jwt",
      "exp - iat",
      "invalid_target",
      "invalid_grant",
      "refresh_token",
    ];
    for (const text of mentioned) assert.ok(page.includes(text), `the page mentions ${text}`);
  });

  it("says that a reused refresh token ends only its own sign-in, and that sid can be null", () => {
    // Plan A's Task 3 (refresh-token families, ruling R1); spike S6 measured `sid` null after a sign-out.
    const text = page.replace(/\s+/g, " ");
    assert.ok(text.includes("revokes the refresh tokens of that sign-in"), "the page says what a reused refresh token ends");
    assert.ok(text.includes("The other sign-ins of the account keep working"), "the page says the other sign-ins survive");
    assert.ok(!text.includes("every MonoAgent refresh token of that account"), "the page no longer says a reuse ends the account");
    assert.ok(text.includes("once that session has ended"), "the page says sid can be null");
  });

  it("states the plan claim, the pinned signing key, blocking and that a JWT outlives its sign-in", () => {
    const text = page.replace(/\s+/g, " ");
    assert.ok(text.includes(`<code>plan</code> is <code>${PLAN_FREE}</code>`), "the plan claim and its value");
    assert.ok(text.includes("fixed key that monoes.me supplies"), "the signing key is pinned, not generated");
    assert.ok(text.includes("the previous public key stays published"), "the key rotation overlap");
    assert.ok(text.includes("or the account is blocked"), "a blocked account is invalid_grant");
    assert.ok(text.includes("403"), "the library answers a blocked account 403");
    assert.ok(text.includes("stays valid until its"), "a JWT outlives the sign-in that issued it");
    assert.ok(!page.includes("MONOAGENT_JWT_"), "the page names no secret");
  });
});
