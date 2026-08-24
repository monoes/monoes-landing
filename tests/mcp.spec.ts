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
  return `mcp-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueUsername() {
  return `mcp${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
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

/** Registers an OAuth client and completes the authorization-code + PKCE
 * flow (same steps as tests/oauth.spec.ts) to get a real Bearer token for
 * the MCP tools/call auth test — MCP tokens are the exact same
 * oauth_access_token rows the REST API uses. */
async function getAccessToken(
  page: import("@playwright/test").Page,
  agent: import("@playwright/test").APIRequestContext,
): Promise<string> {
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
  const tokenBody = (await tokenRes.json()) as { access_token?: string };
  expect(tokenRes.ok()).toBeTruthy();
  expect(tokenBody.access_token).toBeTruthy();
  return tokenBody.access_token!;
}

async function callMcp(
  agent: import("@playwright/test").APIRequestContext,
  body: unknown,
  authHeader?: string,
) {
  const res = await agent.post("/api/mcp", {
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(authHeader ? { authorization: authHeader } : {}),
    },
    data: body,
    timeout: 90_000,
  });
  const text = await res.text();
  // Streamable HTTP responses arrive as a single SSE "message" event —
  // extract the JSON payload from its "data:" line.
  const dataLine = text.split("\n").find((line) => line.startsWith("data:"));
  const json = JSON.parse((dataLine ?? text.replace(/^data:\s*/, "")).replace(/^data:\s*/, ""));
  return { status: res.status(), json };
}

test.describe("MCP server", () => {
  test("initialize returns server info without authentication", async ({ baseURL }) => {
    const agent = await playwrightRequest.newContext({ baseURL });
    const { status, json } = await callMcp(agent, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1.0" } },
    });
    expect(status).toBe(200);
    expect(json.result.serverInfo.name).toBe("monoes-community");
    await agent.dispose();
  });

  test("tools/list returns all 11 tools without authentication", async ({ baseURL }) => {
    const agent = await playwrightRequest.newContext({ baseURL });
    const { status, json } = await callMcp(agent, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    expect(status).toBe(200);
    const names = (json.result.tools as Array<{ name: string }>).map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "comment_bug",
        "create_bug",
        "create_feature",
        "create_org",
        "create_post",
        "get_feed",
        "run_org",
        "vote_bug",
        "vote_feature",
        "vote_org",
        "vote_post",
      ].sort(),
    );
    await agent.dispose();
  });

  test("tools/call without an Authorization header returns a tool error, not a transport error", async ({ baseURL }) => {
    const agent = await playwrightRequest.newContext({ baseURL });
    const { status, json } = await callMcp(agent, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "create_post", arguments: { title: "Hi", body: "Test" } },
    });
    expect(status).toBe(200);
    expect(json.result.isError).toBe(true);
    expect(json.result.content[0].text).toMatch(/Not authenticated/);
    await agent.dispose();
  });

  test("tools/call with a valid Bearer token creates a real post", async ({ page, baseURL }) => {
    await registerAndOnboard(page, uniqueEmail(), uniqueUsername());
    const agent = await playwrightRequest.newContext({ baseURL });
    const accessToken = await getAccessToken(page, agent);

    const { status, json } = await callMcp(
      agent,
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "create_post", arguments: { title: "MCP test post", body: "Created via an MCP tool call." } },
      },
      `Bearer ${accessToken}`,
    );
    expect(status).toBe(200);
    expect(json.result.isError).toBeFalsy();
    const created = JSON.parse(json.result.content[0].text);
    expect(created.id).toBeTruthy();
    expect(created.title).toBe("MCP test post");

    await agent.dispose();
  });

  test("server card is served at every scanner-checked path, pointing at the real MCP endpoint", async ({ baseURL, request }) => {
    for (const path of [
      "/.well-known/mcp.json",
      "/.well-known/mcp/server-card.json",
      "/.well-known/mcp/server-cards.json",
      "/.well-known/mcp-server-card",
    ]) {
      const res = await request.get(path);
      expect(res.ok(), `${path} should be 200`).toBeTruthy();
      const card = await res.json();
      expect(card.remotes[0].url).toBe(`${baseURL}/api/mcp`);
    }
  });
});
