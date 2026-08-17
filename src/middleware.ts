import { NextRequest, NextResponse } from "next/server.js";

const PUBLIC_PATHS = new Set(["/community", "/community/login", "/community/register"]);
const SESSION_COOKIE = "better-auth.session_token";

type SessionUser = {
  id: string;
  username: string | null;
  role: "member" | "moderator" | "admin";
  blockedAt: Date | string | null;
};

export type GetSession = (args: {
  headers: Headers;
}) => Promise<{ user: SessionUser } | null>;

// Deferred (dynamic) import so this module can be loaded — and its exported
// `middleware` function unit tested with an injected `getSession` — without
// eagerly resolving "@/lib/auth" (and its D1/Drizzle dependencies) at import
// time. In production this codepath still resolves via the same Next.js
// module graph as a static import would.
const defaultGetSession: GetSession = async (args) => {
  const { getAuth } = await import("@/lib/auth");
  const session = await getAuth().api.getSession(args);
  return session as unknown as { user: SessionUser } | null;
};

export async function middleware(
  request: NextRequest,
  getSession: GetSession = defaultGetSession,
) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/community/login", request.url));
  }

  const user = session.user as unknown as SessionUser;

  if (user.blockedAt) {
    const response = NextResponse.redirect(new URL("/community/login?blocked=1", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (!user.username && pathname !== "/community/onboarding") {
    return NextResponse.redirect(new URL("/community/onboarding", request.url));
  }

  if (pathname.startsWith("/community/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/community", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/community/:path*"],
};
