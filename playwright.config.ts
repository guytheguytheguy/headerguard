import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Locally this machine runs many other projects' dev/build/test processes
  // concurrently (shared portfolio monorepo). fullyParallel with an uncapped
  // worker count (defaults to CPU core count) fires a burst of simultaneous
  // page.goto() requests at the single `next start` process the instant the
  // webServer readiness check passes, which queues under contention and blows
  // the 30s beforeEach timeout for whichever tests land at the back of the
  // burst -- reproduced locally (9/23 passed, all 14 failures were goto
  // timeouts concentrated in the first wave). Capping workers smooths the
  // burst; the retry above absorbs any residual cold-start flake.
  workers: process.env.CI ? 1 : 3,
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
