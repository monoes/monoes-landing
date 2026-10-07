// S7, extra probes (beyond the brief's s7-family.ts): the revoke route's answers, the provider's own
// family-scoped delete on an authorization-code replay, access-token rows, two web sessions, the session
// JWT, and the refresh row Task 7 would insert by hand. Structure and fingerprints only, no token value.
//   npx tsx scripts/spikes/s7-probe.ts
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { oauthAccessToken, oauthRefreshToken } from "../../src/lib/db/schema";
import { sha256Base64Url } from "../../src/lib/community/hash-token";
import { AUDIENCE, MONOAGENT_SCOPES, authorize, decodeJwt, exchange, login, pkce, refresh, signIn, withDb, type Account, type Result } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";
const tag = (v: string | null | undefined) => (v ? createHash("sha256").update(v).digest("hex").slice(0, 8) : "null");
const line = (label: string, r: Result) => console.log(`${label.padEnd(52)} ${r.status} ${r.body.error ?? "ok"}${r.body.error_description ? ` (${r.body.error_description})` : ""}${r.body.access_token ? ` access=${r.body.access_token.includes(".") ? "JWT" : "opaque"}` : ""}`);

async function rows(userId: string, label: string) {
  const all = await withDb((db) =>
    db.select({ id: oauthRefreshToken.id, revoked: oauthRefreshToken.revoked, rotatedAt: oauthRefreshToken.rotatedAt, sessionId: oauthRefreshToken.sessionId, code: oauthRefreshToken.authorizationCodeId }).from(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId)),
  );
  console.log(`  -- ${label}: ${all.length} refresh rows`);
  for (const r of all) console.log(`     row ${tag(r.id)} revoked=${r.revoked ? "yes" : "no"} rotated=${r.rotatedAt ? "yes" : "no"} session=${tag(r.sessionId)} code=${tag(r.code)}`);
}

async function accessRows(userId: string, label: string) {
  const [all, refreshIds] = await withDb(async (db) => [
    await db.select({ refreshId: oauthAccessToken.refreshId, code: oauthAccessToken.authorizationCodeId }).from(oauthAccessToken).where(eq(oauthAccessToken.userId, userId)),
    new Map((await db.select({ id: oauthRefreshToken.id, code: oauthRefreshToken.authorizationCodeId }).from(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId))).map((r) => [r.id, r.code])),
  ] as const);
  console.log(`  -- ${label}: ${all.length} access rows${all.map((a) => ` [refresh_id=${a.refreshId ? (refreshIds.has(a.refreshId) ? "a live refresh row" : "dangling") : "null"}, code=${tag(a.code)}, same code as its refresh row=${a.refreshId ? refreshIds.get(a.refreshId) === a.code : "n/a"}]`).join("")}`);
}

async function revoke(token: string, hint?: string) {
  const res = await fetch(new URL("/api/auth/oauth2/revoke", base), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token, client_id: "monoagent", ...(hint ? { token_type_hint: hint } : {}) }),
  });
  return `${res.status} ${(await res.text()) || "(empty body)"}`;
}

async function main() {
  console.log("== P1: the lookup key a wrapper would use");
  const p = await login(base);
  const stored = await sha256Base64Url(p.body.refresh_token!);
  const viaNode = createHash("sha256").update(p.body.refresh_token!).digest("base64url");
  const found = await withDb(async (db) => (await db.select({ id: oauthRefreshToken.id }).from(oauthRefreshToken).where(eq(oauthRefreshToken.token, stored))).length);
  console.log(`  sha256Base64Url(refresh_token) finds its row: ${found === 1}; equals node:crypto sha256 base64url: ${stored === viaNode}`);

  console.log("== P2: access-token rows (a JWT is never a row; an opaque one points at its refresh row)");
  const jwtLogin = await login(base, { resource: AUDIENCE });
  await accessRows(jwtLogin.account.userId, "a login with the resource");
  await accessRows(p.account.userId, "a plain login");
  const p2 = await refresh(base, p.body.refresh_token!);
  line("plain chain rotated (P1 -> P2)", p2);
  await accessRows(p.account.userId, "after the rotation");
  line("replay P1", await refresh(base, p.body.refresh_token!));
  await accessRows(p.account.userId, "after the replay");
  await rows(p.account.userId, "after the replay");

  console.log("== P3: the revoke route (one account, two sign-ins per case)");
  const x = await login(base, { resource: AUDIENCE });
  const y = await login(base, { resource: AUDIENCE, account: x.account });
  console.log(`  revoke X1 (live, no hint): ${await revoke(x.body.refresh_token!)}`);
  await rows(x.account.userId, "after the revoke of a live token");
  line("present X1 (revoked, never rotated) to the refresh grant", await refresh(base, x.body.refresh_token!, AUDIENCE));
  await rows(x.account.userId, "after that");
  line("Y1, the other sign-in", await refresh(base, y.body.refresh_token!, AUDIENCE));

  const q = await login(base, { resource: AUDIENCE });
  const q2 = await login(base, { resource: AUDIENCE, account: q.account });
  console.log(`  revoke Q1 (live, no hint): ${await revoke(q.body.refresh_token!)}`);
  console.log(`  revoke Q1 again (no hint): ${await revoke(q.body.refresh_token!)}`);
  await rows(q.account.userId, "after the second revoke");
  line("the other sign-in", await refresh(base, q2.body.refresh_token!, AUDIENCE));

  for (const hint of [undefined, "refresh_token"]) {
    const r = await login(base, { resource: AUDIENCE });
    const r2 = await login(base, { resource: AUDIENCE, account: r.account });
    await refresh(base, r.body.refresh_token!, AUDIENCE);
    console.log(`  revoke R1 (rotated, hint ${hint ?? "none"}): ${await revoke(r.body.refresh_token!, hint)}`);
    await rows(r.account.userId, "after it");
    line("the other sign-in", await refresh(base, r2.body.refresh_token!, AUDIENCE));
  }
  console.log(`  revoke an unknown token (no hint): ${await revoke("not-a-token-of-this-server")}`);

  console.log("== P4: the provider's own family delete, on an authorization-code replay");
  const t = { account: (await login(base)).account };
  const v = pkce();
  const code = await authorize(t.account, v.challenge, { resource: AUDIENCE });
  const tx = await exchange(base, code, v.verifier, AUDIENCE);
  line("exchange code X", tx);
  line("rotate X1 -> X2", await refresh(base, tx.body.refresh_token!, AUDIENCE));
  const ty = await login(base, { resource: AUDIENCE, account: t.account });
  await rows(t.account.userId, "three sign-ins (the first, plain), X rotated once");
  line("exchange code X again", await exchange(base, code, v.verifier, AUDIENCE));
  await rows(t.account.userId, "after the replay of code X");
  line("Y1, another sign-in", await refresh(base, ty.body.refresh_token!, AUDIENCE));

  console.log("== P5: two web sessions of one account");
  const w = await login(base, { resource: AUDIENCE });
  const second = (await signIn(base, w.account.email)).account as Account;
  await login(base, { resource: AUDIENCE, account: second });
  await rows(w.account.userId, "one sign-in per web session");

  console.log("== P6: the session JWT of GET /api/auth/token");
  const s = await fetch(new URL("/api/auth/token", base), { headers: { Cookie: w.account.cookie } });
  const { token } = (await s.json()) as { token?: string };
  const sj = decodeJwt(token!);
  console.log(`  ${s.status} header=${JSON.stringify(sj.header)} iss=${sj.payload.iss} aud=${JSON.stringify(sj.payload.aud)} azp=${sj.payload.azp} exp-iat=${(sj.payload.exp as number) - (sj.payload.iat as number)} kid same as the access token: ${sj.header.kid === decodeJwt(w.body.access_token!).header.kid} claims=${Object.keys(sj.payload).sort().join(",")}`);

  console.log("== P7: the refresh row Task 7 would insert by hand (plan, Task 7 step 4 item 3), then refreshed with the resource");
  const u = await login(base, { resource: AUDIENCE });
  const insert = async (authorizationCodeId: string | null) => {
    const raw = randomToken();
    const hash = await sha256Base64Url(raw);
    await withDb((db) =>
      db.insert(oauthRefreshToken).values({
        id: crypto.randomUUID(),
        token: hash,
        clientId: "monoagent",
        userId: u.account.userId,
        scopes: MONOAGENT_SCOPES.split(" "),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        ...(authorizationCodeId ? { authorizationCodeId } : {}),
      }),
    );
    return raw;
  };
  const nullKey = await insert(null);
  line("refresh the row as planned (no authorization_code_id)", await refresh(base, nullKey, AUDIENCE));
  const keyed = await insert(`email-claim:${crypto.randomUUID()}`);
  line("refresh a row with authorization_code_id email-claim:<id>", await refresh(base, keyed, AUDIENCE));
  await rows(u.account.userId, "the browser sign-in, then the two hand-made chains");

  console.log("== P8: the family columns when web sessions end (revoke-sessions, change-password)");
  const post = async (path: string, cookie: string, body: object = {}) =>
    (await fetch(new URL(path, base), { method: "POST", headers: { "Content-Type": "application/json", Origin: new URL(base).origin, Cookie: cookie }, body: JSON.stringify(body) })).status;
  const m = await login(base, { resource: AUDIENCE });
  await rows(m.account.userId, "one sign-in");
  console.log(`  revoke-sessions: ${await post("/api/auth/revoke-sessions", ((await signIn(base, m.account.email)).account as Account).cookie)}`);
  await rows(m.account.userId, "after revoke-sessions");
  const m3 = await login(base, { resource: AUDIENCE, account: (await signIn(base, m.account.email)).account as Account });
  const keep = (await signIn(base, m.account.email)).account as Account;
  console.log(`  change-password (revokeOtherSessions): ${await post("/api/auth/change-password", keep.cookie, { currentPassword: "TestPass1234", newPassword: "TestPass5678", revokeOtherSessions: true })}`);
  await rows(m.account.userId, "after change-password");
  line("the first sign-in", await refresh(base, m.body.refresh_token!, AUDIENCE));
  line("the second sign-in", await refresh(base, m3.body.refresh_token!, AUDIENCE));

  console.log("== P9: two concurrent refreshes of one token (three trials)");
  for (let i = 1; i <= 3; i++) {
    const n = await login(base, { resource: AUDIENCE });
    const other = await login(base, { resource: AUDIENCE, account: n.account });
    const [first, second] = await Promise.all([refresh(base, n.body.refresh_token!, AUDIENCE), refresh(base, n.body.refresh_token!, AUDIENCE)]);
    line(`trial ${i}: request 1`, first);
    line(`trial ${i}: request 2`, second);
    line(`trial ${i}: the other sign-in`, await refresh(base, other.body.refresh_token!, AUDIENCE));
  }

  await sidAfterSignOut();
}

// P10 (fix round 1): `sid` on an access token refreshed after the web session ended. Alone: s7-probe.ts P10
async function sidAfterSignOut() {
  console.log("== P10: sid on an access token refreshed after the web session ended");
  const sidType = (t: string | undefined) => {
    const sid = decodeJwt(t!).payload.sid;
    return sid === null ? "JSON null" : typeof sid;
  };
  const z = await login(base, { resource: AUDIENCE });
  console.log(`  the browser sign-in's access token: sid is ${sidType(z.body.access_token)}`);
  const out = await fetch(new URL("/api/auth/sign-out", base), { method: "POST", headers: { "Content-Type": "application/json", Origin: new URL(base).origin, Cookie: z.account.cookie }, body: "{}" });
  const z2 = await refresh(base, z.body.refresh_token!, AUDIENCE);
  console.log(`  sign-out ${out.status}, then a refresh ${z2.status}: sid is ${sidType(z2.body.access_token)}`);
}

function randomToken() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

(process.argv[2] === "P10" ? sidAfterSignOut() : main()).catch((err) => {
  console.error(err);
  process.exit(1);
});
