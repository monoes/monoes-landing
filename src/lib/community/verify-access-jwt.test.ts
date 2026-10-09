import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { SignJWT, exportJWK, generateKeyPair, type JWK } from "jose";

// The verifier reads this server's own JWKS through getAuth().api.getJwks(); the stub serves
// whatever the test put in globalThis.
register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/auth") {
      return {
        url: "data:text/javascript,export const getAuth = () => ({ api: { getJwks: async () => { if (globalThis.__jwksError) throw new Error('no key'); return globalThis.__jwks; } } });",
        shortCircuit: true,
      };
    }
    if (specifier === "@/lib/monoagent-token") return next("../monoagent-token.ts", context);
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { looksLikeJwt, verifyMonoagentAccessToken } = await import("./verify-access-jwt.ts");
const { MONOAGENT_AUDIENCE, MONOAGENT_CLIENT_ID, authIssuer } = await import("../monoagent-token.ts");

const KID = "test-kid";
let privateKey: CryptoKey;
let publicJwk: JWK;

before(async () => {
  process.env.BETTER_AUTH_URL = "https://monoes.me";
  const pair = await generateKeyPair("EdDSA", { extractable: true });
  privateKey = pair.privateKey;
  publicJwk = { ...(await exportJWK(pair.publicKey)), kid: KID, alg: "EdDSA" };
  globalThis.__jwks = { keys: [publicJwk] };
  globalThis.__jwksError = false;
});

type Over = { iss?: string; aud?: string | string[]; sub?: string; azp?: string; client_id?: string; iat?: number; exp?: number };

// A token as the provider mints it for MonoAgent (the real audience shape: the audience, then the
// userinfo endpoint, because openid is requested); `over` changes one thing at a time.
async function mint(over: Over = {}, header: Record<string, unknown> = {}, key: CryptoKey = privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const c = { iss: authIssuer(), aud: [MONOAGENT_AUDIENCE, `${authIssuer()}/oauth2/userinfo`], sub: "user-1", azp: MONOAGENT_CLIENT_ID, client_id: MONOAGENT_CLIENT_ID, iat: now, exp: now + 3600, ...over };
  const jwt = new SignJWT({ azp: c.azp, client_id: c.client_id, scope: "openid library:read library:write" })
    .setProtectedHeader({ alg: "EdDSA", kid: KID, typ: "at+jwt", ...header })
    .setIssuer(c.iss)
    .setAudience(c.aud)
    .setIssuedAt(c.iat)
    .setExpirationTime(c.exp);
  if (c.sub !== undefined) jwt.setSubject(c.sub);
  return jwt.sign(key);
}

describe("looksLikeJwt", () => {
  it("tells a JWT from an opaque token by its three parts", () => {
    assert.deepEqual(["a.b.c", "kJ3x9QwY2LmN8aBcDeFgHiJkLmNoPqRs", "a.b", "a.b.c.d"].map(looksLikeJwt), [true, false, false, false]);
  });
});

describe("verifyMonoagentAccessToken", () => {
  it("accepts a token minted for the audience and returns its user and scopes", async () => {
    assert.deepEqual(await verifyMonoagentAccessToken(await mint()), { userId: "user-1", scopes: ["openid", "library:read", "library:write"] });
    assert.equal((await verifyMonoagentAccessToken(await mint({ aud: MONOAGENT_AUDIENCE })))?.userId, "user-1");
  });

  it("refuses a token that is wrong in any one way", async () => {
    const past = Math.floor(Date.now() / 1000) - 7200;
    const stranger = await generateKeyPair("EdDSA");
    const cases: [string, string][] = [
      ["another audience", await mint({ aud: "https://monoes.me/api/other" })],
      ["another issuer", await mint({ iss: "https://evil.example/api/auth" })],
      ["expired", await mint({ iat: past, exp: past + 3600 })],
      ["another client (azp)", await mint({ azp: "someone-else" })],
      ["another client (client_id)", await mint({ client_id: "someone-else" })],
      ["no subject", await mint({ sub: undefined })],
      ["an empty subject", await mint({ sub: "" })],
      ["typ JWT, like a session JWT", await mint({}, { typ: "JWT" })],
      ["a key this server does not publish", await mint({}, {}, stranger.privateKey)],
      ["an unknown kid", await mint({}, { kid: "unknown-kid" })],
    ];
    for (const [name, token] of cases) assert.equal(await verifyMonoagentAccessToken(token), null, name);
  });

  it("accepts one algorithm only: no HMAC keyed with the public key, no alg none", async () => {
    const hmac = await new SignJWT({ azp: MONOAGENT_CLIENT_ID, client_id: MONOAGENT_CLIENT_ID })
      .setProtectedHeader({ alg: "HS256", kid: KID, typ: "at+jwt" })
      .setIssuer(authIssuer())
      .setAudience(MONOAGENT_AUDIENCE)
      .setSubject("user-1")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(String(publicJwk.x)));
    const b64 = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
    const none = `${b64({ alg: "none", typ: "at+jwt" })}.${b64({ iss: authIssuer(), aud: MONOAGENT_AUDIENCE, sub: "user-1" })}.`;
    assert.deepEqual([await verifyMonoagentAccessToken(hmac), await verifyMonoagentAccessToken(none)], [null, null]);
  });

  it("refuses a token signed with another algorithm, even by a key the server publishes", async () => {
    const rsa = await generateKeyPair("RS256", { extractable: true });
    globalThis.__jwks = { keys: [publicJwk, { ...(await exportJWK(rsa.publicKey)), kid: "rsa-kid", alg: "RS256" }] };
    try {
      assert.equal(await verifyMonoagentAccessToken(await mint({}, { alg: "RS256", kid: "rsa-kid" }, rsa.privateKey)), null);
    } finally {
      globalThis.__jwks = { keys: [publicJwk] };
    }
  });

  it("verifies a token signed by either of two published keys, as during a rotation", async () => {
    const old = await generateKeyPair("EdDSA", { extractable: true });
    globalThis.__jwks = { keys: [publicJwk, { ...(await exportJWK(old.publicKey)), kid: "old-kid", alg: "EdDSA" }] };
    try {
      assert.equal((await verifyMonoagentAccessToken(await mint({}, { kid: "old-kid" }, old.privateKey)))?.userId, "user-1");
      assert.equal((await verifyMonoagentAccessToken(await mint()))?.userId, "user-1");
    } finally {
      globalThis.__jwks = { keys: [publicJwk] };
    }
  });

  it("refuses everything when the signing key is unavailable, instead of throwing", async () => {
    const token = await mint();
    globalThis.__jwksError = true;
    try {
      assert.equal(await verifyMonoagentAccessToken(token), null);
    } finally {
      globalThis.__jwksError = false;
    }
  });
});
