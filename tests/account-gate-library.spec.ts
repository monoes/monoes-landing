import { test, expect } from "@playwright/test";
import { generateKeyPairSync, sign } from "node:crypto";
import { AUDIENCE, authorize, bearer, decodeJwt, exchange, isJwt, login, pkce, signUp } from "./helpers/oauth-api";

// Once mono-agent's `library` commands use the machine session, every
// /api/library call carries the audience-bound JWT. The server must accept it
// beside the opaque tokens it has always accepted.

async function status(baseURL: string, path: string, token?: string, init: RequestInit = {}) {
  const headers = { ...(token ? bearer(token) : {}), ...(init.headers as Record<string, string> | undefined) };
  return (await fetch(new URL(path, baseURL), { ...init, headers })).status;
}

test("library endpoints accept the audience-bound JWT beside opaque tokens", async ({ baseURL }) => {
  const jwt = await login(baseURL!, { resource: AUDIENCE });
  const opaque = await login(baseURL!);
  expect(isJwt(jwt.body.access_token), "a JWT").toBe(true);
  expect(isJwt(opaque.body.access_token), "opaque").toBe(false);

  for (const token of [jwt.body.access_token!, opaque.body.access_token!]) {
    const me = await fetch(new URL("/api/library/me", baseURL), { headers: bearer(token) });
    expect(me.status).toBe(200);
    const body = (await me.json()) as { user: { email: string }; scopes: string[] };
    expect(body.scopes).toEqual(expect.arrayContaining(["library:read", "library:write"]));
    expect(await status(baseURL!, "/api/library/items?scope=mine", token)).toBe(200);
  }
  expect(await status(baseURL!, "/api/library/me")).toBe(401);
});

test("a read-only JWT lists but cannot upload (403 insufficient_scope)", async ({ baseURL }) => {
  const r = await login(baseURL!, { resource: AUDIENCE, scope: "openid library:read" });
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  expect(await status(baseURL!, "/api/library/items?scope=mine", r.body.access_token)).toBe(200);

  const form = new FormData();
  form.set("kind", "org");
  form.set("file", new Blob([JSON.stringify({ name: "x", roles: [{ id: "boss" }] })]), "x.json");
  const res = await fetch(new URL("/api/library/items", baseURL), { method: "POST", headers: bearer(r.body.access_token), body: form });
  expect(res.status).toBe(403);
  expect(((await res.json()) as { error: { code: string } }).error.code).toBe("insufficient_scope");
});

test("a damaged, unsigned or foreign JWT is a 401", async ({ baseURL }) => {
  const r = await login(baseURL!, { resource: AUDIENCE });
  const [h, p, s] = r.body.access_token!.split(".");

  const damaged = `${h}.${p}.${s.slice(0, -2)}${s.endsWith("AA") ? "BB" : "AA"}`;
  expect(await status(baseURL!, "/api/library/me", damaged)).toBe(401);

  const b64 = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const unsigned = `${b64({ alg: "none", typ: "at+jwt" })}.${p}.`;
  expect(await status(baseURL!, "/api/library/me", unsigned)).toBe(401);

  // The right claims under a key this server does not publish.
  const { header, payload } = decodeJwt(r.body.access_token!);
  const forged = `${b64(header)}.${b64(payload)}`;
  const foreign = `${forged}.${sign(null, Buffer.from(forged), generateKeyPairSync("ed25519").privateKey).toString("base64url")}`;
  expect(await status(baseURL!, "/api/library/me", foreign)).toBe(401);
});

test("a dynamically registered client still gets an opaque token and the library accepts it, as before", async ({ baseURL }) => {
  const account = await signUp(baseURL!);
  const reg = await fetch(new URL("/api/auth/oauth2/register", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redirect_uris: ["https://example-agent.test/callback"], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"] }),
  });
  const { client_id: clientId } = (await reg.json()) as { client_id: string };
  const { verifier, challenge } = pkce();
  const code = await authorize(account, challenge, { clientId, redirectUri: "https://example-agent.test/callback", scope: "library:read" });
  const t = await exchange(baseURL!, code, verifier, undefined, "https://example-agent.test/callback", clientId);
  expect(t.status, JSON.stringify(t.body)).toBe(200);
  // Opaque, as for every client that sends no resource; it works as it always has.
  expect(isJwt(t.body.access_token), "opaque").toBe(false);
  expect(await status(baseURL!, "/api/library/me", t.body.access_token)).toBe(200);
});
