import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000"
  },
  webServer: [
    {
      command: "pnpm dev:backend",
      url: "http://localhost:3001/health",
      reuseExistingServer: !process.env.CI
    },
    {
      command: "pnpm dev:frontend",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI
    }
  ]
});
