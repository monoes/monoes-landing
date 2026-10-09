import { NextResponse } from "next/server";
import { isAPIError } from "better-auth/api";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailClaimRequest, oauthAccessToken, oauthRefreshToken, user } from "@/lib/db/schema";
import { sha256Base64Url } from "@/lib/community/hash-token";
import { getAuth } from "@/lib/auth";
import { MONOAGENT_AUDIENCE, MONOAGENT_CLIENT_ID } from "@/lib/monoagent-token";

const TOKEN_TTL_MS = 60 * 60 * 1000;
// The oauth-provider's own refreshTokenExpiresIn default (30 days).
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function invalidOrExpired() {
  return NextResponse.json({ error: "invalid_or_expired_code" }, { status: 400 });
}

export function isExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() < now.getTime();
}

export function attemptsExhausted(attempts: number): boolean {
  return attempts >= MAX_ATTEMPTS;
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateOpaqueToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; code?: unknown; client_id?: unknown; resource?: unknown }
    | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const clientId = typeof body?.client_id === "string" ? body.client_id.trim() : "";

  if (!email || !code || !clientId) {
    return invalidOrExpired();
  }

  // RFC 8707, as on the token endpoint: only MonoAgent may ask for the MonoAgent audience. Judged
  // on the request alone, so a wrong value is answered before the code is looked at or burned.
  const resource = body?.resource;
  if (resource !== undefined && (resource !== MONOAGENT_AUDIENCE || clientId !== MONOAGENT_CLIENT_ID)) {
    return NextResponse.json({ error: "invalid_target" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();

  const [claim] = await db
    .select()
    .from(emailClaimRequest)
    .where(
      and(
        eq(emailClaimRequest.email, email),
        eq(emailClaimRequest.clientId, clientId),
        isNull(emailClaimRequest.consumedAt),
      ),
    )
    .orderBy(desc(emailClaimRequest.createdAt))
    .limit(1);

  if (!claim || isExpired(claim.expiresAt, now)) {
    return invalidOrExpired();
  }

  if (attemptsExhausted(claim.attempts)) {
    await db
      .update(emailClaimRequest)
      .set({ consumedAt: now })
      .where(eq(emailClaimRequest.id, claim.id));
    return invalidOrExpired();
  }

  const nextAttempts = claim.attempts + 1;
  await db
    .update(emailClaimRequest)
    .set({ attempts: nextAttempts })
    .where(eq(emailClaimRequest.id, claim.id));

  const providedHash = await sha256Base64Url(code);
  if (providedHash !== claim.codeHash) {
    return invalidOrExpired();
  }

  await db
    .update(emailClaimRequest)
    .set({ consumedAt: now })
    .where(eq(emailClaimRequest.id, claim.id));

  const [matchedUser] = await db
    .select({ id: user.id, blockedAt: user.blockedAt })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (!matchedUser || matchedUser.blockedAt) {
    return invalidOrExpired();
  }

  const rawToken = /* opaque */ generateOpaqueToken();
  const hashedToken = /* hash */ await sha256Base64Url(rawToken);
  const scopes = claim.scope.split(/\s+/).filter(Boolean);
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  // MonoAgent's headless sign-in has to end where the browser flow ends: with an audience-bound JWT
  // and a refresh token. For the MonoAgent client and an offline_access claim the route hands out a
  // refresh token (the row the provider's refresh grant reads), which the client trades at the token
  // endpoint with `resource`. A client that sends `resource` here has that trade done for it, in the
  // token endpoint's own answer, so the JWT, its claims, the signing key and the blocked-account
  // guard are the provider's. Any other client is answered as it always was.
  let refresh: { id: string; raw: string } | null = null;
  if (clientId === MONOAGENT_CLIENT_ID && scopes.includes("offline_access")) {
    refresh = { id: crypto.randomUUID(), raw: generateOpaqueToken() };
    await db.insert(oauthRefreshToken).values({
      id: refresh.id,
      token: await sha256Base64Url(refresh.raw),
      clientId,
      userId: matchedUser.id,
      // The chain's family key, as an authorization code's hash is for a browser sign-in: a replay
      // after the reuse window ends this sign-in alone (Task 3, src/lib/refresh-family.ts).
      authorizationCodeId: `email-claim:${claim.id}`,
      scopes,
      expiresAt: new Date(now.getTime() + REFRESH_TTL_MS),
      createdAt: now,
    });
    if (resource) {
      try {
        const minted = await getAuth().api.oauth2Token({
          body: { grant_type: "refresh_token", refresh_token: refresh.raw, client_id: clientId, resource },
        });
        return NextResponse.json(minted, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        if (isAPIError(error)) return NextResponse.json(error.body, { status: error.statusCode });
        throw error;
      }
    }
  }

  await db.insert(oauthAccessToken).values({
    id: crypto.randomUUID(),
    token: /* hash */ hashedToken,
    clientId,
    userId: matchedUser.id,
    refreshId: refresh?.id,
    scopes,
    expiresAt,
    createdAt: now,
  });

  return NextResponse.json({
    access_token: /* value */ rawToken,
    token_type: "Bearer",
    expires_in: TOKEN_TTL_MS / 1000,
    scope: claim.scope,
    ...(refresh ? { refresh_token: refresh.raw } : {}),
  });
}
