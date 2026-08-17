import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import type { GetSession } from "./middleware.ts";

// Plain `node --test` cannot resolve the bare "next/server" specifier: the
// installed `next` package has no "exports" map, and Node's ESM resolver
// requires an exact file match or explicit extension for such subpath
// specifiers (it suggests "next/server.js" — the real file backing the
// public "next/server" entry point). This hook is scoped to this test file
// only, via a runtime module.register() call, so `src/middleware.ts` can
// keep importing the standard, documented "next/server" specifier.
register(
  "data:text/javascript,export function resolve(specifier, context, next) { if (specifier === 'next/server') { return next('next/server.js', context); } return next(specifier, context); }",
  import.meta.url,
);

const { NextRequest } = await import("next/server");
const { middleware, runMiddleware } = await import("./middleware.ts");

const getSessionMock = mock.fn<GetSession>(async () => null);

describe("community middleware", () => {
  it("redirects unauthenticated users to /community/login", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => null);
    const req = new NextRequest("http://localhost/community/admin");
    const res = await runMiddleware(req, getSessionMock);
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location") ?? "", /\/community\/login$/);
  });

  it("redirects users with no username to /community/onboarding", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: null, role: "member", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await runMiddleware(req, getSessionMock);
    assert.match(res.headers.get("location") ?? "", /\/community\/onboarding$/);
  });

  it("redirects non-admins away from /community/admin", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: "someone", role: "member", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await runMiddleware(req, getSessionMock);
    assert.match(res.headers.get("location") ?? "", /\/community$/);
  });

  it("allows admins through to /community/admin", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: "someone", role: "admin", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await runMiddleware(req, getSessionMock);
    assert.equal(res.status, 200);
  });

  it("redirects blocked users to /community/login?blocked=1 and clears the session cookie", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: "someone", role: "member", blockedAt: new Date() },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await runMiddleware(req, getSessionMock);
    assert.match(res.headers.get("location") ?? "", /\/community\/login\?blocked=1$/);
    assert.equal(res.cookies.get("better-auth.session_token")?.value, "");
  });

  it("exports `middleware` with exactly one parameter, matching Next.js's (request, event) call signature", () => {
    // Regression guard: Next.js invokes middleware as `middleware(request, event)`.
    // If `getSession` ever moves back onto `middleware` itself as a second
    // parameter, Next's real `event` argument silently overrides our default
    // and every authenticated request throws "getSession is not a function".
    assert.equal(middleware.length, 1);
  });
});
