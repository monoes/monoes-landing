import { test, expect, request as playwrightRequest } from "@playwright/test";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { emailClaimRequest } from "../src/lib/db/schema";
import { sha256Base64Url } from "../src/lib/community/hash-token";

function uniqueEmail() {
  return `claim-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `claim${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

/** Seeds an email_claim_request row directly via D1 — this environment has
 * no way to intercept a real Resend send, so tests bypass /claim's email
 * step and drive /claim/verify against a known plaintext code, per the
 * spec's explicit Out of Scope note. */
async function seedClaimRequest(opts: {
  email: string;
  clientId: string;
  scope: string;
  code: string;
  attempts?: number;
  expiresAt?: Date;
}) {
  const codeHash = await sha256Base64Url(opts.code);
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB);
    const now = new Date();
    await db.insert(emailClaimRequest).values({
      id: crypto.randomUUID(),
      email: opts.email,
      codeHash,
      clientId: opts.clientId,
      scope: opts.scope,
      attempts: opts.attempts ?? 0,
      expiresAt: opts.expiresAt ?? new Date(now.getTime() + 10 * 60 * 1000),
      createdAt: now,
    });
  } finally {
    await dispose();
  }
}

async function registerClient(agent: import("@playwright/test").APIRequestContext) {
  const registerRes = await agent.post("/api/auth/oauth2/register", {
    data: {
      redirect_uris: ["https://example-agent.test/callback"],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  const { client_id: clientId } = (await registerRes.json()) as { client_id: string };
  return clientId;
}

test("verified-email claim: correct code issues a working access token", async ({ page, baseURL }) => {
  const email = uniqueEmail();
  await registerAndOnboard(page, email, uniqueUsername());

  const agent = await playwrightRequest.newContext({ baseURL });
  const clientId = await registerClient(agent);
  const scope = "community:read community:write";
  const code = "123456";

  await seedClaimRequest({ email, clientId, scope, code });

  const verifyRes = await agent.post("/api/auth/agent/claim/verify", {
    data: { email, code, client_id: clientId },
    // First-time Turbopack compilation of this route in this sandbox can
    // exceed the default 30s actionTimeout — bump just this call rather
    // than the whole suite's timeout (see tests/oauth.spec.ts).
    timeout: 90_000,
  });
  expect(verifyRes.ok()).toBeTruthy();
  const verifyBody = (await verifyRes.json()) as { access_token?: string; token_type?: string; scope?: string };
  expect(verifyBody.access_token).toBeTruthy();
  expect(verifyBody.token_type).toBe("Bearer");
  expect(verifyBody.scope).toBe(scope);

  const feedRes = await agent.get("/api/community/feed", {
    headers: { Authorization: `Bearer ${verifyBody.access_token}` },
    timeout: 90_000,
  });
  expect(feedRes.ok()).toBeTruthy();

  const postRes = await agent.post("/api/community/posts", {
    headers: { Authorization: `Bearer ${verifyBody.access_token}` },
    data: { title: "Claim flow test post", body: "Created via a verified-email access token." },
    timeout: 90_000,
  });
  expect(postRes.status()).toBe(201);

  await agent.dispose();
});

test("verified-email claim: wrong code is rejected", async ({ page, baseURL }) => {
  const email = uniqueEmail();
  await registerAndOnboard(page, email, uniqueUsername());

  const agent = await playwrightRequest.newContext({ baseURL });
  const clientId = await registerClient(agent);

  await seedClaimRequest({ email, clientId, scope: "community:read", code: "111111" });

  const verifyRes = await agent.post("/api/auth/agent/claim/verify", {
    data: { email, code: "000000", client_id: clientId },
  });
  expect(verifyRes.status()).toBe(400);
  const body = (await verifyRes.json()) as { error?: string };
  expect(body.error).toBe("invalid_or_expired_code");

  await agent.dispose();
});

test("verified-email claim: exhausted attempts reject even the correct code", async ({ page, baseURL }) => {
  const email = uniqueEmail();
  await registerAndOnboard(page, email, uniqueUsername());

  const agent = await playwrightRequest.newContext({ baseURL });
  const clientId = await registerClient(agent);
  const code = "654321";

  await seedClaimRequest({ email, clientId, scope: "community:read", code, attempts: 5 });

  const verifyRes = await agent.post("/api/auth/agent/claim/verify", {
    data: { email, code, client_id: clientId },
  });
  expect(verifyRes.status()).toBe(400);
  const body = (await verifyRes.json()) as { error?: string };
  expect(body.error).toBe("invalid_or_expired_code");

  await agent.dispose();
});
