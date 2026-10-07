// The MonoAgent OAuth flow over plain HTTP, no browser: sign up, authorize (PKCE), consent,
// token, refresh. tests/helpers/library-auth.ts drives the same flow through the UI; these
// specs need no page, so they run without a browser. The dev server's BETTER_AUTH_URL must
// equal the baseURL (the default on port 3000): it ends up in every token's `iss`.
import { createHash, createPublicKey, randomBytes, verify } from "node:crypto";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { emailClaimRequest, user } from "../../src/lib/db/schema";
import { sha256Base64Url } from "../../src/lib/community/hash-token";

export const AUDIENCE = "https://monoes.me/api/monoagent";
export const MONOAGENT_SCOPES = "openid profile email offline_access library:read library:write";
const LOOPBACK = "http://127.0.0.1:53682/callback";
const PASSWORD = "TestPass1234";

export type Account = { baseURL: string; cookie: string; userId: string; email: string };
export type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};
export type Result = { status: number; body: TokenResponse };

const cookiesOf = (res: Response) => res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

async function webAuth(baseURL: string, path: string, body: object, email: string): Promise<{ status: number; account?: Account }> {
  const res = await fetch(new URL(path, baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: new URL(baseURL).origin },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { status: res.status };
  const { user: found } = (await res.json()) as { user: { id: string } };
  return { status: res.status, account: { baseURL, cookie: cookiesOf(res), userId: found.id, email } };
}

export async function signUp(baseURL: string): Promise<Account> {
  const email = `gate${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@example.com`;
  const r = await webAuth(baseURL, "/api/auth/sign-up/email", { email, password: PASSWORD, name: email.split("@")[0] }, email);
  if (!r.account) throw new Error(`sign-up failed: ${r.status}`);
  return r.account;
}

export const signIn = (baseURL: string, email: string) => webAuth(baseURL, "/api/auth/sign-in/email", { email, password: PASSWORD }, email);

export function pkce() {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url") };
}

type AuthorizeOptions = { resource?: string; scope?: string; clientId?: string; redirectUri?: string };

/** authorize + consent: the authorization code, or a thrown "error: description" from an error redirect. */
export async function authorize(account: Account, challenge: string, o: AuthorizeOptions = {}): Promise<string> {
  const redirectUri = o.redirectUri ?? LOOPBACK;
  const url = new URL("/api/auth/oauth2/authorize", account.baseURL);
  url.search = new URLSearchParams({
    client_id: o.clientId ?? "monoagent",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: o.scope ?? MONOAGENT_SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: randomBytes(8).toString("hex"),
    ...(o.resource ? { resource: o.resource } : {}),
  }).toString();

  const first = await fetch(url, { headers: { Cookie: account.cookie }, redirect: "manual" });
  // A client that is not a browser is told where to go as JSON.
  const json = first.status === 200 ? ((await first.json().catch(() => ({}))) as { url?: string }) : {};
  const location = first.headers.get("location") ?? json.url ?? "";
  const codeFrom = (target: string) => {
    const query = new URL(target, account.baseURL).searchParams;
    if (query.get("error")) throw new Error(`${query.get("error")}: ${query.get("error_description") ?? ""}`);
    return query.get("code") ?? "";
  };
  if (!location) throw new Error(`authorize: no redirect (${first.status})`);
  if (location.startsWith(redirectUri) || location.includes("error=")) return codeFrom(location);

  // The consent page posts the query string it was opened with.
  const consent = await fetch(new URL("/api/auth/oauth2/consent", account.baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: new URL(account.baseURL).origin, Cookie: account.cookie },
    body: JSON.stringify({ accept: true, oauth_query: new URL(location, account.baseURL).search.slice(1) }),
  });
  const { url: target } = (await consent.json()) as { url?: string };
  if (!consent.ok || !target) throw new Error(`consent failed: ${consent.status}`);
  return codeFrom(target);
}

async function tokenRequest(baseURL: string, form: Record<string, string>): Promise<Result> {
  const res = await fetch(new URL("/api/auth/oauth2/token", baseURL), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as TokenResponse };
}

export const exchange = (baseURL: string, code: string, verifier: string, resource?: string, redirectUri = LOOPBACK, clientId = "monoagent") =>
  tokenRequest(baseURL, { grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, code_verifier: verifier, ...(resource ? { resource } : {}) });

export const refresh = (baseURL: string, refreshToken: string, resource?: string) =>
  tokenRequest(baseURL, { grant_type: "refresh_token", refresh_token: refreshToken, client_id: "monoagent", ...(resource ? { resource } : {}) });

/** A full MonoAgent login. `resource` goes on the authorize and the token request, as the new client sends it. */
export async function login(baseURL: string, o: { resource?: string; scope?: string; account?: Account } = {}) {
  const account = o.account ?? (await signUp(baseURL));
  const { verifier, challenge } = pkce();
  const code = await authorize(account, challenge, { resource: o.resource, scope: o.scope });
  return { account, ...(await exchange(baseURL, code, verifier, o.resource)) };
}

export function decodeJwt(token: string) {
  const [header, payload] = token.split(".");
  const part = (p: string) => JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as Record<string, unknown>;
  return { header: part(header), payload: part(payload) };
}

/** A boolean, so an assertion on it never prints the token when it fails. */
export const isJwt = (token: string | undefined) => token?.split(".").length === 3;

/** What the Go client does: Ed25519 over "header.payload" with the public key published at /api/auth/jwks. */
export async function verifiesAgainstJwks(baseURL: string, token: string): Promise<boolean> {
  const { keys } = (await (await fetch(new URL("/api/auth/jwks", baseURL))).json()) as { keys: { kid: string; kty: string; crv: string; x: string }[] };
  const key = keys.find((k) => k.kid === decodeJwt(token).header.kid);
  const [h, p, s] = token.split(".");
  const publicKey = key && createPublicKey({ key: { kty: key.kty, crv: key.crv, x: key.x }, format: "jwk" });
  return !!publicKey && verify(null, Buffer.from(`${h}.${p}`), publicKey, Buffer.from(s, "base64url"));
}

export const bearer = (token: string | undefined): Record<string, string> => ({ Authorization: `Bearer ${token}` });

// ---- the local D1, as tests/feature-voting.spec.ts reaches it ----

export async function withDb<T>(fn: (db: ReturnType<typeof drizzle>) => Promise<T>): Promise<T> {
  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    return await fn(drizzle(env.COMMUNITY_DB));
  } finally {
    await dispose();
  }
}

export const setUserRole = (userId: string, role: "admin" | "moderator") =>
  withDb((db) => db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId)));

/** Seeds an email_claim_request row, as tests/oauth-claim.spec.ts does: no test can read the emailed code. */
export async function seedClaimRequest(o: { email: string; scope: string; code: string; clientId?: string }) {
  const codeHash = await sha256Base64Url(o.code);
  await withDb((db) =>
    db.insert(emailClaimRequest).values({
      id: crypto.randomUUID(),
      email: o.email,
      codeHash,
      clientId: o.clientId ?? "monoagent",
      scope: o.scope,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    }),
  );
}
