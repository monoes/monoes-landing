import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { user } from "../src/lib/db/schema";
import { AUDIENCE, login, refresh, signUp, withDb } from "./helpers/oauth-api";

// The signing key's fail-closed rule (a deployment on an https base URL with no key refuses to sign,
// a 500) must not swallow the invalid_grant a blocked account is owed: the claims guard runs before
// the provider signs, and mono-agent reads only invalid_grant as "monoes.me said no".
//
// Needs a second server on the same local D1 that declares an https base URL and has no key, e.g.
//   BETTER_AUTH_URL=https://monoes.me MONOAGENT_JWT_PRIVATE_JWK= npx next dev -p 3108
// and E2E_FAIL_CLOSED_URL=http://localhost:3108. Skipped without it.
const failClosed = process.env.E2E_FAIL_CLOSED_URL;
test.skip(!failClosed, "set E2E_FAIL_CLOSED_URL to a server that fails closed");

test("a server that fails closed still answers a blocked account invalid_grant, and a healthy account 500", async ({ baseURL }) => {
  const blocked = await signUp(baseURL!);
  const healthy = await signUp(baseURL!);
  const blockedChain = await login(baseURL!, { resource: AUDIENCE, account: blocked });
  const healthyChain = await login(baseURL!, { resource: AUDIENCE, account: healthy });
  await withDb((db) => db.update(user).set({ blockedAt: new Date() }).where(eq(user.id, blocked.userId)));

  // The control: this server really does refuse to sign.
  const control = await refresh(failClosed!, healthyChain.body.refresh_token!, AUDIENCE);
  expect(control.status, "a healthy account on a server with no key").toBe(500);

  const refused = await refresh(failClosed!, blockedChain.body.refresh_token!, AUDIENCE);
  expect([refused.status, refused.body.error]).toEqual([400, "invalid_grant"]);
});
