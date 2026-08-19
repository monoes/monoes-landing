import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    actionTimeout: 30 * 1000,
    navigationTimeout: 90 * 1000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
});
