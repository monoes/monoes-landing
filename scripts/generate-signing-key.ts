// Generates a MonoAgent access-token signing key (Ed25519).
//
//   npx tsx scripts/generate-signing-key.ts | npx wrangler secret put MONOAGENT_JWT_PRIVATE_JWK
//
// stdout: the PRIVATE key as a JWK on one line of JSON, nothing else, so it can be piped into
// `wrangler secret put` and never appears on screen or in a log.
// stderr: the kid, the PUBLIC key as 64 hex characters (what internal/account/keys.go in
// github.com/monoes/mono-agent pins) and as a public JWK (the value of
// MONOAGENT_JWT_PREVIOUS_PUBLIC_JWK once a later key has replaced this one).
// Nothing is written to disk. Redirecting stdout to a file is the caller's choice: keep it outside any git repository.
import { generateKeyPairSync } from "node:crypto";
import { jwkThumbprint } from "../src/lib/signing-key";

async function main() {
  const { privateKey } = generateKeyPairSync("ed25519");
  const jwk = privateKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string; d: string };
  const kid = await jwkThumbprint(jwk);
  const hex = Buffer.from(jwk.x, "base64url").toString("hex");
  process.stdout.write(`${JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, d: jwk.d })}\n`);
  process.stderr.write(`kid        : ${kid}\npublic hex : ${hex} (Ed25519, 64 hex characters)\n`);
  process.stderr.write(`public JWK : ${JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x })}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
