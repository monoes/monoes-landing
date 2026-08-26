import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const OAUTH_SCOPES = ["openid", "profile", "email", "community:read", "community:write"] as const;

export function getAuth(db: Db = getDb()) {
  const { BETTER_AUTH_SECRET: sec, BETTER_AUTH_URL: url } = process.env;
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    plugins: [
      jwt(),
      oauthProvider({
        loginPage: "/community/login",
        consentPage: "/community/oauth/consent",
        scopes: [...OAUTH_SCOPES],
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
      }),
    ],
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
    // Base session/email auth tolerates a missing BETTER_AUTH_URL by
    // deriving an origin per-request, but the oauth-provider plugin needs a
    // resolvable issuer at plugin-init time and throws otherwise. Production
    // always sets BETTER_AUTH_URL; this fallback only ever applies to local
    // dev / CI, where it was previously unset without consequence.
    baseURL: url ?? "http://localhost:3000",
  });
}
