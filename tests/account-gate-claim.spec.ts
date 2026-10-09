import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { emailClaimRequest, oauthRefreshToken, oauthResource, user } from "../src/lib/db/schema";
import { sha256Base64Url } from "../src/lib/community/hash-token";
import { AUDIENCE, MONOAGENT_SCOPES, bearer, decodeJwt, isJwt, login, refresh, seedClaimRequest, signUp, withDb } from "./helpers/oauth-api";

// The headless sign-in (`account login --email` in mono-agent) is the emailed code. It must end
// where the browser flow ends, with an audience-bound JWT and a refresh token: the MonoAgent client
// gets a refresh token to trade at the token endpoint, or, sending a `resource`, the token endpoint's
// own answer at once. Every other client is answered exactly as before.

type Answer = { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; token_type?: string; error?: string };

async function verifyCode(baseURL: string, email: string, code: string, extra: object = {}, clientId = "monoagent") {
  const res = await fetch(new URL("/api/auth/agent/claim/verify", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, client_id: clientId, ...extra }),
  });
  return { status: res.status, body: (await res.json()) as Answer };
}

async function registerDynamicClient(baseURL: string) {
  const res = await fetch(new URL("/api/auth/oauth2/register", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: ["https://example-agent.test/callback"], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"] }),
  });
  return ((await res.json()) as { client_id: string }).client_id;
}

test("a claim with the resource returns an audience-bound JWT and a refresh token", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "123456" });
  const claimed = await verifyCode(baseURL!, account.email, "123456", { resource: AUDIENCE });
  expect([claimed.status, claimed.body.error]).toEqual([200, undefined]);
  expect([claimed.body.token_type, claimed.body.expires_in]).toEqual(["Bearer", 3600]);
  expect(claimed.body.scope).toContain("library:write");

  expect(isJwt(claimed.body.access_token), "the access token is a JWT").toBe(true);
  const { header, payload } = decodeJwt(claimed.body.access_token!);
  expect([header.alg, header.typ]).toEqual(["EdDSA", "at+jwt"]);
  expect([payload.aud].flat()).toContain(AUDIENCE);
  expect([payload.sub, payload.azp, payload.plan]).toEqual([account.userId, "monoagent", "free"]);

  const me = await fetch(new URL("/api/library/me", baseURL), { headers: bearer(claimed.body.access_token) });
  expect(me.status).toBe(200);
  // The refresh token is a real one: the token endpoint rotates it like any other.
  const next = await refresh(baseURL!, claimed.body.refresh_token!, AUDIENCE);
  expect([next.status, isJwt(next.body.access_token)]).toEqual([200, true]);
});

test("without a resource the opaque token is unchanged and a refresh token comes with it: the token endpoint trades it for a JWT, and today's client refreshes it as before", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "654321" });
  const claimed = await verifyCode(baseURL!, account.email, "654321");
  expect(claimed.status).toBe(200);
  expect(isJwt(claimed.body.access_token), "the opaque token it always returned").toBe(false);
  expect(claimed.body.expires_in).toBe(3600);
  expect(claimed.body.refresh_token).toBeTruthy();
  expect((await fetch(new URL("/api/library/me", baseURL), { headers: bearer(claimed.body.access_token) })).status).toBe(200);

  const bound = await refresh(baseURL!, claimed.body.refresh_token!, AUDIENCE);
  expect(bound.status, JSON.stringify(bound.body)).toBe(200);
  const { payload } = decodeJwt(bound.body.access_token!);
  expect([[payload.aud].flat().includes(AUDIENCE), payload.sub]).toEqual([true, account.userId]);

  // The released client stores that refresh token too and, an hour later, refreshes it with no resource.
  // (A second code: a token already traded above is inside its reuse window, not a fresh chain.)
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "654322" });
  const again = await verifyCode(baseURL!, account.email, "654322");
  const plain = await refresh(baseURL!, again.body.refresh_token!);
  const rotated = Boolean(plain.body.refresh_token) && plain.body.refresh_token !== again.body.refresh_token;
  expect([plain.status, isJwt(plain.body.access_token), rotated]).toEqual([200, false, true]);
});

test("a resource for another audience, or from another client, is invalid_target and does not burn the code", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "111111" });
  const wrong = await verifyCode(baseURL!, account.email, "111111", { resource: "https://example.com/other" });
  expect([wrong.status, wrong.body.error]).toEqual([400, "invalid_target"]);
  expect((await verifyCode(baseURL!, account.email, "111111", { resource: AUDIENCE })).status, "the code was not used up").toBe(200);

  const clientId = await registerDynamicClient(baseURL!);
  const stranger = await signUp(baseURL!);
  await seedClaimRequest({ email: stranger.email, scope: "community:read offline_access", code: "222222", clientId });
  const asked = await verifyCode(baseURL!, stranger.email, "222222", { resource: AUDIENCE }, clientId);
  expect([asked.status, asked.body.error]).toEqual([400, "invalid_target"]);
  const plain = await verifyCode(baseURL!, stranger.email, "222222", {}, clientId);
  expect([plain.status, plain.body.refresh_token === undefined]).toEqual([200, true]);
});

test("a claim without offline_access has no refresh token to give or exchange: the resource is ignored", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: "library:read", code: "333333" });
  const claimed = await verifyCode(baseURL!, account.email, "333333", { resource: AUDIENCE });
  expect([claimed.status, isJwt(claimed.body.access_token), claimed.body.refresh_token === undefined]).toEqual([200, false, true]);
});

test("a blocked account cannot claim a token, with or without a resource", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await withDb((db) => db.update(user).set({ blockedAt: new Date() }).where(eq(user.id, account.userId)));
  for (const [code, extra] of [["444444", {}], ["555555", { resource: AUDIENCE }]] as const) {
    await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code });
    const claimed = await verifyCode(baseURL!, account.email, code, extra);
    expect([claimed.status, claimed.body.error]).toEqual([400, "invalid_or_expired_code"]);
  }
});

test("an exchange the provider refuses comes back as its OAuth error, not a 500", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "666666" });
  const setDisabled = (disabled: boolean) => withDb((db) => db.update(oauthResource).set({ disabled }).where(eq(oauthResource.identifier, AUDIENCE)));
  await setDisabled(true);
  try {
    const claimed = await verifyCode(baseURL!, account.email, "666666", { resource: AUDIENCE });
    expect([claimed.status, claimed.body.error]).toEqual([400, "invalid_target"]);
  } finally {
    await setDisabled(false);
  }
});

test("the emailed code's chain is a family of its own: a replay after the window ends only that sign-in", async ({ baseURL }) => {
  // Task 3's src/lib/refresh-family.ts ends the family of a replayed token, keyed on authorization_code_id,
  // which this route writes as `email-claim:<claim id>`. A row without one would end alone, its successor alive.
  const account = await signUp(baseURL!);
  await seedClaimRequest({ email: account.email, scope: MONOAGENT_SCOPES, code: "777777" });
  const claimed = await verifyCode(baseURL!, account.email, "777777");
  expect([claimed.status, Boolean(claimed.body.refresh_token)], "a refresh token").toEqual([200, true]);
  const hash = await sha256Base64Url(claimed.body.refresh_token!);
  const stored = await withDb(async (db) => ({
    claimId: (await db.select({ id: emailClaimRequest.id }).from(emailClaimRequest).where(eq(emailClaimRequest.email, account.email)))[0].id,
    key: (await db.select({ key: oauthRefreshToken.authorizationCodeId }).from(oauthRefreshToken).where(eq(oauthRefreshToken.token, hash)))[0].key,
  }));

  const browser = await login(baseURL!, { resource: AUDIENCE, account }); // another sign-in of the account
  expect(browser.status).toBe(200);
  const next = await refresh(baseURL!, claimed.body.refresh_token!, AUDIENCE);
  expect(next.status).toBe(200);
  await withDb((db) => db.update(oauthRefreshToken).set({ rotationReplayExpiresAt: new Date(Date.now() - 1000) }).where(eq(oauthRefreshToken.userId, account.userId)));
  expect((await refresh(baseURL!, claimed.body.refresh_token!, AUDIENCE)).status, "the replay").toBe(400);
  expect((await refresh(baseURL!, next.body.refresh_token!, AUDIENCE)).status, "the emailed sign-in's newer token goes with it").toBe(400);
  expect((await refresh(baseURL!, browser.body.refresh_token!, AUDIENCE)).status, "the browser sign-in keeps refreshing").toBe(200);
  expect(stored.key, "the family key").toBe(`email-claim:${stored.claimId}`);
});
