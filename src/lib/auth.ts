import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, type Db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const { BETTER_AUTH_SECRET: sec, BETTER_AUTH_URL: url } = process.env;

export function getAuth(db: Db = getDb()) {
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
    secret: sec,
    baseURL: url,
  });
}
