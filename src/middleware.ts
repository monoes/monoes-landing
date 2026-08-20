import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/community", "/community/login", "/community/register"]);
// Better Auth prefixes the cookie with "__Secure-" whenever the connection is
// https (production), but not over plain http (local dev) — clear both names
// since we can't know which one is active without importing better-auth's
// internal cookie-naming logic here.
const SESSION_COOKIE_NAMES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

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

// Exported separately (rather than as `middleware`'s own second parameter)
// so the production `middleware` export below keeps the exact single-argument
// signature Next.js invokes it with. Next.js actually calls middleware as
// `middleware(request, event)` — a second, non-optional NextFetchEvent
// argument — which would silently clobber a `getSession` default parameter
// if it lived directly on `middleware` itself.
export async function runMiddleware(
  request: NextRequest,
  getSession: GetSession = defaultGetSession,
) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/community/u/")) {
    return NextResponse.next();
  }

  const session = await getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/community/login", request.url));
  }

  const user = session.user as unknown as SessionUser;

  if (user.blockedAt) {
    const response = NextResponse.redirect(new URL("/community/login?blocked=1", request.url));
    for (const cookieName of SESSION_COOKIE_NAMES) {
      response.cookies.delete(cookieName);
    }
    return response;
  }

  if (!user.username && pathname !== "/community/onboarding") {
    return NextResponse.redirect(new URL("/community/onboarding", request.url));
  }

  const isAdminPath = pathname === "/community/admin" || pathname.startsWith("/community/admin/");
  if (isAdminPath && user.role !== "admin") {
    return NextResponse.redirect(new URL("/community", request.url));
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  return runMiddleware(request);
}

export const config = {
  matcher: ["/community/:path*"],
};
