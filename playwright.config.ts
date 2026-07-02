import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // In-memory server state is shared — run tests sequentially to avoid interference.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter server dev",
      port: 3000,
      // Reuse whatever is already running locally (pnpm dev).
      // In CI, set PLAYWRIGHT_FRESH_SERVERS=1 to force a restart.
      reuseExistingServer: !process.env.PLAYWRIGHT_FRESH_SERVERS,
      timeout: 20_000,
    },
    {
      command: "pnpm --filter client dev",
      port: 5173,
      reuseExistingServer: !process.env.PLAYWRIGHT_FRESH_SERVERS,
      timeout: 20_000,
    },
  ],
});
