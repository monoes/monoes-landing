import type { Jwk, JwtOptions } from "better-auth/plugins";
import { sha256Base64Url } from "@/lib/community/hash-token";

// The key every MonoAgent access token is signed with. mono-agent releases pin
// the matching public key (internal/account/keys.go in github.com/monoes/mono-agent),
// so this key is chosen by an operator and supplied as a secret; it is never a
// row the jwt plugin generates by itself. Generate one with
// scripts/generate-signing-key.ts.
export const SIGNING_KEY_ENV = "MONOAGENT_JWT_PRIVATE_JWK";

// During a rotation: the key tokens were signed with until the swap, public half
// only. It is published at /jwks, so this server still accepts the tokens issued
// in the last hour, and it never signs.
export const PREVIOUS_KEY_ENV = "MONOAGENT_JWT_PREVIOUS_PUBLIC_JWK";

type Ed25519PrivateJwk = { kty: "OKP"; crv: "Ed25519"; x: string; d: string };

// 32 bytes, unpadded base64url.
const KEY_PART = /^[A-Za-z0-9_-]{43}$/;

// The messages never contain the value: this module only ever sees a private key.
export function parsePrivateJwk(raw: string): Ed25519PrivateJwk {
  let jwk: Partial<Ed25519PrivateJwk>;
  try {
    jwk = JSON.parse(raw) as Partial<Ed25519PrivateJwk>;
  } catch {
    throw new Error(`${SIGNING_KEY_ENV} is not JSON`);
  }
  if (jwk?.kty !== "OKP" || jwk.crv !== "Ed25519") throw new Error(`${SIGNING_KEY_ENV} is not an Ed25519 (OKP) JWK`);
  if (typeof jwk.x !== "string" || !KEY_PART.test(jwk.x)) throw new Error(`${SIGNING_KEY_ENV} has no valid public part (x)`);
  if (typeof jwk.d !== "string" || !KEY_PART.test(jwk.d)) throw new Error(`${SIGNING_KEY_ENV} has no valid private part (d)`);
  return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, d: jwk.d };
}

export function parsePublicJwk(raw: string): Omit<Ed25519PrivateJwk, "d"> {
  let jwk: Partial<Ed25519PrivateJwk>;
  try {
    jwk = JSON.parse(raw) as Partial<Ed25519PrivateJwk>;
  } catch {
    throw new Error(`${PREVIOUS_KEY_ENV} is not JSON`);
  }
  if (jwk?.kty !== "OKP" || jwk.crv !== "Ed25519" || typeof jwk.x !== "string" || !KEY_PART.test(jwk.x)) {
    throw new Error(`${PREVIOUS_KEY_ENV} is not an Ed25519 (OKP) public JWK`);
  }
  if ("d" in jwk) throw new Error(`${PREVIOUS_KEY_ENV} must be the public half only`);
  return { kty: jwk.kty, crv: jwk.crv, x: jwk.x };
}

// RFC 7638 thumbprint of the public half: members in lexicographic order, no
// whitespace. The `kid` of every token is this value.
export function jwkThumbprint(jwk: { crv: string; kty: string; x: string }): Promise<string> {
  return sha256Base64Url(`{"crv":"${jwk.crv}","kty":"${jwk.kty}","x":"${jwk.x}"}`);
}

export async function loadSigningKey(raw: string): Promise<Jwk> {
  const jwk = parsePrivateJwk(raw);
  return {
    id: await jwkThumbprint(jwk),
    publicKey: JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x }),
    privateKey: JSON.stringify(jwk),
    createdAt: new Date(0),
    alg: "EdDSA",
    crv: "Ed25519",
  };
}

// Published but never chosen to sign: the plugin skips keys whose expiresAt has
// passed when it picks the signing key, and /jwks keeps publishing them for its
// 30-day grace period, counted from expiresAt.
async function loadPreviousKey(raw: string): Promise<Jwk> {
  const jwk = parsePublicJwk(raw);
  return {
    id: await jwkThumbprint(jwk),
    publicKey: JSON.stringify(jwk),
    privateKey: "{}",
    createdAt: new Date(0),
    expiresAt: new Date(Date.now() - 1000),
    alg: "EdDSA",
    crv: "Ed25519",
  };
}

/**
 * The jwt plugin's `adapter` option when the signing key is configured:
 * `getJwks` returns that key (the plugin signs with it, and /jwks publishes it),
 * plus the previous public key during a rotation, and `createJwk` refuses, so no
 * key is ever generated.
 *
 * With no key configured, local development and tests keep the plugin's own
 * database key (undefined = the plugin default). Production fails closed: a
 * deploy without the secret must not silently sign with a key no mono-agent
 * release pins.
 */
export function signingKeyAdapter(
  raw: string | undefined,
  production: boolean,
  previous?: string,
): JwtOptions["adapter"] | undefined {
  if (!raw && !production) return undefined;
  const missing = () => new Error(`${SIGNING_KEY_ENV} is not set; refusing to sign with a key nobody pins`);
  return {
    getJwks: async () => {
      if (!raw) throw missing();
      const current = await loadSigningKey(raw);
      if (!previous) return [current];
      const old = await loadPreviousKey(previous);
      return old.id === current.id ? [current] : [current, old];
    },
    createJwk: async () => {
      throw new Error(`signing keys are configured through ${SIGNING_KEY_ENV}, never generated`);
    },
  };
}
