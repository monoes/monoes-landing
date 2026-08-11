import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated OpenNext build output (Cloudflare adapter):
    ".open-next/**",
    // Local agent tooling, not app code:
    ".claude/**",
    ".monomind/**",
    ".swarm/**",
    ".agents/**",
    ".understand/**",
    // macOS AppleDouble files (regenerate on non-HFS+ volumes):
    "._*",
    "**/._*",
  ]),
]);

export default eslintConfig;
