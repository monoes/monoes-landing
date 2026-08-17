import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";
import { middleware, type GetSession } from "./middleware.ts";

const getSessionMock = mock.fn<GetSession>(async () => null);

describe("community middleware", () => {
  it("redirects unauthenticated users to /community/login", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => null);
    const req = new NextRequest("http://localhost/community/admin");
    const res = await middleware(req, getSessionMock);
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location") ?? "", /\/community\/login$/);
  });

  it("redirects users with no username to /community/onboarding", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: null, role: "member", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await middleware(req, getSessionMock);
    assert.match(res.headers.get("location") ?? "", /\/community\/onboarding$/);
  });

  it("redirects non-admins away from /community/admin", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: "someone", role: "member", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await middleware(req, getSessionMock);
    assert.match(res.headers.get("location") ?? "", /\/community$/);
  });

  it("allows admins through to /community/admin", async () => {
    getSessionMock.mock.mockImplementationOnce(async () => ({
      user: { id: "u1", username: "someone", role: "admin", blockedAt: null },
    }));
    const req = new NextRequest("http://localhost/community/admin");
    const res = await middleware(req, getSessionMock);
    assert.equal(res.status, 200);
  });
});
