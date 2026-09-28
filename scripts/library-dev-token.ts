// LOCAL DEVELOPMENT ONLY. Creates (or reuses) a user in the local D1 and
// prints a library access token for the "monoagent" OAuth client, so the
// MonoAgent CLI can be tested against `npm run dev` without a browser.
// getPlatformProxy only ever opens the local (.wrangler/state) database.
//
//   npx tsx scripts/library-dev-token.ts --email dev@example.test --username devuser [--admin] | tail -1
// (wrangler prints a line of its own first; the token is the last line)
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getAuth } from "../src/lib/auth";
import * as schema from "../src/lib/db/schema";
import { oauthAccessToken, user } from "../src/lib/db/schema";
import { sha256Base64Url } from "../src/lib/community/hash-token";

const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SCOPES = ["openid", "profile", "email", "library:read", "library:write", "community:read", "community:write"];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email") ?? "dev@library.test";
  const username = arg("username") ?? email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  const pw = arg("password") ?? "DevPassword123!";
  const admin = process.argv.includes("--admin");

  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB, { schema });
    const [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (!existing) {
      await getAuth(db).api.signUpEmail({ body: { email, password: pw, name: username } });
    }
    await db
      .update(user)
      .set({ username, ...(admin ? { role: "admin" } : {}), updatedAt: new Date() })
      .where(eq(user.email, email));
    const [row] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.email, email)).limit(1);

    const bearer = /* random */ randomBytes(32).toString("base64url");
    const now = new Date();
    await db.insert(oauthAccessToken).values({
      id: crypto.randomUUID(),
      token: await sha256Base64Url(bearer),
      clientId: "monoagent",
      userId: row.id,
      scopes: SCOPES,
      expiresAt: new Date(now.getTime() + TTL_MS),
      createdAt: now,
    });
    console.error(`user ${email} (username ${username}, role ${row.role}, password ${existing ? "unchanged" : pw})`);
    console.log(bearer);
  } finally {
    await dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
