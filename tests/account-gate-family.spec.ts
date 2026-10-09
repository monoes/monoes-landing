import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { oauthRefreshToken } from "../src/lib/db/schema";
import { sha256Base64Url } from "../src/lib/community/hash-token";
import { AUDIENCE, MONOAGENT_SCOPES, authorize, bearer, exchange, login, pkce, refresh, withDb, type Account } from "./helpers/oauth-api";

// Ruling R1 of 2026-10-07: a refresh token that monoes.me rotated away, presented again after the
// reuse window, or a revoked one, ends the sign-in it comes from (its refresh-token family) and
// nothing else. Every other sign-in of the account, every other install, keeps working. The provider
// alone would end every MonoAgent refresh token of the account; src/lib/refresh-family.ts narrows it.
// Each test ends with the account's other sign-in still refreshing.

const FORM = "application/x-www-form-urlencoded";
const form = (pairs: [string, string][]) => new URLSearchParams(pairs).toString();

// The window is 300 seconds; end it in the database instead of waiting.
const endWindow = (userId: string) =>
  withDb((db) => db.update(oauthRefreshToken).set({ rotationReplayExpiresAt: new Date(Date.now() - 1000) }).where(eq(oauthRefreshToken.userId, userId)));

// One sign-in of the account, as one install makes it. A sign-in that failed on a busy server would show
// up later as a refused refresh and read like a punishment, so it fails here.
async function install(baseURL: string, account?: Account, resource: string | null = AUDIENCE) {
  const r = await login(baseURL, { account, ...(resource ? { resource } : {}) });
  expect(r.status, "a sign-in").toBe(200);
  return r;
}

// A raw request to the token or the revoke route, for the shapes the helpers do not send.
async function post(baseURL: string, route: "token" | "revoke", body: string, contentType = FORM) {
  const res = await fetch(new URL(`/api/auth/oauth2/${route}`, baseURL), { method: "POST", headers: { "Content-Type": contentType }, body });
  const text = await res.text();
  let parsed: { error?: string; error_description?: string; refresh_token?: string } = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {}
  return { status: res.status, text, body: parsed };
}

// Two sign-ins of one account; the first rotated once (A1, then A2), the second (B) untouched.
async function twoSignIns(baseURL: string) {
  const a = await install(baseURL);
  const b = await install(baseURL, a.account);
  const a2 = await refresh(baseURL, a.body.refresh_token!, AUDIENCE);
  expect(a2.status, "the rotation of A1").toBe(200);
  return { account: a.account, a1: a.body.refresh_token!, a2: a2.body.refresh_token!, b: b.body.refresh_token! };
}

// A's family has ended and B, the other sign-in, still refreshes.
async function onlyTheFamilyEnded(baseURL: string, s: { a2: string; b: string }) {
  expect((await refresh(baseURL, s.a2, AUDIENCE)).status, "the replayed sign-in's newer token goes with it").toBe(400);
  expect((await refresh(baseURL, s.b, AUDIENCE)).status, "another sign-in of the account keeps refreshing").toBe(200);
}

test("a replay after the window is invalid_grant and ends only that sign-in: another sign-in of the account keeps refreshing", async ({ baseURL }) => {
  // A second machine with a copied session file, or a retry after a long outage, presents a used refresh token.
  const s = await twoSignIns(baseURL!);
  await endWindow(s.account.userId);
  const replay = await refresh(baseURL!, s.a1, AUDIENCE);
  expect([replay.status, replay.body.error]).toEqual([400, "invalid_grant"]);
  await onlyTheFamilyEnded(baseURL!, s);
});

// The provider trims grant_type and reads client_id from the raw form, so neither shape may slip past the hook.
for (const [name, body] of [
  ["grant_type with a trailing space", (t: string) => form([["grant_type", "refresh_token "], ["refresh_token", t], ["client_id", "monoagent"], ["resource", AUDIENCE]])],
  ["client_id=monoagent&client_id=", (t: string) => `${form([["grant_type", "refresh_token"], ["refresh_token", t], ["client_id", "monoagent"], ["resource", AUDIENCE]])}&client_id=`],
] as const) {
  test(`a replay after the window with ${name} ends only that sign-in`, async ({ baseURL }) => {
    const s = await twoSignIns(baseURL!);
    await endWindow(s.account.userId);
    const replay = await post(baseURL!, "token", body(s.a1));
    expect([replay.status, replay.body.error]).toEqual([400, "invalid_grant"]);
    await onlyTheFamilyEnded(baseURL!, s);
  });
}

test("a dead token is punished once: presenting it again ends nothing, and the sign-ins made before and since survive", async ({ baseURL }) => {
  // A client whose disk is full cannot save its `refused` marker (spec A21) and presents the same dead token at
  // every due command.
  const s = await twoSignIns(baseURL!);
  await endWindow(s.account.userId);
  const punished = await refresh(baseURL!, s.a1, AUDIENCE);
  expect([punished.status, punished.body.error]).toEqual([400, "invalid_grant"]);

  const since = await install(baseURL!, s.account);
  for (let i = 0; i < 3; i++) {
    // The dead token's row went with its family: there is nothing left to punish.
    const repeat = await refresh(baseURL!, s.a1, AUDIENCE);
    expect([repeat.status, repeat.body.error, repeat.body.error_description], `presentation ${i + 2} of the dead token`).toEqual([400, "invalid_grant", "session not found"]);
  }
  expect((await refresh(baseURL!, s.b, AUDIENCE)).status, "the sign-in made before survives").toBe(200);
  expect((await refresh(baseURL!, since.body.refresh_token!, AUDIENCE)).status, "the sign-in made since survives").toBe(200);
});

// The revoke route has no reuse window; it reads any hint but access_token as none, trims the token and strips
// "Bearer ", and reads its caller from the raw form. A1 was rotated a moment ago, inside the reuse window.
for (const [name, body, contentType, description] of [
  ["no hint", (t: string) => form([["token", t], ["client_id", "monoagent"]]), FORM, "token not found"],
  ["the hint refresh_token", (t: string) => form([["token", t], ["client_id", "monoagent"], ["token_type_hint", "refresh_token"]]), FORM, "refresh token revoked"],
  ["an unknown hint", (t: string) => form([["token", t], ["client_id", "monoagent"], ["token_type_hint", "x"]]), FORM, "token not found"],
  ["a Bearer prefix", (t: string) => form([["token", `Bearer ${t}`], ["client_id", "monoagent"]]), FORM, "token not found"],
  ["spaces around the token", (t: string) => form([["token", ` ${t} `], ["client_id", "monoagent"]]), FORM, "token not found"],
  ["client_id=monoagent&client_id=", (t: string) => `${form([["token", t], ["client_id", "monoagent"]])}&client_id=`, FORM, "token not found"],
  ["a +json media type, client_id only in the raw text", (t: string) => JSON.stringify({ token: t, note: "&client_id=monoagent&" }), `${FORM}+json`, "token not found"],
  ["a U+FEFF before client_id", (t: string) => `﻿${form([["client_id", "monoagent"], ["token", t]])}`, FORM, "token not found"],
] as const) {
  test(`the revoke route ends only the family of a rotated token, inside the reuse window too (${name})`, async ({ baseURL }) => {
    const s = await twoSignIns(baseURL!);
    const revoked = await post(baseURL!, "revoke", body(s.a1), contentType);
    expect([revoked.status, revoked.body.error, revoked.body.error_description]).toEqual([400, "invalid_request", description]);
    await onlyTheFamilyEnded(baseURL!, s);
  });
}

test("the revoke route ends only the family of an expired rotated token", async ({ baseURL }) => {
  // A copied session file's token, rotated away and since expired.
  const s = await twoSignIns(baseURL!);
  const hash = await sha256Base64Url(s.a1);
  await withDb((db) => db.update(oauthRefreshToken).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(oauthRefreshToken.token, hash)));
  const revoked = await post(baseURL!, "revoke", form([["token", s.a1], ["client_id", "monoagent"]]));
  expect([revoked.status, revoked.body.error]).toEqual([400, "invalid_request"]);
  await onlyTheFamilyEnded(baseURL!, s);
});

test("a revoke of a live token (account logout) answers 200 and ends its own sign-in; presenting it again ends nothing", async ({ baseURL }) => {
  const s = await twoSignIns(baseURL!);
  const revoked = await post(baseURL!, "revoke", form([["token", s.a2], ["client_id", "monoagent"]]));
  expect([revoked.status, revoked.text]).toEqual([200, ""]);
  const again = await refresh(baseURL!, s.a2, AUDIENCE);
  expect([again.status, again.body.error, again.body.error_description], "the revoked token's row is gone").toEqual([400, "invalid_grant", "session not found"]);
  expect((await refresh(baseURL!, s.b, AUDIENCE)).status, "another sign-in of the account keeps refreshing").toBe(200);
});

test("another client's revoked token presented as monoagent's at the revoke route ends nothing", async ({ baseURL }) => {
  // The provider punishes the caller's client for the row's user, whatever client the row belongs to.
  const a = await install(baseURL!);
  const redirectUri = "https://example-agent.test/callback";
  const reg = await fetch(new URL("/api/auth/oauth2/register", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: [redirectUri], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"] }),
  });
  const { client_id: clientId } = (await reg.json()) as { client_id: string };
  const p = pkce();
  const code = await authorize(a.account, p.challenge, { clientId, redirectUri, scope: "community:read offline_access" });
  const d1 = (await exchange(baseURL!, code, p.verifier, undefined, redirectUri, clientId)).body.refresh_token!;
  const rotate = (t: string) => post(baseURL!, "token", form([["grant_type", "refresh_token"], ["refresh_token", t], ["client_id", clientId]]));
  const d2 = await rotate(d1);
  expect(d2.status, "the other client's rotation").toBe(200);

  const revoked = await post(baseURL!, "revoke", form([["token", d1], ["client_id", "monoagent"]]));
  expect([revoked.status, revoked.body.error]).toEqual([400, "invalid_request"]);
  expect((await refresh(baseURL!, a.body.refresh_token!, AUDIENCE)).status, "the account's MonoAgent sign-in keeps refreshing").toBe(200);
  expect((await rotate(d2.body.refresh_token!)).status, "the other client's sign-in keeps refreshing").toBe(200);
});

test("the opaque access tokens of an ended family go with it; another sign-in's keep working", async ({ baseURL }) => {
  // Today's client: without a resource the access tokens are rows, linked to their refresh token by refresh_id.
  const first = await install(baseURL!, undefined, null);
  const other = await install(baseURL!, first.account, null);
  const second = await refresh(baseURL!, first.body.refresh_token!);
  expect(second.status).toBe(200);
  await endWindow(first.account.userId);
  expect((await refresh(baseURL!, first.body.refresh_token!)).status).toBe(400);
  const me = async (token?: string) => (await fetch(new URL("/api/library/me", baseURL), { headers: bearer(token) })).status;
  expect(await me(second.body.access_token), "the ended family's access token").toBe(401);
  expect(await me(other.body.access_token), "another sign-in's access token").toBe(200);
});

test("a chain without a family key ends alone: a null authorization_code_id never keys a delete", async ({ baseURL }) => {
  // Every chain the provider issues carries a key, and the email-code route writes one; a row written without it
  // must not take the account's other keyless chains with it, as a delete keyed on IS NULL would.
  const browser = await install(baseURL!);
  const keyless = async () => {
    const value = randomBytes(32).toString("base64url");
    const hash = await sha256Base64Url(value);
    await withDb((db) =>
      db.insert(oauthRefreshToken).values({
        id: crypto.randomUUID(),
        token: hash,
        clientId: "monoagent",
        userId: browser.account.userId,
        scopes: MONOAGENT_SCOPES.split(" "),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      }),
    );
    return value;
  };
  const a = await keyless();
  const b = await keyless();
  expect((await refresh(baseURL!, a, AUDIENCE)).status).toBe(200);
  await endWindow(browser.account.userId);
  const replay = await refresh(baseURL!, a, AUDIENCE);
  expect([replay.status, replay.body.error]).toEqual([400, "invalid_grant"]);
  expect((await refresh(baseURL!, a, AUDIENCE)).body.error_description, "the replayed row itself is gone").toBe("session not found");
  expect((await refresh(baseURL!, b, AUDIENCE)).status, "another keyless chain survives").toBe(200);
  expect((await refresh(baseURL!, browser.body.refresh_token!, AUDIENCE)).status, "the browser sign-in survives").toBe(200);
});
