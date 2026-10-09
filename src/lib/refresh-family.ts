import { and, eq, inArray } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { stripAccessTokenAuthorizationScheme } from "better-auth/oauth2";
import type { Db } from "@/lib/db";
import { oauthAccessToken, oauthRefreshToken } from "@/lib/db/schema";
import { sha256Base64Url } from "@/lib/community/hash-token";
import { MONOAGENT_CLIENT_ID } from "@/lib/monoagent-token";

// Refresh-token families (ruling R1 of 2026-10-07; spike S7, "Corrected S7 answer 5"). When a refresh token
// it rotated away is presented after the reuse window, or a revoked one is presented at all,
// @better-auth/oauth-provider 1.7.1 deletes every refresh token of the client and the user
// (invalidateRefreshFamily): one stale copy of a MonoAgent sign-in would sign every install of the account
// out. This before hook ends only the presented token's family instead: the chain of one sign-in, named by
// authorization_code_id (the stored hash of the authorization code, copied at every rotation; the email-code
// route writes `email-claim:<claim id>`). On the token route it acts where the provider would punish; at the
// revoke route it revokes MonoAgent's refresh tokens itself, so the provider's revocation never runs for them.

type RefreshRow = typeof oauthRefreshToken.$inferSelect;
type Body = Record<string, unknown>;

// The reuse window is judged 10 seconds early: the hook and the provider read the clock at different
// moments, and mono-agent never retries after 240 seconds, so no honest retry falls in the last 10 of the 300.
const WINDOW_MARGIN_MS = 10_000;

// The refresh token a token-route request presents, as the provider reads it: its schema trims grant_type,
// and it hashes refresh_token as sent.
export function refreshTokenOf(body: Body): string | undefined {
  return String(body.grant_type ?? "").trim() === "refresh_token" && typeof body.refresh_token === "string" ? body.refresh_token : undefined;
}

// The refresh token a revoke request presents, as the provider reads it: none when the hint is exactly
// access_token (any other hint counts as none), and the value trimmed and stripped of "Bearer " or "DPoP ".
export function revokedTokenOf(body: Body): string | undefined {
  if (body.token_type_hint === "access_token" || typeof body.token !== "string") return undefined;
  return stripAccessTokenAuthorizationScheme(body.token) || undefined;
}

// Whether the refresh grant would end the account for this stored row: a revoked, unexpired MonoAgent token
// presented outside the reuse window. Decided on the row alone, never on the request's client_id, which the
// provider reads from the raw form (a repeated client_id is one value to it and another to ctx.body); it only
// punishes a row of the caller's own client. Its other checks (resources, scopes, client validation) are not
// mirrored, which can only end a dead token's family where the provider would have ended nothing.
export function tokenRouteActs(row: RefreshRow | undefined, now: Date): row is RefreshRow {
  if (!row || row.clientId !== MONOAGENT_CLIENT_ID || !row.revoked || !row.expiresAt || row.expiresAt <= now) return false;
  return !(row.rotatedAt && row.rotationReplayExpiresAt && row.rotationReplayExpiresAt.getTime() >= now.getTime() + WINDOW_MARGIN_MS);
}

// The revoke route's caller, read as the provider reads it: the single non-empty client_id of the raw request
// text (two or more are refused). Never ctx.body, which better-call builds differently for a repeated field, a
// "+json" media type or a leading U+FEFF. Only an auth.api call, which has no request, is read from its body.
export async function revokeCaller(request: Request | undefined, body: Body): Promise<string | undefined> {
  if (!request) return typeof body.client_id === "string" && body.client_id ? body.client_id : undefined;
  const ids = new URLSearchParams(await request.clone().text()).getAll("client_id").filter((id) => id.length > 0);
  return ids.length === 1 ? ids[0] : undefined;
}

// The deletes that end the row's family, for one db.batch: its opaque access tokens, then its refresh tokens,
// the presented one included, so a later presentation finds no row and ends nothing more. A row without a
// family key ends alone: a filter on a null authorization_code_id would match nothing in SQL (`= NULL`), or
// every keyless chain of the user through the provider's adapter (`IS NULL`).
export function endFamily(db: Db, row: Pick<RefreshRow, "id" | "clientId" | "userId" | "authorizationCodeId">) {
  const family = row.authorizationCodeId
    ? and(
        eq(oauthRefreshToken.clientId, row.clientId),
        eq(oauthRefreshToken.userId, row.userId),
        eq(oauthRefreshToken.authorizationCodeId, row.authorizationCodeId),
      )
    : eq(oauthRefreshToken.id, row.id);
  const members = db.select({ id: oauthRefreshToken.id }).from(oauthRefreshToken).where(family);
  return [db.delete(oauthAccessToken).where(inArray(oauthAccessToken.refreshId, members)), db.delete(oauthRefreshToken).where(family)] as const;
}

const rowOf = async (db: Db, value: string) =>
  (await db.select().from(oauthRefreshToken).where(eq(oauthRefreshToken.token, await sha256Base64Url(value))).limit(1))[0];

async function endFamilyOf(db: Db, row: RefreshRow) {
  await db.batch(endFamily(db, row));
  // A rotation whose compare-and-set won just before the batch inserts its successor just after it: sweep again.
  await endFamily(db, row)[1];
}

// The before hook of getAuth (src/lib/auth.ts). It returns nothing for every request it leaves to the provider.
export async function endReplayedFamily(db: Db, ctx: { path?: string; body?: unknown; request?: Request }) {
  const body = (ctx.body ?? {}) as Body;
  if (ctx.path === "/oauth2/token") {
    const value = refreshTokenOf(body);
    const row = value === undefined ? undefined : await rowOf(db, value);
    if (!tokenRouteActs(row, new Date())) return;
    await endFamilyOf(db, row);
    throw new APIError("BAD_REQUEST", { error_description: "invalid refresh token", error: "invalid_grant" });
  }
  if (ctx.path !== "/oauth2/revoke") return;
  const value = revokedTokenOf(body);
  const row = value === undefined ? undefined : await rowOf(db, value);
  if (!row || (await revokeCaller(ctx.request, body)) !== MONOAGENT_CLIENT_ID) return;
  // Live or revoked, inside the window or not: a MonoAgent token revoked here ends its family. Another client's
  // token presented as monoagent's ends nothing (the provider would end every MonoAgent token of its user).
  if (row.clientId === MONOAGENT_CLIENT_ID) await endFamilyOf(db, row);
  if (!row.revoked) return new Response(null, { status: 200 });
  throw new APIError("BAD_REQUEST", { error_description: body.token_type_hint === "refresh_token" ? "refresh token revoked" : "token not found", error: "invalid_request" });
}
