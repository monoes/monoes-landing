import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { oauthAccessToken, user } from "../src/lib/db/schema";
import { AUDIENCE, authorize, bearer, exchange, login, pkce, refresh, seedClaimRequest, setUserRole, signIn, signUp, withDb } from "./helpers/oauth-api";

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
  // An opaque access token with no refresh token behind it (an emailed code without offline_access):
  // deleting the refresh tokens cannot reach it, only the access-token delete can.
  await seedClaimRequest({ email: target.email, scope: "library:read", code: "424242" });
  const claimRes = await fetch(new URL("/api/auth/agent/claim/verify", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: target.email, code: "424242", client_id: "monoagent" }),
  });
  const lone = ((await claimRes.json()) as { access_token: string }).access_token;
  expect(claimRes.status).toBe(200);
  expect((await fetch(new URL("/api/library/me", baseURL), { headers: bearer(lone) })).status, "works before the block").toBe(200);

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

  // The JWT already issued lives out its hour, but no route serves a blocked account meanwhile.
  const old = await fetch(new URL("/api/library/me", baseURL), { headers: bearer(live.body.access_token) });
  expect(old.status).toBe(403);
  expect(((await old.json()) as { error: { code: string } }).error.code).toBe("blocked");
  // The opaque token's row is gone.
  expect((await fetch(new URL("/api/library/me", baseURL), { headers: bearer(plain.body.access_token) })).status).toBe(401);
  expect((await fetch(new URL("/api/library/me", baseURL), { headers: bearer(lone) })).status, "the token with no refresh token behind it").toBe(401);
  // Not merely refused: the block deleted the rows (the opaque tokens of the account), so nothing is left to be refused.
  const left = await withDb((db) => db.select({ id: oauthAccessToken.id }).from(oauthAccessToken).where(eq(oauthAccessToken.userId, target.userId)));
  expect(left, "the blocked user's access token rows").toHaveLength(0);

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
