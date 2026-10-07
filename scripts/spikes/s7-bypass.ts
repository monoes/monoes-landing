// S7, fix round 1 (task-2-review-1.md): does a hook keyed on the plain request see what the provider acts on?
// Each case: one account, MonoAgent sign-ins A and B, A rotated once (A1 presented, A2 its successor, B1 the other
// sign-in). Columns: what a hook keyed on the plain request sees (better-call's own getBody on the same body, judged
// by the c9d4f646 rule); what the corrected rule would do (computed, not run); what the provider does (measured:
// answer, the account's MonoAgent refresh rows before -> after, B1's next refresh). No token value is printed.
//   npx tsx scripts/spikes/s7-bypass.ts
import { and, count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getPlatformProxy } from "wrangler";
import { stripAccessTokenAuthorizationScheme } from "better-auth/oauth2";
import { getBody } from "../../node_modules/better-call/dist/utils.mjs";
import { oauthRefreshToken } from "../../src/lib/db/schema";
import { sha256Base64Url } from "../../src/lib/community/hash-token";
import { AUDIENCE, authorize, exchange, login, pkce, refresh } from "../../tests/helpers/oauth-api";

const base = process.env.SPIKE_BASE_URL ?? "http://localhost:3107";
const FORM = { "Content-Type": "application/x-www-form-urlencoded" };
type Row = { clientId: string; expiresAt: Date | null; revoked: Date | null; rotatedAt: Date | null; replayUntil: Date | null };
type Route = "token" | "revoke";

// One platform proxy for the whole run (a proxy per call raced the dev server for the SQLite file: SQLITE_BUSY).
let db: ReturnType<typeof drizzle>;
async function retry<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === 5) throw err;
      await new Promise((r) => setTimeout(r, 1000)); // every call here is idempotent
    }
  }
}

const rowOf = (value: string) =>
  retry(async () => {
    const [r] = await db
      .select({ clientId: oauthRefreshToken.clientId, expiresAt: oauthRefreshToken.expiresAt, revoked: oauthRefreshToken.revoked, rotatedAt: oauthRefreshToken.rotatedAt, replayUntil: oauthRefreshToken.rotationReplayExpiresAt })
      .from(oauthRefreshToken)
      .where(eq(oauthRefreshToken.token, await sha256Base64Url(value)));
    return r as Row | undefined;
  });
const rowsOf = (userId: string, clientId = "monoagent") =>
  retry(async () => (await db.select({ n: count() }).from(oauthRefreshToken).where(and(eq(oauthRefreshToken.userId, userId), eq(oauthRefreshToken.clientId, clientId))))[0].n);
const setRow = (value: string, set: Partial<{ expiresAt: Date; rotationReplayExpiresAt: Date }>) =>
  retry(async () => db.update(oauthRefreshToken).set(set).where(eq(oauthRefreshToken.token, await sha256Base64Url(value))));

async function send(path: string, raw: string) {
  const res = await fetch(new URL(`/api/auth${path}`, base), { method: "POST", headers: FORM, body: raw });
  const text = await res.text();
  let body: { error?: string; error_description?: string } = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {}
  return `${res.status} ${body.error ?? (text ? "ok" : "(empty)")}${body.error_description ? ` (${body.error_description})` : ""}`;
}

// The c9d4f646 rule (findings, S7 answer 5 as first written), on the body a hook receives.
function firstRule(route: Route, body: Record<string, string>, row: Row | undefined) {
  if (route === "token" && body.grant_type !== "refresh_token") return `grant_type=${JSON.stringify(body.grant_type)}: steps aside`;
  if (body.client_id !== "monoagent") return `client_id=${JSON.stringify(body.client_id ?? null)}: steps aside`;
  if (route === "revoke" && body.token_type_hint !== undefined && body.token_type_hint !== "refresh_token") return `token_type_hint=${JSON.stringify(body.token_type_hint)}: steps aside`;
  if (!row) return "no row for the value as sent: steps aside";
  if (row.clientId !== "monoagent") return "another client's row: steps aside";
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return "expired: steps aside";
  if (!row.revoked) return "live: steps aside";
  if (row.rotatedAt && row.replayUntil && row.replayUntil.getTime() >= Date.now()) return "inside the window: steps aside";
  return "acts: ends A's family";
}

// The corrected rule (findings, "Corrected S7 answer 5").
function correctedRule(route: Route, body: Record<string, string>, raw: string, asSent: Row | undefined, normalized: Row | undefined) {
  if (route === "token") {
    if (String(body.grant_type ?? "").trim() !== "refresh_token") return "not a refresh grant: steps aside";
    const row = asSent; // the provider hashes refresh_token as sent (the schema does not trim it)
    if (!row) return "no row: steps aside";
    if (row.clientId !== "monoagent") return "another client's row: steps aside";
    if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return "expired: steps aside";
    if (!row.revoked) return "live: steps aside";
    if (row.rotatedAt && row.replayUntil && row.replayUntil.getTime() >= Date.now() + 10_000) return "inside the window: steps aside";
    return "acts: ends A's family, 400 invalid_grant";
  }
  if (body.token_type_hint === "access_token") return "hint access_token: steps aside";
  const ids = new URLSearchParams(raw).getAll("client_id").filter((v) => v.length > 0);
  if (ids.length > 1) return "two client_ids: steps aside (the provider refuses)";
  if ((ids[0] ?? body.client_id) !== "monoagent") return "caller is not monoagent: steps aside";
  if (!normalized) return "no row: steps aside";
  const answer = normalized.revoked ? 400 : 200;
  return normalized.clientId === "monoagent" ? `owns it: ends A's family, ${answer}` : `owns it: deletes nothing, ${answer}`;
}

type Case = { name: string; route: Route; prepare?: (a1: string) => Promise<void>; body: (a1: string) => [string, string][]; presented?: "dynamic" };

const revoke = (token: string, extra: [string, string][] = []): [string, string][] => [["token", token], ["client_id", "monoagent"], ...extra];
const refreshGrant = (token: string, extra: [string, string][] = [], grant = "refresh_token"): [string, string][] => [["grant_type", grant], ["refresh_token", token], ["client_id", "monoagent"], ["resource", AUDIENCE], ...extra];
const inWindow = (a1: string) => setRow(a1, { rotationReplayExpiresAt: new Date(Date.now() + 300_000) });
const expired = (a1: string) => setRow(a1, { expiresAt: new Date(Date.now() - 1000) });

const cases: Case[] = [
  { name: "R1 revoke: A1 rotated <300 s ago (window set by SQL)", route: "revoke", prepare: inWindow, body: (t) => revoke(t) },
  { name: "R2 revoke: A1 rotated and expired (expires_at by SQL)", route: "revoke", prepare: expired, body: (t) => revoke(t) },
  { name: "R3 revoke: client_id=monoagent&client_id=", route: "revoke", body: (t) => revoke(t, [["client_id", ""]]) },
  { name: "R4 revoke: token_type_hint=x", route: "revoke", body: (t) => revoke(t, [["token_type_hint", "x"]]) },
  { name: "R5 revoke: token=Bearer <A1>", route: "revoke", body: (t) => revoke(`Bearer ${t}`) },
  { name: "R6 revoke: token=' <A1> ' (spaces)", route: "revoke", body: (t) => revoke(` ${t} `) },
  { name: "R7 revoke: another client's revoked row, client_id=monoagent", route: "revoke", body: (t) => revoke(t), presented: "dynamic" },
  { name: "T1 token: grant_type='refresh_token ' (trailing space)", route: "token", body: (t) => refreshGrant(t, [], "refresh_token ") },
  { name: "T2 token: client_id=monoagent&client_id=", route: "token", body: (t) => refreshGrant(t, [["client_id", ""]]) },
  { name: "T3 token: refresh_token=' <A1> ' (spaces), control", route: "token", body: (t) => refreshGrant(` ${t} `) },
  { name: "C1 token: A1 rotated <300 s ago (window set by SQL), control", route: "token", prepare: inWindow, body: (t) => refreshGrant(t) },
  { name: "C2 token: A1 rotated and expired, control", route: "token", prepare: expired, body: (t) => refreshGrant(t) },
];

// A dynamically registered client's rotated refresh token for the same user (case R7).
async function dynamicRotated(account: Awaited<ReturnType<typeof login>>["account"]) {
  const redirectUri = "https://example-agent.test/callback";
  const reg = await fetch(new URL("/api/auth/oauth2/register", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: [redirectUri], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"] }),
  });
  const { client_id: clientId } = (await reg.json()) as { client_id: string };
  const p = pkce();
  const code = await authorize(account, p.challenge, { clientId, redirectUri, scope: "community:read offline_access" });
  const first = await exchange(base, code, p.verifier, undefined, redirectUri, clientId);
  const rotate = await fetch(new URL("/api/auth/oauth2/token", base), { method: "POST", headers: FORM, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: first.body.refresh_token!, client_id: clientId }) });
  if (!first.body.refresh_token || rotate.status !== 200) throw new Error(`dynamic client setup failed: ${first.status} ${rotate.status}`);
  return { clientId, d1: first.body.refresh_token };
}

async function main() {
  const proxy = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  db = drizzle(proxy.env.COMMUNITY_DB);
  try {
    await table();
  } finally {
    await proxy.dispose();
  }
}

async function table() {
  console.log("| case | hook keyed on the plain request (c9d4f646 rule) | corrected rule (computed) | provider (measured): answer; MonoAgent rows; B1 |");
  console.log("|---|---|---|---|");
  for (const c of cases) {
    const a = await login(base, { resource: AUDIENCE });
    const b = await login(base, { resource: AUDIENCE, account: a.account });
    const a1 = a.body.refresh_token!;
    if ((await refresh(base, a1, AUDIENCE)).status !== 200) throw new Error("rotation failed");
    await c.prepare?.(a1);
    const dynamic = c.presented === "dynamic" ? await dynamicRotated(a.account) : undefined;
    const presented = dynamic?.d1 ?? a1;

    const raw = new URLSearchParams(c.body(presented)).toString();
    const path = c.route === "token" ? "/oauth2/token" : "/oauth2/revoke";
    const body = (await getBody(new Request(new URL(`/api/auth${path}`, base), { method: "POST", headers: FORM, body: raw }))) as Record<string, string>;
    const asSent = await rowOf(c.route === "token" ? body.refresh_token : body.token);
    const normalized = c.route === "revoke" ? await rowOf(stripAccessTokenAuthorizationScheme(body.token)) : asSent;

    const first = firstRule(c.route, body, asSent);
    const corrected = correctedRule(c.route, body, raw, asSent, normalized);
    const before = await rowsOf(a.account.userId);
    const dynBefore = dynamic ? await rowsOf(a.account.userId, dynamic.clientId) : 0;
    const answer = await send(path, raw);
    const after = await rowsOf(a.account.userId);
    const dynAfter = dynamic ? `; the other client's rows ${dynBefore} -> ${await rowsOf(a.account.userId, dynamic.clientId)}` : "";
    const other = await refresh(base, b.body.refresh_token!, AUDIENCE);
    console.log(`| ${c.name} | ${first} | ${corrected} | ${answer}; rows ${before} -> ${after}${dynAfter}; B1 ${other.status} ${other.body.error ?? "ok"} |`);
  }
}

main().catch((err) => {
  console.error(String((err as Error)?.message ?? err).split("\n")[0]); // the first line only: no query parameters
  process.exit(1);
});
