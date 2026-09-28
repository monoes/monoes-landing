import { getRequestAuth, type AuthenticatedUser } from "@/lib/community/get-authenticated-user";
import { LibraryError } from "./types";

export type LibraryScope = "library:read" | "library:write";

export const LOGIN_REQUIRED = "Log in to monoes.me to browse the library";

/**
 * The caller, required: 401 without credentials, 403 `insufficient_scope`
 * for a token that lacks `scope`, 403 for a blocked account. Session
 * cookies (the web UI) carry every scope.
 */
export async function requireUser(request: Request, scope: LibraryScope): Promise<AuthenticatedUser> {
  const auth = await getRequestAuth(request);
  if (!auth) throw new LibraryError(401, "unauthorized", LOGIN_REQUIRED);
  if (auth.scopes && !auth.scopes.includes(scope)) {
    throw new LibraryError(403, "insufficient_scope", `This token needs the ${scope} scope.`);
  }
  if (auth.user.blockedAt) throw new LibraryError(403, "blocked", "This account is blocked.");
  return auth.user;
}
