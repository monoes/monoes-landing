import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { getAuth } from "../src/lib/auth";
import * as schema from "../src/lib/db/schema";
import { user } from "../src/lib/db/schema";

const { ADMIN_EMAIL: email, ADMIN_USERNAME: username, ADMIN_PASSWORD: pw } = process.env;

async function main() {
  if (!email || !pw || !username) {
    console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME (e.g. via .dev.vars) before running this script.");
    process.exit(1);
  }

  const { env, dispose } = await getPlatformProxy<CloudflareEnv>({ envFiles: [] });
  try {
    const db = drizzle(env.COMMUNITY_DB, { schema });
    const auth = getAuth(db);

    const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (existing.length === 0) {
      await auth.api.signUpEmail({ body: { email, password: pw, name: username } });
    }

    await db
      .update(user)
      .set({ role: "admin", username, updatedAt: new Date() })
      .where(eq(user.email, email));

    console.log(`Admin account ready: ${email} (username: ${username})`);
  } finally {
    await dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
