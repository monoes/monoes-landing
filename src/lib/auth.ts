import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const { BETTER_AUTH_SECRET: sec, BETTER_AUTH_URL: url } = process.env;

export function getAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: "sqlite", schema }),
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
