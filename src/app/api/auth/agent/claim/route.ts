import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailClaimRequest, oauthClient, user } from "@/lib/db/schema";
import { OAUTH_SCOPES } from "@/lib/auth";
import { sha256Base64Url } from "@/lib/community/hash-token";

const CLAIM_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidScope(scope: string): boolean {
  const tokens = scope.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.every((token) => (OAUTH_SCOPES as readonly string[]).includes(token));
}

export function exceedsRateLimit(existingCount: number): boolean {
  return existingCount >= RATE_LIMIT_MAX;
}

/** Rejection-sampled 6-digit numeric code (avoids modulo bias). */
export function generateCode(): string {
  const MAX_VALID = Math.floor(0x100000000 / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= MAX_VALID);
  return String(value % 1_000_000).padStart(6, "0");
}

async function sendClaimEmail(email: string, code: string): Promise<void> {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "monoes.me <noreply@monoes.me>",
        to: email,
        subject: "Your monoes.me verification code",
        text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, ignore this email.`,
      }),
    });
  } catch (error) {
    console.error("Failed to send claim email", error);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; client_id?: unknown; scope?: unknown }
    | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const clientId = typeof body?.client_id === "string" ? body.client_id.trim() : "";
  const scope = typeof body?.scope === "string" ? body.scope.trim() : "";

  if (!isValidEmail(email) || !clientId || !isValidScope(scope)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const db = getDb();

  const [client] = await db
    .select({ clientId: oauthClient.clientId })
    .from(oauthClient)
    .where(eq(oauthClient.clientId, clientId))
    .limit(1);
  if (!client) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
  const recentClaims = await db
    .select({ id: emailClaimRequest.id })
    .from(emailClaimRequest)
    .where(
      and(
        eq(emailClaimRequest.email, email),
        isNull(emailClaimRequest.consumedAt),
        gt(emailClaimRequest.expiresAt, now),
        gt(emailClaimRequest.createdAt, windowStart),
      ),
    );
  if (exceedsRateLimit(recentClaims.length)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const [matchedUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

  if (matchedUser) {
    const code = generateCode();
    const codeHash = await sha256Base64Url(code);
    await db.insert(emailClaimRequest).values({
      id: crypto.randomUUID(),
      email,
      codeHash,
      clientId,
      scope,
      attempts: 0,
      expiresAt: new Date(now.getTime() + CLAIM_TTL_MS),
      createdAt: now,
    });
    await sendClaimEmail(email, code);
  }

  return NextResponse.json({ message: "If this email is registered, a verification code has been sent." });
}
