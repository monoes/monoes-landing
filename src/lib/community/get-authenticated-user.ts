import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { oauthAccessToken, user } from "@/lib/db/schema";
import { sha256Base64Url } from "@/lib/community/hash-token";
import { looksLikeJwt, verifyMonoagentAccessToken } from "@/lib/community/verify-access-jwt";

export type AuthenticatedUser = {
  id: string;
  username: string | null;
  role: "member" | "moderator" | "admin";
  blockedAt: Date | string | null;
};

// @better-auth/oauth-provider stores opaque access tokens hashed (SHA-256,
// base64url, no padding) rather than in plaintext — confirmed empirically
// against a real issued token and its stored row (see
// docs/mastermind/specs/2026-08-23-oauth-authorization-server-design.md).
// There is no lower-risk way to look this up: the plugin's own
// verifyAccessTokenRequest/verifyBearerToken helpers only support JWT
// access tokens (via jwksUrl) or remote introspection (which requires
// confidential-client credentials our public client doesn't have), and this
// app already IS the resource server holding the same database, so a
// direct lookup avoids both dead ends. The email-claim flow
// (src/app/api/auth/agent/claim/verify/route.ts) issues tokens into this
// same table using the same hash, so both paths verify identically here.

/**
 * Resolves the authenticated user for a /api/community/* request: the
 * existing session-cookie flow first (unchanged behavior), falling back to
 * an OAuth Bearer access token checked against `requiredScope`. Returns
 * null if neither authenticates — callers already 401 on a falsy return,
 * matching the prior getSession-based check exactly.
 */
export async function getAuthenticatedUser(
  request: Request,
  requiredScope: "community:read" | "community:write" | "library:read" | "library:write",
): Promise<{ user: AuthenticatedUser } | null> {
  const auth = await getRequestAuth(request, requiredScope);
  return auth ? { user: auth.user } : null;
}

/**
 * Like getAuthenticatedUser, but also says how the request authenticated:
 * `scopes` is null for a session cookie (the web UI, which has every scope)
 * and the token's granted scopes for a Bearer token. With no
 * `requiredScope`, any valid token is accepted.
 */
export async function getRequestAuth(
  request: Request,
  requiredScope?: string,
): Promise<{ user: AuthenticatedUser; scopes: string[] | null } | null> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (session) {
    return { user: session.user as unknown as AuthenticatedUser, scopes: null };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const bearerValue = authHeader.slice("bearer ".length).trim();
  if (!bearerValue) return null;

  // An audience-bound MonoAgent token is a JWT with no stored row to look up.
  if (looksLikeJwt(bearerValue)) return jwtRequestAuth(bearerValue, requiredScope);

  const hashedToken = await sha256Base64Url(bearerValue);
  const db = getDb();
  const [tokenRow] = await db
    .select({
      userId: oauthAccessToken.userId,
      scopes: oauthAccessToken.scopes,
      expiresAt: oauthAccessToken.expiresAt,
      revoked: oauthAccessToken.revoked,
    })
    .from(oauthAccessToken)
    .where(eq(oauthAccessToken.token, hashedToken))
    .limit(1);

  if (!tokenRow || !tokenRow.userId || tokenRow.revoked) return null;
  if (!tokenRow.expiresAt || tokenRow.expiresAt.getTime() < Date.now()) return null;

  // The D1 driver doesn't always auto-parse the `{ mode: "json" }` scopes
  // column (observed returning a JSON-encoded string rather than an array,
  // depending on query path) — handle both shapes rather than assuming one.
  let scopes: string[] = [];
  if (Array.isArray(tokenRow.scopes)) {
    scopes = tokenRow.scopes as string[];
  } else if (typeof tokenRow.scopes === "string") {
    try {
      const parsed = JSON.parse(tokenRow.scopes);
      if (Array.isArray(parsed)) scopes = parsed;
    } catch {
      scopes = [];
    }
  }
  if (requiredScope && !scopes.includes(requiredScope)) return null;

  const [row] = await db
    .select({ id: user.id, username: user.username, role: user.role, blockedAt: user.blockedAt })
    .from(user)
    .where(eq(user.id, tokenRow.userId))
    .limit(1);
  if (!row) return null;

  return { user: row as AuthenticatedUser, scopes };
}

async function jwtRequestAuth(
  token: string,
  requiredScope?: string,
): Promise<{ user: AuthenticatedUser; scopes: string[] } | null> {
  const verified = await verifyMonoagentAccessToken(token);
  if (!verified) return null;
  if (requiredScope && !verified.scopes.includes(requiredScope)) return null;

  const [row] = await getDb()
    .select({ id: user.id, username: user.username, role: user.role, blockedAt: user.blockedAt })
    .from(user)
    .where(eq(user.id, verified.userId))
    .limit(1);
  if (!row) return null;

  return { user: row as AuthenticatedUser, scopes: verified.scopes };
}
