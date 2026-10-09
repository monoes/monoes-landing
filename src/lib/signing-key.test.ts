import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, importJWK, jwtVerify } from "jose";

register(
  `data:text/javascript,
  export function resolve(specifier, context, next) {
    if (specifier === "@/lib/community/hash-token") return next("./community/hash-token.ts", context);
    return next(specifier, context);
  }`,
  import.meta.url,
);

const { SIGNING_KEY_ENV, PREVIOUS_KEY_ENV, parsePrivateJwk, jwkThumbprint, loadSigningKey, signingKeyAdapter } = await import("./signing-key.ts");

function throwawayKey() {
  const jwk = generateKeyPairSync("ed25519").privateKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string; d: string };
  return { jwk, raw: JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, d: jwk.d }) };
}
const publicHalf = (k: { jwk: { x: string } }) => JSON.stringify({ kty: "OKP", crv: "Ed25519", x: k.jwk.x });
const keysOf = async (raw: string | undefined, production: boolean, previous?: string) =>
  (await signingKeyAdapter(raw, production, previous)!.getJwks!({} as never)) ?? [];

describe("the key", () => {
  it("is named by its RFC 7638 thumbprint (the RFC 8037 appendix A.3 vector)", async () => {
    assert.equal(
      await jwkThumbprint({ crv: "Ed25519", kty: "OKP", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" }),
      "kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k",
    );
  });

  it("is refused when it is not an Ed25519 private JWK, and the message never echoes it", () => {
    const { jwk } = throwawayKey();
    const secretLooking = "SECRET-LOOKING-d-VALUE-0123456789abcdefghijklmnopqrstuv";
    const bad = [
      "not json",
      JSON.stringify({ kty: "RSA", crv: "Ed25519", x: jwk.x, d: jwk.d }),
      JSON.stringify({ kty: "OKP", crv: "P-256", x: jwk.x, d: jwk.d }),
      JSON.stringify({ kty: "OKP", crv: "Ed25519", d: jwk.d }),
      JSON.stringify({ kty: "OKP", crv: "Ed25519", x: "short", d: jwk.d }),
      JSON.stringify({ kty: "OKP", crv: "Ed25519", x: jwk.x }),
      JSON.stringify({ kty: "OKP", crv: "Ed25519", x: jwk.x, d: secretLooking }),
    ];
    for (const raw of bad) {
      assert.throws(() => parsePrivateJwk(raw), (err: Error) => {
        assert.ok(err.message.includes(SIGNING_KEY_ENV) && !err.message.includes(secretLooking) && !err.message.includes(jwk.d));
        return true;
      });
    }
  });

  it("signs and verifies, which is what mono-agent does with the public half, and keeps d out of it", async () => {
    const { raw, jwk } = throwawayKey();
    const key = await loadSigningKey(raw);
    assert.equal(key.id, await jwkThumbprint(jwk));
    assert.deepEqual(JSON.parse(key.publicKey), { kty: "OKP", crv: "Ed25519", x: jwk.x });
    const token = await new SignJWT({ plan: "free" })
      .setProtectedHeader({ alg: "EdDSA", kid: key.id, typ: "at+jwt" })
      .setIssuer("https://monoes.me/api/auth")
      .setExpirationTime("1h")
      .sign(await importJWK(JSON.parse(key.privateKey), "EdDSA"));
    const { payload, protectedHeader } = await jwtVerify(token, await importJWK(JSON.parse(key.publicKey), "EdDSA"), {
      algorithms: ["EdDSA"],
      issuer: "https://monoes.me/api/auth",
    });
    assert.deepEqual([payload.plan, protectedHeader.kid], ["free", key.id]);
  });
});

describe("signingKeyAdapter", () => {
  it("leaves the plugin's own database key alone in development and tests", () => {
    assert.equal(signingKeyAdapter(undefined, false), undefined);
  });

  it("fails closed in production without the key: nothing is signed with a key nobody pins", async () => {
    const adapter = signingKeyAdapter(undefined, true)!;
    await assert.rejects(adapter.getJwks!({} as never), new RegExp(SIGNING_KEY_ENV));
    await assert.rejects(adapter.createJwk!({} as never, {} as never), /never generated/);
  });

  it("reports a malformed key when it is used, not when the server starts", async () => {
    await assert.rejects(keysOf("{}", false), new RegExp(SIGNING_KEY_ENV));
  });

  it("publishes exactly the configured key and refuses to generate another", async () => {
    const { raw, jwk } = throwawayKey();
    for (const production of [false, true]) {
      assert.deepEqual((await keysOf(raw, production)).map((k) => k.id), [await jwkThumbprint(jwk)]);
      await assert.rejects(signingKeyAdapter(raw, production)!.createJwk!({} as never, {} as never), /never generated/);
    }
  });

  it("publishes the previous public key during a rotation, but never signs with it", async () => {
    const current = throwawayKey();
    const previous = throwawayKey();
    const keys = await keysOf(current.raw, true, publicHalf(previous));
    assert.deepEqual(keys.map((k) => k.id), [await jwkThumbprint(current.jwk), await jwkThumbprint(previous.jwk)]);
    // The plugin signs with the newest key that has not expired...
    assert.deepEqual(keys.filter((k) => !k.expiresAt || k.expiresAt > new Date()).map((k) => k.id), [await jwkThumbprint(current.jwk)]);
    // ...and /jwks keeps publishing an expired key for 30 days after its expiresAt.
    assert.ok(keys.every((k) => !k.expiresAt || k.expiresAt.getTime() + 30 * 24 * 3600 * 1000 > Date.now()));
    assert.equal(JSON.parse(keys[1].privateKey).d, undefined, "no private half for the previous key");
    assert.equal((await keysOf(current.raw, true, publicHalf(current))).length, 1, "the same key is listed once");
  });

  it("refuses a previous key that is not a public Ed25519 JWK, and never echoes it", async () => {
    const current = throwawayKey();
    for (const bad of ["not json", JSON.stringify({ kty: "OKP", crv: "Ed25519", x: "short" }), current.raw]) {
      await assert.rejects(keysOf(current.raw, true, bad), (err: Error) => err.message.includes(PREVIOUS_KEY_ENV) && !err.message.includes(current.jwk.d));
    }
  });
});

// auth.ts builds the whole Better-Auth instance and needs the Workers runtime, so the wiring that makes the
// modes above real is pinned by reading its text (the HTTP behaviour is covered by tests/account-gate-tokens.spec.ts).
describe("src/lib/auth.ts wiring", async () => {
  const { readFileSync } = await import("node:fs");
  const source = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");

  it("passes the signing-key adapter to the jwt plugin and publishes the private half as stored", () => {
    assert.match(source, /jwt\(\{\s*adapter: signingKey,\s*jwks: signingKey \? \{ disablePrivateKeyEncryption: true \} : undefined,/);
  });

  it("does not sign a session JWT on get-session, so a missing key cannot break authenticated pages", () => {
    assert.match(source, /disableSettingJwtHeader: true/);
  });

  it("treats an https base URL as a deployment that must fail closed", () => {
    assert.match(source, /signingKeyAdapter\(\s*process\.env\[SIGNING_KEY_ENV\],\s*\(url \?\? ""\)\.startsWith\("https:\/\/"\),\s*process\.env\[PREVIOUS_KEY_ENV\] \|\| undefined,/);
  });

  it("never rotates the key by itself", () => {
    assert.ok(!source.includes("rotationInterval"));
  });
});
