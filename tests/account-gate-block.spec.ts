import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { user } from "../src/lib/db/schema";
import { AUDIENCE, authorize, bearer, exchange, login, pkce, refresh, setUserRole, signIn, signUp, withDb } from "./helpers/oauth-api";

// A refresh answered invalid_grant is, to mono-agent, "monoes.me said no": it
// deletes its refresh token and locks. So a block must make exactly that the
// answer, for the token chains that exist and for anything minted afterwards.

async function setBlocked(baseURL: string, adminCookie: string, userId: string, blocked: boolean) {
  const res = await fetch(new URL(`/api/community/admin/users/${userId}/block`, baseURL), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Origin: new URL(baseURL).origin, Cookie: adminCookie },
    body: JSON.stringify({ blocked }),
  });
  return res.status;
}

test("blocking holds: refresh is invalid_grant, old tokens stop, unblocking lets the user back in", async ({ baseURL }) => {
  const admin = await signUp(baseURL!);
  await setUserRole(admin.userId, "admin");
  const target = await signUp(baseURL!);
  const bound = await login(baseURL!, { resource: AUDIENCE, account: target });
  const plain = await login(baseURL!, { account: target });
  expect((await refresh(baseURL!, bound.body.refresh_token!, AUDIENCE)).status, "not blocked yet").toBe(200);
  const live = await login(baseURL!, { resource: AUDIENCE, account: target });

  expect(await setBlocked(baseURL!, admin.cookie, target.userId, true)).toBe(200);

  for (const [name, chain, resource] of [
    ["audience-bound chain", live.body.refresh_token!, AUDIENCE],
    ["plain chain", plain.body.refresh_token!, undefined],
    // Rotated a moment ago, so inside the reuse window: its stored answer must not outlive the block.
    ["rotated token inside the reuse window", bound.body.refresh_token!, AUDIENCE],
  ] as const) {
    const refused = await refresh(baseURL!, chain, resource);
    expect(refused.status, name).toBe(400);
    expect(refused.body.error, name).toBe("invalid_grant");
  }

  // The JWT already issued lives out its hour, but no route serves a blocked account meanwhile. Until the
  // routes accept the audience-bound JWT at all (Task 5) it is a 401; from Task 5 on it is 403 "blocked",
  // and Task 5 tightens this assertion.
  const old = await fetch(new URL("/api/library/me", baseURL), { headers: bearer(live.body.access_token) });
  expect([401, 403]).toContain(old.status);
  if (old.status === 403) expect(((await old.json()) as { error: { code: string } }).error.code).toBe("blocked");
  // The opaque token's row is gone.
  expect((await fetch(new URL("/api/library/me", baseURL), { headers: bearer(plain.body.access_token) })).status).toBe(401);

  // No new sign-in, and the web session that was alive can no longer authorize a token.
  expect((await signIn(baseURL!, target.email)).status).toBe(401);
  await expect(authorize(target, pkce().challenge, { resource: AUDIENCE })).rejects.toThrow();

  expect(await setBlocked(baseURL!, admin.cookie, target.userId, false)).toBe(200);
  const back = await signIn(baseURL!, target.email);
  expect(back.status).toBe(200);
  const again = await login(baseURL!, { resource: AUDIENCE, account: back.account });
  expect(again.status, JSON.stringify(again.body)).toBe(200);
  expect((await refresh(baseURL!, again.body.refresh_token!, AUDIENCE)).status).toBe(200);
});

test("a blocked user whose tokens survived is refused invalid_grant when the grant carries the resource", async ({ baseURL }) => {
  // A block made some other way than the route (a script, a console) deletes nothing. The chain is
  // audience-bound, so the claims guard answers; a chain without a resource is only covered by the deletion.
  const target = await signUp(baseURL!);
  const bound = await login(baseURL!, { resource: AUDIENCE, account: target });
  await withDb((db) => db.update(user).set({ blockedAt: new Date() }).where(eq(user.id, target.userId)));

  const refused = await refresh(baseURL!, bound.body.refresh_token!, AUDIENCE);
  expect(refused.status).toBe(400);
  expect(refused.body.error).toBe("invalid_grant");

  const { verifier, challenge } = pkce();
  const code = await authorize(target, challenge, { resource: AUDIENCE });
  const viaSession = await exchange(baseURL!, code, verifier, AUDIENCE);
  expect(viaSession.status).toBe(400);
  expect(viaSession.body.error).toBe("invalid_grant");
});
