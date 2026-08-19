import { defineConfig } from "drizzle-kit";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID!;
const tok = process.env.CLOUDFLARE_D1_TOKEN!;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: { accountId, databaseId, token: tok },
});
