// Config file used only by `npx @better-auth/cli generate`, to derive the
// Drizzle schema for plugin-managed tables (oauth-provider, jwt) — the
// CLI needs a plain exported `auth` instance, not the getAuth(db) factory
// used at runtime (src/lib/auth.ts), and it never touches a real database
// for schema generation, so a stub adapter object is sufficient here.
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../src/lib/db/schema";

export const auth = betterAuth({
  baseURL: "https://monoes.me",
  database: drizzleAdapter({} as never, { provider: "sqlite", schema }),
  plugins: [
    jwt(),
    oauthProvider({
      loginPage: "/community/login",
      consentPage: "/community/oauth/consent",
      scopes: ["community:read", "community:write"],
    }),
  ],
});
