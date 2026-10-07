// S7 (ruling R1 of 2026-10-07): what names the family of a refresh token, and what does a replay
// after the reuse window end today?
//   npx tsx scripts/spikes/s7-family.ts
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { oauthRefreshToken } from "../../src/lib/db/schema";
import { AUDIENCE, login, refresh, withDb, type Result } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";
const origin = new URL(base).origin;

// A short fingerprint of an identifier: equal values show as equal, and no value is printed.
const tag = (v: string | null | undefined) => (v ? createHash("sha256").update(v).digest("hex").slice(0, 8) : "null");

const line = (label: string, r: Result) => console.log(`${label.padEnd(48)} ${r.status} ${r.body.error ?? "ok"}`);

// Every refresh-token row of the user, with the columns that could name a family.
async function rows(userId: string, label: string) {
  const all = await withDb(async (db) =>
    await db
      .select({
        id: oauthRefreshToken.id,
        revoked: oauthRefreshToken.revoked,
        rotatedAt: oauthRefreshToken.rotatedAt,
        sessionId: oauthRefreshToken.sessionId,
        authorizationCodeId: oauthRefreshToken.authorizationCodeId,
        referenceId: oauthRefreshToken.referenceId,
      })
      .from(oauthRefreshToken)
      .where(eq(oauthRefreshToken.userId, userId)),
  );
  console.log(`== ${label}: ${all.length} refresh-token rows`);
  for (const r of all) {
    console.log(`  row ${tag(r.id)} revoked=${r.revoked ? "yes" : "no"} rotated=${r.rotatedAt ? "yes" : "no"} session=${tag(r.sessionId)} code=${tag(r.authorizationCodeId)} reference=${tag(r.referenceId)}`);
  }
}

async function main() {
  // One account, two sign-ins: two installs, two chains, each rotated once.
  const a = await login(base, { resource: AUDIENCE });
  const b = await login(base, { resource: AUDIENCE, account: a.account });
  const uid = a.account.userId;
  line("rotate A (A1 -> A2)", await refresh(base, a.body.refresh_token!, AUDIENCE));
  const b2 = await refresh(base, b.body.refresh_token!, AUDIENCE);
  line("rotate B (B1 -> B2)", b2);
  await rows(uid, "two chains, each rotated once");

  // An older token issued without a resource, exchanged with one (D23 adoption, S2).
  const c = await login(base, { account: a.account });
  line("exchange C1 (issued without a resource)", await refresh(base, c.body.refresh_token!, AUDIENCE));
  await rows(uid, "after the exchange of a token issued without a resource");

  // The end of the web session must not end a family (S3).
  const out = await fetch(new URL("/api/auth/sign-out", base), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, Cookie: a.account.cookie },
    body: "{}",
  });
  console.log(`sign-out: ${out.status}`);
  await rows(uid, "after the web session ended");

  // A replay of A1 after the window (the unmodified server's window is 0 seconds).
  line("replay A1", await refresh(base, a.body.refresh_token!, AUDIENCE));
  await rows(uid, "after the replay of A1");
  line("B2, the other sign-in", await refresh(base, b2.body.refresh_token!, AUDIENCE));

  // The revoke route, given a rotated token.
  const d = await login(base, { resource: AUDIENCE });
  const e = await login(base, { resource: AUDIENCE, account: d.account });
  await refresh(base, d.body.refresh_token!, AUDIENCE);
  const revoke = await fetch(new URL("/api/auth/oauth2/revoke", base), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: d.body.refresh_token!, client_id: "monoagent" }),
  });
  console.log(`revoke D1 (rotated): ${revoke.status}`);
  await rows(d.account.userId, "after the revoke of a rotated token");
  line("E1, the other sign-in", await refresh(base, e.body.refresh_token!, AUDIENCE));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
