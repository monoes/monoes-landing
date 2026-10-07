// S1: which key signs, where does it live, and can a verifier that has only the
// public key check the signature? Run it before and after pinning a key:
//   npx tsx scripts/spikes/s1-key.ts [expected-kid]
// With an expected kid it also asserts the tokens and the JWKS carry exactly that key.
import { count } from "drizzle-orm";
import { jwks } from "../../src/lib/db/schema";
import { AUDIENCE, decodeJwt, login, refresh, verifiesAgainstJwks, withDb } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";
const jwksRows = () => withDb(async (db) => (await db.select({ n: count() }).from(jwks))[0].n);

async function main() {
  const expected = process.argv[2];
  const rowsBefore = await jwksRows();
  const { keys } = (await (await fetch(new URL("/api/auth/jwks", base))).json()) as { keys: { kid: string; kty: string; crv: string; alg: string }[] };
  console.log(`JWKS: ${keys.map((k) => `${k.kid} ${k.kty}/${k.crv} ${k.alg}`).join("; ")}`);

  const r = await login(base, { resource: AUDIENCE });
  const { header } = decodeJwt(r.body.access_token!);
  console.log(`access token: alg=${header.alg} typ=${header.typ} kid=${header.kid}`);
  console.log(`verifies with only the published public key (node:crypto, Ed25519): ${await verifiesAgainstJwks(base, r.body.access_token!)}`);
  console.log(`id token signed by the same key: ${decodeJwt(r.body.id_token!).header.kid === header.kid}`);
  const again = await refresh(base, r.body.refresh_token!);
  console.log(`after a refresh: ${again.status}, kid ${decodeJwt(again.body.access_token!).header.kid}`);
  console.log(`jwks table rows: ${rowsBefore} before, ${await jwksRows()} after (a row appears only when the plugin generates a key)`);

  if (expected) {
    const ok = header.kid === expected && keys.length >= 1 && keys[0].kid === expected;
    console.log(`PINNED KEY CHECK: ${ok ? "PASS" : "FAIL"} (expected ${expected})`);
    process.exit(ok ? 0 : 1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
