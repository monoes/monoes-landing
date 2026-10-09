import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { oauthRefreshToken } from "../src/lib/db/schema";
import { AUDIENCE, authorize, bearer, decodeJwt, isJwt, login, pkce, refresh, signUp, verifiesAgainstJwks, withDb } from "./helpers/oauth-api";

// monoes.me gives MonoAgent an audience-bound JWT when the client sends a
// `resource`, and leaves every client that sends none exactly as it was.
// mono-agent's internal/account verifies these claims offline.

test("without a resource (today's client) the response is unchanged: opaque access token, refresh token, id token", async ({ baseURL }) => {
  const r = await login(baseURL!);
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  expect(isJwt(r.body.access_token), "opaque: not a JWT").toBe(false);
  expect(r.body.token_type).toBe("Bearer");
  expect(r.body.expires_in).toBe(3600);
  expect(r.body.scope).toBe("openid profile email offline_access library:read library:write");
  expect(r.body.refresh_token, "offline_access should yield a refresh token").toBeTruthy();
  expect(decodeJwt(r.body.id_token!).payload.aud).toBe("monoagent");

  const me = await fetch(new URL("/api/library/me", baseURL), { headers: bearer(r.body.access_token) });
  expect(me.status).toBe(200);

  const again = await refresh(baseURL!, r.body.refresh_token!);
  expect(again.status, JSON.stringify(again.body)).toBe(200);
  expect(isJwt(again.body.access_token), "still opaque after a refresh without a resource").toBe(false);
});

test("with the MonoAgent resource the access token is an audience-bound JWT", async ({ baseURL }) => {
  const r = await login(baseURL!, { resource: AUDIENCE });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  const token = r.body.access_token!;
  const { header, payload } = decodeJwt(token);

  expect(header.alg).toBe("EdDSA");
  expect(header.typ).toBe("at+jwt");
  expect(typeof header.kid).toBe("string");
  // When E2E_SIGNING_KID is set the server runs with the pinned key and must sign with exactly it.
  if (process.env.E2E_SIGNING_KID) expect(header.kid).toBe(process.env.E2E_SIGNING_KID);

  expect(payload.iss).toBe(`${new URL(baseURL!).origin}/api/auth`);
  // The audience is an array (the userinfo endpoint is added because openid is requested) or a string.
  expect([payload.aud].flat()).toContain(AUDIENCE);
  expect(payload.azp).toBe("monoagent");
  expect(payload.client_id).toBe("monoagent");
  expect(payload.plan).toBe("free");
  expect(typeof payload.sub).toBe("string");
  expect((payload.exp as number) - (payload.iat as number)).toBe(3600);
  expect(r.body.expires_in).toBe(3600);
  expect(String(payload.scope).split(" ")).toEqual(expect.arrayContaining(["library:read", "library:write"]));

  expect(await verifiesAgainstJwks(baseURL!, token), "verifies with the published public key").toBe(true);
  expect(r.body.refresh_token).toBeTruthy();
});

test("an ID token and a session JWT, signed with the same key, never carry the MonoAgent audience", async ({ baseURL }) => {
  // mono-agent tells an access token from the other JWTs this key signs by its claims (spec §4.1). The ID token
  // has the same issuer and, by OIDC, may carry `azp`, so its audience (the client id) is what keeps a 10-hour ID
  // token from passing as a MonoAgent access token; the jwt() plugin's session JWT has the base URL as its audience.
  // Neither carries `typ: at+jwt`, which a header check in the client could add as defense in depth.
  const r = await login(baseURL!, { resource: AUDIENCE });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  const id = decodeJwt(r.body.id_token!);
  expect([id.payload.aud].flat()).not.toContain(AUDIENCE);
  expect(id.header.typ).not.toBe("at+jwt");

  const res = await fetch(new URL("/api/auth/token", baseURL), { headers: { Cookie: r.account.cookie } });
  expect(res.status).toBe(200);
  const { token } = (await res.json()) as { token?: string };
  expect(isJwt(token), "the jwt() plugin's session JWT").toBe(true);
  const session = decodeJwt(token!);
  expect([session.payload.aud].flat()).not.toContain(AUDIENCE);
  expect(session.header.typ).not.toBe("at+jwt");
});

test("a refresh token issued without the resource can be exchanged with it, and the audience then sticks", async ({ baseURL }) => {
  const first = await login(baseURL!);
  const bound = await refresh(baseURL!, first.body.refresh_token!, AUDIENCE);
  expect(bound.status, JSON.stringify(bound.body)).toBe(200);
  expect([decodeJwt(bound.body.access_token!).payload.aud].flat()).toContain(AUDIENCE);
  expect(bound.body.refresh_token === first.body.refresh_token, "refresh tokens rotate").toBe(false);

  const sticky = await refresh(baseURL!, bound.body.refresh_token!);
  expect(sticky.status, JSON.stringify(sticky.body)).toBe(200);
  expect([decodeJwt(sticky.body.access_token!).payload.aud].flat()).toContain(AUDIENCE);
});

test("a valid refresh is never answered invalid_grant: that answer is a refusal to mono-agent", async ({ baseURL }) => {
  const r = await login(baseURL!, { resource: AUDIENCE });
  for (let i = 0, token = r.body.refresh_token!; i < 3; i++) {
    const next = await refresh(baseURL!, token, AUDIENCE);
    expect(next.status, JSON.stringify(next.body)).toBe(200);
    expect(next.body.error).toBeUndefined();
    token = next.body.refresh_token!;
  }
});

test("a retry inside the 300-second reuse window gets the same answer and ends nothing", async ({ baseURL }) => {
  // The client's answer was lost, so it presents the same refresh token again.
  const first = await login(baseURL!, { resource: AUDIENCE });
  const second = await refresh(baseURL!, first.body.refresh_token!, AUDIENCE);
  expect(second.status).toBe(200);
  const retry = await refresh(baseURL!, first.body.refresh_token!, AUDIENCE);
  expect([retry.status, retry.body.refresh_token === second.body.refresh_token, retry.body.access_token === second.body.access_token]).toEqual([200, true, true]);
  expect((await refresh(baseURL!, second.body.refresh_token!, AUDIENCE)).status, "the newer token still works").toBe(200);
});

test("a refresh token past its 30 days is invalid_grant, which mono-agent reads as a refusal", async ({ baseURL }) => {
  const r = await login(baseURL!, { resource: AUDIENCE });
  await withDb((db) => db.update(oauthRefreshToken).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(oauthRefreshToken.userId, r.account.userId)));
  const expired = await refresh(baseURL!, r.body.refresh_token!, AUDIENCE);
  expect([expired.status, expired.body.error]).toEqual([400, "invalid_grant"]);
});

test("only the monoagent client can obtain the audience, and no other resource exists", async ({ baseURL }) => {
  const account = await signUp(baseURL!);

  const reg = await fetch(new URL("/api/auth/oauth2/register", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: ["https://example-agent.test/callback"], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"] }),
  });
  const { client_id: dynamicId } = (await reg.json()) as { client_id: string };
  const dynamic = { clientId: dynamicId, redirectUri: "https://example-agent.test/callback", scope: "community:read" };

  await expect(authorize(account, pkce().challenge, { ...dynamic, resource: AUDIENCE })).rejects.toThrow(/invalid_target/);
  // Dynamic registration keeps working: a client that asks for no resource gets its code.
  expect(await authorize(account, pkce().challenge, dynamic)).toBeTruthy();

  await expect(authorize(account, pkce().challenge, { resource: "https://example.com/other" })).rejects.toThrow(/invalid_target/);
  const plain = await login(baseURL!);
  const other = await refresh(baseURL!, plain.body.refresh_token!, "https://example.com/other");
  expect(other.status).toBe(400);
  expect(other.body.error).toBe("invalid_target");
});
