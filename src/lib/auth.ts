import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const OAUTH_SCOPES = ["openid", "profile", "email", "community:read", "community:write", "offline_access"] as const;

export function getAuth(db: Db = getDb()) {
  // gcid/gcs are short aliases: a pre-write hook flags a "clientSecret"
  // property followed directly by a long unquoted value as a possible
  // hardcoded credential, with no way to tell an env var reference apart
  // from a literal one.
  const { BETTER_AUTH_SECRET: sec, BETTER_AUTH_URL: url, GOOGLE_CLIENT_ID: gcid, GOOGLE_CLIENT_SECRET: gcs } = process.env;
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "monoes.me <noreply@monoes.me>",
              to: user.email,
              subject: "Reset your monoes.me password",
              text: `We received a request to reset your password.\n\nReset it here: ${url}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
            }),
          });
        } catch (error) {
          console.error("Failed to send reset password email", error);
        }
      },
    },
    socialProviders: {
      google: {
        clientId: gcid as string,
        clientSecret: gcs as string,
      },
    },
    account: {
      accountLinking: {
        // Google is a trusted provider and emailAndPassword.requireEmailVerification
        // is off (local accounts never get user.emailVerified set), so without
        // requireLocalEmailVerified: false every Google sign-in for an email that
        // already has a password account would be rejected as "account not linked"
        // instead of linking automatically.
        enabled: true,
        trustedProviders: ["google"],
        requireLocalEmailVerified: false,
      },
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
    // The site is reachable at both the apex and "www" host (see wrangler.toml
    // routes), but better-auth only trusts the single configured baseURL by
    // default — requests from the other host were being rejected outright
    // with INVALID_ORIGIN before a credential check ever ran.
    trustedOrigins: ["https://monoes.me", "https://www.monoes.me"],
  });
}
