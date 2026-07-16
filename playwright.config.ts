import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // Port 3001 collides with other projects' dev servers in this multi-project
    // monorepo/machine (reuseExistingServer then silently attaches to the wrong
    // app, causing every locator to time out against unrelated UI). Use a port
    // specific to this project to avoid cross-project collisions.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:34771",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next start -p 34771",
    url: "http://localhost:34771",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
