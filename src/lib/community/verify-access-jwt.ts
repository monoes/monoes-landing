import { createLocalJWKSet, jwtVerify, type JSONWebKeySet } from "jose";
import { getAuth } from "@/lib/auth";
import { MONOAGENT_AUDIENCE, MONOAGENT_CLIENT_ID, authIssuer } from "@/lib/monoagent-token";

// Opaque access tokens are random letters and digits, so a token with three
// dot-separated parts is a JWT.
export function looksLikeJwt(token: string): boolean {
  return token.split(".").length === 3;
}

/**
 * Verifies an audience-bound MonoAgent access token (a JWT the oauth-provider
 * minted for a `resource`): signature against this server's own JWKS, issuer,
 * audience, expiry, one algorithm, the at+jwt type and the monoagent client.
 * Returns who it is for and its scopes, or null for anything else. Whether the
 * account is blocked is the caller's business, as it is for opaque tokens.
 */
export async function verifyMonoagentAccessToken(
  token: string,
  now: Date = new Date(),
): Promise<{ userId: string; scopes: string[] } | null> {
  let jwks: JSONWebKeySet;
  try {
    jwks = (await getAuth().api.getJwks()) as JSONWebKeySet;
  } catch (error) {
    console.error("access token verification: no signing key available", error instanceof Error ? error.message : error);
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, createLocalJWKSet(jwks), {
      issuer: authIssuer(),
      audience: MONOAGENT_AUDIENCE,
      algorithms: ["EdDSA"],
      typ: "at+jwt",
      currentDate: now,
    });
    if (payload.azp !== MONOAGENT_CLIENT_ID || payload.client_id !== MONOAGENT_CLIENT_ID) return null;
    if (typeof payload.sub !== "string" || payload.sub.length === 0) return null;
    const scopes = typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : [];
    return { userId: payload.sub, scopes };
  } catch {
    return null;
  }
}
