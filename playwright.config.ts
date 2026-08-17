import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 15 * 60 * 1000,
  expect: {
    timeout: 5 * 60 * 1000,
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    actionTimeout: 2 * 60 * 1000,
    navigationTimeout: 5 * 60 * 1000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 10 * 60 * 1000,
  },
});
