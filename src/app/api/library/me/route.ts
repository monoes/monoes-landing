import { eq } from "drizzle-orm";
import { OAUTH_SCOPES } from "@/lib/auth";
import { getRequestAuth } from "@/lib/community/get-authenticated-user";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { apiError } from "@/lib/library/http";

// Who MonoAgent is logged in as. Any valid token works; `scopes` is what
// it was granted (a web session has them all).
export async function GET(request: Request) {
  const auth = await getRequestAuth(request);
  if (!auth) return apiError(401, "unauthorized", "Sign in or send a Bearer access token.");
  if (auth.user.blockedAt) return apiError(403, "blocked", "This account is blocked.");

  const [row] = await getDb()
    .select({ id: user.id, name: user.name, username: user.username, email: user.email, image: user.image })
    .from(user)
    .where(eq(user.id, auth.user.id))
    .limit(1);
  if (!row) return apiError(401, "unauthorized", "The account no longer exists.");

  return Response.json({ user: row, scopes: auth.scopes ?? [...OAUTH_SCOPES] });
}
