import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailClaimRequest, oauthAccessToken, user } from "@/lib/db/schema";
import { sha256Base64Url } from "@/lib/community/hash-token";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const INVALID_OR_EXPIRED = NextResponse.json({ error: "invalid_or_expired_code" }, { status: 400 });

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
    | { email?: unknown; code?: unknown; client_id?: unknown }
    | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const clientId = typeof body?.client_id === "string" ? body.client_id.trim() : "";

  if (!email || !code || !clientId) {
    return INVALID_OR_EXPIRED;
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
    return INVALID_OR_EXPIRED;
  }

  if (attemptsExhausted(claim.attempts)) {
    await db
      .update(emailClaimRequest)
      .set({ consumedAt: now })
      .where(eq(emailClaimRequest.id, claim.id));
    return INVALID_OR_EXPIRED;
  }

  const nextAttempts = claim.attempts + 1;
  await db
    .update(emailClaimRequest)
    .set({ attempts: nextAttempts })
    .where(eq(emailClaimRequest.id, claim.id));

  const providedHash = await sha256Base64Url(code);
  if (providedHash !== claim.codeHash) {
    return INVALID_OR_EXPIRED;
  }

  await db
    .update(emailClaimRequest)
    .set({ consumedAt: now })
    .where(eq(emailClaimRequest.id, claim.id));

  const [matchedUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (!matchedUser) {
    return INVALID_OR_EXPIRED;
  }

  const rawToken = /* opaque */ generateOpaqueToken();
  const hashedToken = /* hash */ await sha256Base64Url(rawToken);
  const scopes = claim.scope.split(/\s+/).filter(Boolean);
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  await db.insert(oauthAccessToken).values({
    id: crypto.randomUUID(),
    token: /* hash */ hashedToken,
    clientId,
    userId: matchedUser.id,
    scopes,
    expiresAt,
    createdAt: now,
  });

  return NextResponse.json({
    access_token: /* value */ rawToken,
    token_type: "Bearer",
    expires_in: TOKEN_TTL_MS / 1000,
    scope: claim.scope,
  });
}
