// S2 and S3: what does the refresh grant do with a `resource`, with rotation and replay,
// with a block, and with the end of a web session?
//   npx tsx scripts/spikes/s2-s3-refresh.ts
import { eq } from "drizzle-orm";
import { oauthRefreshToken, user } from "../../src/lib/db/schema";
import { AUDIENCE, authorize, exchange, login, pkce, refresh, signIn, withDb, type Account, type Result } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";
const origin = new URL(base).origin;

function line(label: string, r: Result) {
  const kind = r.body.access_token ? (r.body.access_token.includes(".") ? "JWT" : "opaque") : "-";
  console.log(`${label.padEnd(44)} ${r.status} ${r.body.error ?? "ok"} access=${kind}${r.body.error_description ? ` (${r.body.error_description})` : ""}`);
}

async function post(path: string, cookie: string, body: object = {}) {
  const res = await fetch(new URL(path, base), { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie }, body: JSON.stringify(body) });
  return res.status;
}

const setBlocked = (id: string, on: boolean) => withDb((db) => db.update(user).set({ blockedAt: on ? new Date() : null }).where(eq(user.id, id)));
const refreshRows = (id: string) => withDb(async (db) => (await db.select({ id: oauthRefreshToken.id }).from(oauthRefreshToken).where(eq(oauthRefreshToken.userId, id))).length);

async function main() {
  console.log("== S2: a refresh token issued without a resource, exchanged with one ==");
  const a = await login(base);
  const bound = await refresh(base, a.body.refresh_token!, AUDIENCE);
  line("refresh(R1, resource)", bound);
  line("refresh(R1 again): the rotated token", await refresh(base, a.body.refresh_token!, AUDIENCE));
  line("refresh(R2): the replay killed the family", await refresh(base, bound.body.refresh_token!, AUDIENCE));
  const c = await login(base, { resource: AUDIENCE });
  line("a bound chain, refresh without resource", await refresh(base, c.body.refresh_token!));
  const d = await login(base);
  const d2 = await refresh(base, d.body.refresh_token!);
  line("a plain chain, refresh without resource", d2);
  line("the same chain, then with the resource", await refresh(base, d2.body.refresh_token!, AUDIENCE));
  line("another resource", await refresh(base, (await login(base)).body.refresh_token!, "https://example.com/other"));

  console.log("== S3: a block (blocked_at only, what the route does today) ==");
  const b = await login(base, { resource: AUDIENCE });
  const uid = b.account.userId;
  const before = await refreshRows(uid);
  await setBlocked(uid, true);
  console.log(`refresh-token rows for the user: ${before} before the block, ${await refreshRows(uid)} after`);
  line("refresh(blocked user, resource)", await refresh(base, b.body.refresh_token!, AUDIENCE));
  console.log(`new web sign-in: ${(await signIn(base, b.account.email)).status}`);
  const p = pkce();
  try {
    line("authorize through the old web session", await exchange(base, await authorize(b.account, p.challenge, { resource: AUDIENCE }), p.verifier, AUDIENCE));
  } catch (err) {
    console.log(`authorize through the old web session: ${(err as Error).message}`);
  }
  await setBlocked(uid, false);

  console.log("== S3: does ending the monoes.me web session end a MonoAgent refresh token? ==");
  const e = await login(base, { resource: AUDIENCE });
  console.log(`sign-out: ${await post("/api/auth/sign-out", e.account.cookie)}`);
  line("refresh after sign-out", await refresh(base, e.body.refresh_token!, AUDIENCE));
  const f = await login(base, { resource: AUDIENCE });
  const second = (await signIn(base, f.account.email)).account as Account;
  console.log(`revoke-sessions: ${await post("/api/auth/revoke-sessions", second.cookie)}`);
  line("refresh after revoke-sessions", await refresh(base, f.body.refresh_token!, AUDIENCE));
  const g = await login(base, { resource: AUDIENCE });
  console.log(`change-password (revokeOtherSessions): ${await post("/api/auth/change-password", g.account.cookie, { currentPassword: "TestPass1234", newPassword: "TestPass5678", revokeOtherSessions: true })}`);
  line("refresh after change-password", await refresh(base, g.body.refresh_token!, AUDIENCE));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
