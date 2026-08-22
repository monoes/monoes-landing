import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/community", "/community/login", "/community/register", "/community/api-docs"]);
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

// Pages under /community are either auth-gated or app UI, not the kind of
// dense marketing/reference content this exists to strip down for agents;
// API routes, Next internals, and well-known files are handled by the
// matcher below already but are excluded here too for callers that check
// eligibility directly. A trailing file extension (robots.txt, images,
// fonts, sitemap.xml, favicon.ico) marks a non-page asset.
export function isMarkdownEligiblePath(pathname: string): boolean {
  if (pathname.startsWith("/community")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/.well-known")) return false;
  if (/\.[^/]+$/.test(pathname)) return false;
  return true;
}

export function wantsMarkdown(acceptHeader: string | null): boolean {
  return (acceptHeader ?? "").toLowerCase().includes("text/markdown");
}

// Mirrors scripts/generate-markdown-assets.mjs's output path convention —
// that build-time script converts every eligible page's prerendered HTML
// to a `<path>.md` sibling asset ahead of time. A request-time
// HTML->Markdown conversion (fetching the live page from inside the
// Worker, then translating it) was tried first and proved unreliable on
// Cloudflare: neither a self-referential `fetch(request.url)` nor the
// ASSETS binding could re-invoke Next's own rendering for a second,
// differently-headered request from inside itself. Serving a real
// pre-generated static asset sidesteps that entirely — the same proven
// mechanism already used for robots.txt, openapi.json, and images.
export function markdownAssetPath(pathname: string): string {
  return pathname === "/" ? "/index.md" : `${pathname}.md`;
}

export type DoFetch = (input: string, init?: RequestInit) => Promise<Response>;

const assetsFetch: DoFetch = async (input, init) => {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = getCloudflareContext();
  return env.ASSETS.fetch(new Request(input, init));
};

export async function renderAsMarkdown(request: NextRequest, doFetch: DoFetch = assetsFetch): Promise<Response> {
  const mdUrl = new URL(markdownAssetPath(request.nextUrl.pathname), request.url);

  let response: Response;
  try {
    response = await doFetch(mdUrl.toString());
  } catch {
    return NextResponse.next();
  }

  if (!response.ok) {
    return NextResponse.next();
  }

  const markdown = await response.text();
  const approxTokens = Math.ceil(markdown.length / 4);

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(approxTokens),
    },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/community")) {
    return runMiddleware(request);
  }

  if (isMarkdownEligiblePath(pathname) && wantsMarkdown(request.headers.get("accept"))) {
    return renderAsMarkdown(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\\.well-known).*)"],
};
