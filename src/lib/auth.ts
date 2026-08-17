import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export function getAuth(db: Db = getDb()) {
  const { BETTER_AUTH_SECRET: sec, BETTER_AUTH_URL: url } = process.env;
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    user: {
      additionalFields: {
        username: { type: "string", required: false, input: false },
        role: { type: "string", required: false, input: false, defaultValue: "member" },
        blockedAt: { type: "date", required: false, input: false },
        blockedBy: { type: "string", required: false, input: false },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const [row] = await db
              .select({ blockedAt: schema.user.blockedAt })
              .from(schema.user)
              .where(eq(schema.user.id, session.userId))
              .limit(1);
            if (row?.blockedAt) {
              return false;
            }
          },
        },
      },
    },
    secret: sec,
    baseURL: url,
  });
}
