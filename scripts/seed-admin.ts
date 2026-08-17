import { eq } from "drizzle-orm";
import { getAuth } from "../src/lib/auth";
import { getDb } from "../src/lib/db";
import { user } from "../src/lib/db/schema";

const { ADMIN_EMAIL: email, ADMIN_USERNAME: username, ADMIN_PASSWORD: pw } = process.env;

async function main() {
  if (!email || !pw || !username) {
    console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME (e.g. via .dev.vars) before running this script.");
    process.exit(1);
  }

  const auth = getAuth();
  const db = getDb();

  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (existing.length === 0) {
    await auth.api.signUpEmail({ body: { email, password: pw, name: username } });
  }

  await db
    .update(user)
    .set({ role: "admin", username, updatedAt: new Date() })
    .where(eq(user.email, email));

  console.log(`Admin account ready: ${email} (username: ${username})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
