// Signs a fresh user in through the real browser flow and runs MonoAgent's
// OAuth 2.1 login: authorization code + PKCE with the seeded public
// "monoagent" client and a loopback redirect on a random 127.0.0.1 port.
import { expect, type Page } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export const LIBRARY_SCOPES = "openid profile email offline_access library:read library:write community:read community:write";

export function unique(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function registerAndOnboard(page: Page, username = unique("lib")) {
  await page.goto("/community/register");
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community\/onboarding$/);
  await page.fill("#username", username);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);
  return username;
}

/** A one-shot loopback listener standing in for MonoAgent's callback server. */
export async function loopbackCallback() {
  let resolve!: (url: URL) => void;
  const received = new Promise<URL>((r) => (resolve = r));
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("You can close this tab.");
    resolve(new URL(req.url ?? "/", "http://127.0.0.1"));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address() as AddressInfo;
  return { redirectUri: `http://127.0.0.1:${port}/callback`, received, close: () => server.close() };
}

export type Tokens = { access_token: string; refresh_token?: string; scope?: string; expires_in?: number };

/** The logged-in `page` authorizes client monoagent; returns the token response. */
export async function monoagentLogin(page: Page, baseURL: string, scope = LIBRARY_SCOPES): Promise<Tokens> {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(8).toString("hex");
  const cb = await loopbackCallback();
  try {
    const authorize = new URL("/api/auth/oauth2/authorize", baseURL);
    authorize.search = new URLSearchParams({
      client_id: "monoagent",
      response_type: "code",
      redirect_uri: cb.redirectUri,
      scope,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    }).toString();
    await page.goto(authorize.toString());
    await expect(page).toHaveURL(/\/community\/oauth\/consent/);
    await page.getByRole("button", { name: "Allow" }).click();
    const callback = await cb.received;
    expect(callback.pathname).toBe("/callback");
    expect(callback.searchParams.get("state")).toBe(state);
    const code = callback.searchParams.get("code");
    expect(code).toBeTruthy();

    const res = await fetch(new URL("/api/auth/oauth2/token", baseURL), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code!,
        redirect_uri: cb.redirectUri,
        client_id: "monoagent",
        code_verifier: verifier,
      }),
    });
    const body = (await res.json()) as Tokens & { error?: string };
    expect(res.status, JSON.stringify(body)).toBe(200);
    return body;
  } finally {
    cb.close();
  }
}
