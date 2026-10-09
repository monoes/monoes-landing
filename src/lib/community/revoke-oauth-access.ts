import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { oauthAccessToken, oauthRefreshToken, session } from "@/lib/db/schema";

/**
 * What ends everything a blocked user can still use, as statements to run in
 * the same batch as the block itself:
 * - their OAuth refresh tokens, so a refresh finds no row and answers
 *   invalid_grant (the one answer mono-agent reads as "monoes.me said no"),
 * - their OAuth access tokens (opaque ones are rows; audience-bound JWTs live
 *   out their hour and every route refuses a blocked user meanwhile),
 * - their web sessions, so a cookie that is still alive cannot authorize a
 *   new token.
 * Unblocking deletes nothing: the user signs in again from scratch.
 */
export function revokeOAuthAccess(db: Db, userId: string) {
  return [
    db.delete(oauthAccessToken).where(eq(oauthAccessToken.userId, userId)),
    db.delete(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId)),
    db.delete(session).where(eq(session.userId, userId)),
  ];
}
