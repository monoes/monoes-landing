import { test, expect, request as playwrightRequest } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createPkcePair() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function uniqueEmail() {
  return `oauth-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `oauth${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

async function registerAndOnboard(page: import("@playwright/test").Page, email: string, username: string) {
  await page.goto("/community/register");
  await page.fill("#email", email);
  await page.fill("#password", "TestPass1234");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community\/onboarding$/);
  await page.fill("#username", username);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/community$/);
}

test("agent can register a client, get user consent, exchange a code for a token, and call the API", async ({
  page,
  baseURL,
}) => {
  const username = uniqueUsername();
  await registerAndOnboard(page, uniqueEmail(), username);

  // A real agent registering a client, and later exchanging a code for a
  // token, is an independent HTTP client with no session cookie for this
  // site at all — using a fresh, cookie-less request context (rather than
  // page.request, which inherits the logged-in browser session's cookies)
  // matches that reality. It also matters functionally: Better Auth's
  // origin/CSRF check only activates when a request carries a session
  // cookie, so page.request would need a spoofed Origin header that a real
  // cookie-less agent client would never send or need.
  const agent = await playwrightRequest.newContext({ baseURL });

  const registerRes = await agent.post("/api/auth/oauth2/register", {
    data: {
      redirect_uris: ["https://example-agent.test/callback"],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  const { client_id: clientId } = (await registerRes.json()) as { client_id: string };

  const { verifier: codeVerifier, challenge: codeChallenge } = createPkcePair();

  const authorizeUrl =
    `/api/auth/oauth2/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent("https://example-agent.test/callback")}` +
    `&response_type=code&scope=${encodeURIComponent("community:read community:write")}` +
    `&code_challenge=${codeChallenge}&code_challenge_method=S256&state=xyz`;

  await page.goto(authorizeUrl);
  await expect(page).toHaveURL(/\/community\/oauth\/consent/);
  await expect(page.getByText("Authorize access")).toBeVisible();
  await expect(page.getByText("Read your feed, bugs, orgs, posts, and votes")).toBeVisible();
  await expect(page.getByText("Post, comment, vote, and upload on your behalf")).toBeVisible();

  const redirectPromise = page.waitForRequest(
    (req) => req.url().startsWith("https://example-agent.test/callback") && req.method() === "GET",
  );
  await page.getByRole("button", { name: "Allow" }).click();
  const redirectReq = await redirectPromise.catch(() => null);

  let code: string | null = null;
  if (redirectReq) {
    code = new URL(redirectReq.url()).searchParams.get("code");
  } else {
    await expect(page).toHaveURL(/example-agent\.test/);
    code = new URL(page.url()).searchParams.get("code");
  }
  expect(code).toBeTruthy();

  const tokenRes = await agent.post("/api/auth/oauth2/token", {
    form: {
      grant_type: "authorization_code",
      code: code!,
      redirect_uri: "https://example-agent.test/callback",
      client_id: clientId,
      code_verifier: codeVerifier,
    },
  });
  const tokenBody = (await tokenRes.json()) as { access_token?: string; error?: string };
  expect(tokenRes.ok()).toBeTruthy();
  expect(tokenBody.access_token).toBeTruthy();
  const grantedAccess = tokenBody.access_token ?? "";

  const feedRes = await agent.get("/api/community/feed", {
    headers: { Authorization: `Bearer ${grantedAccess}` },
  });
  expect(feedRes.ok()).toBeTruthy();

  const meRes = await agent.get("/api/community/me", {
    headers: { Authorization: `Bearer ${grantedAccess}` },
  });
  expect(meRes.ok()).toBeTruthy();
  const meBody = (await meRes.json()) as { id?: string; username?: string };
  expect(meBody.username).toBe(username);

  const postRes = await agent.post("/api/community/posts", {
    headers: { Authorization: `Bearer ${grantedAccess}` },
    data: { title: "OAuth test post", body: "Created via an OAuth access token." },
    // First-time Turbopack compilation of this route in this sandbox can
    // exceed the default 30s actionTimeout — bump just this call rather
    // than the whole suite's timeout.
    timeout: 90_000,
  });
  expect(postRes.status()).toBe(201);

  await agent.dispose();
});
