import { test, expect } from "@playwright/test";
import { loopbackCallback, monoagentLogin, registerAndOnboard } from "./helpers/library-auth";

test("MonoAgent logs in with PKCE on a random loopback port, refreshes, and calls /api/library/me", async ({ page, baseURL }) => {
  const username = await registerAndOnboard(page);
  const tokens = await monoagentLogin(page, baseURL!);
  expect(tokens.access_token).toBeTruthy();
  expect(tokens.refresh_token, "offline_access should yield a refresh token").toBeTruthy();
  expect(tokens.scope).toContain("library:write");

  const me = await fetch(new URL("/api/library/me", baseURL), { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  expect(me.status).toBe(200);
  const body = (await me.json()) as { user: { username: string; email: string }; scopes: string[] };
  expect(body.user.username).toBe(username);
  expect(body.user.email).toBe(`${username}@example.com`);
  expect(body.scopes).toEqual(expect.arrayContaining(["library:read", "library:write"]));

  const refreshed = await fetch(new URL("/api/auth/oauth2/token", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refresh_token!, client_id: "monoagent" }),
  });
  const next = (await refreshed.json()) as { access_token?: string };
  expect(refreshed.status, JSON.stringify(next)).toBe(200);
  expect(next.access_token).toBeTruthy();
  const me2 = await fetch(new URL("/api/library/me", baseURL), { headers: { Authorization: `Bearer ${next.access_token}` } });
  expect(me2.status).toBe(200);
});

test("a read-only token can list but not upload (403 insufficient_scope)", async ({ page, baseURL }) => {
  await registerAndOnboard(page);
  const tokens = await monoagentLogin(page, baseURL!, "openid library:read");
  const auth = { Authorization: `Bearer ${tokens.access_token}` };

  const mine = await fetch(new URL("/api/library/items?scope=mine", baseURL), { headers: auth });
  expect(mine.status).toBe(200);

  const form = new FormData();
  form.set("kind", "org");
  form.set("file", new Blob([JSON.stringify({ name: "x", roles: [{ id: "boss" }] })]), "x.json");
  const res = await fetch(new URL("/api/library/items", baseURL), { method: "POST", headers: auth, body: form });
  expect(res.status).toBe(403);
  expect(((await res.json()) as { error: { code: string } }).error.code).toBe("insufficient_scope");
});

test("the monoagent client rejects non-loopback and wrong-path redirects", async ({ page, baseURL }) => {
  await registerAndOnboard(page);
  const cb = await loopbackCallback();
  cb.close();
  for (const redirect of ["https://evil.example/callback", "http://localhost:8123/callback", cb.redirectUri.replace("/callback", "/other")]) {
    const url = new URL("/api/auth/oauth2/authorize", baseURL);
    url.search = new URLSearchParams({
      client_id: "monoagent",
      response_type: "code",
      redirect_uri: redirect,
      scope: "library:read",
      code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      code_challenge_method: "S256",
    }).toString();
    const res = await page.request.get(url.toString(), { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()["location"]).toContain("error=invalid_redirect");
  }
});
