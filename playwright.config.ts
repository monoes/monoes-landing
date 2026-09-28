import { defineConfig } from "@playwright/test";

// E2E_BASE_URL runs the suite against another dev server (e.g.
// http://localhost:3100); E2E_CHROMIUM points at a system Chromium when
// Playwright's own browsers aren't installed.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const port = new URL(baseURL).port || "3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    actionTimeout: 30 * 1000,
    navigationTimeout: 90 * 1000,
    ...(process.env.E2E_CHROMIUM ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM } } : {}),
  },
  webServer: {
    command: port === "3000" ? "npm run dev" : `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
});
