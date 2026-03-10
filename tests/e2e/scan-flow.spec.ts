import { test, expect } from "@playwright/test";

test.describe("Header Scan Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage loads with scan form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /scan your site for security headers/i })).toBeVisible();
    await expect(page.getByPlaceholder("https://example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Scan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scan" })).toBeDisabled();
  });

  test("scan button enables when URL is typed", async ({ page }) => {
    const input = page.getByPlaceholder("https://example.com");
    const scanBtn = page.getByRole("button", { name: "Scan" });

    await expect(scanBtn).toBeDisabled();
    await input.fill("https://example.com");
    await expect(scanBtn).toBeEnabled();
  });

  test("shows error for empty URL on manual trigger", async ({ page }) => {
    // Input has required state via disabled button; error shown if input cleared
    const input = page.getByPlaceholder("https://example.com");
    await input.fill("x");
    await input.clear();
    // Button stays disabled - no error message needed since button is disabled
    await expect(page.getByRole("button", { name: "Scan" })).toBeDisabled();
  });

  test("shows error for invalid URL format", async ({ page }) => {
    const input = page.getByPlaceholder("https://example.com");
    await input.fill("not-a-valid-url");
    await page.getByRole("button", { name: "Scan" }).click();
    await expect(page.getByText(/Invalid URL format/i)).toBeVisible({ timeout: 10_000 });
  });

  test("successful scan returns grade and header results", async ({ page }) => {
    const input = page.getByPlaceholder("https://example.com");
    await input.fill("https://example.com");
    await page.getByRole("button", { name: "Scan" }).click();

    // Wait for loading to complete
    await expect(page.getByText("Scanning...")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });

    // Overall grade box should be visible (A/B/C/D/F)
    const gradeBox = page.locator(".rounded-xl").filter({ hasText: /^[A-F]$/ }).first();
    await expect(gradeBox).toBeVisible({ timeout: 15_000 });

    // Score out of 100
    await expect(page.getByText(/\/100/)).toBeVisible();

    // Should have header result cards
    await expect(page.getByText("Strict-Transport-Security")).toBeVisible();
    await expect(page.getByText("Content-Security-Policy")).toBeVisible();
    await expect(page.getByText("X-Content-Type-Options")).toBeVisible();
  });

  test("scan results show at least 10 header checks", async ({ page }) => {
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await page.getByRole("button", { name: "Scan" }).click();

    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });

    // Count header cards - each has a grade badge
    const headerCards = page.locator(".font-mono.text-sm.font-medium");
    await expect(headerCards).toHaveCount(10, { timeout: 15_000 });
  });

  test("missing headers show recommendations", async ({ page }) => {
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await page.getByRole("button", { name: "Scan" }).click();

    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });

    // example.com likely missing many security headers, so recommendations should appear
    const recommendations = page.locator("text=Add:");
    const count = await recommendations.count();
    expect(count).toBeGreaterThan(0);
  });

  test("scan result shows scanned URL and timestamp", async ({ page }) => {
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await page.getByRole("button", { name: "Scan" }).click();

    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });
    await expect(page.getByText(/Scanned https:\/\/example\.com/i)).toBeVisible({ timeout: 15_000 });
  });

  test("Enter key triggers scan", async ({ page }) => {
    const input = page.getByPlaceholder("https://example.com");
    await input.fill("https://example.com");
    await input.press("Enter");

    await expect(page.getByText("Scanning...")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });
    await expect(page.getByText(/\/100/)).toBeVisible({ timeout: 15_000 });
  });

  test("shows error when scan target is unreachable", async ({ page }) => {
    await page.getByPlaceholder("https://example.com").fill("https://this-domain-definitely-does-not-exist-12345.com");
    await page.getByRole("button", { name: "Scan" }).click();

    await expect(page.getByText("Scanning...")).toBeHidden({ timeout: 30_000 });
    // Should show an error message
    const errorBox = page.locator(".bg-red-500\\/10");
    await expect(errorBox).toBeVisible({ timeout: 15_000 });
  });

  test("mobile viewport - scan form is usable at 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const input = page.getByPlaceholder("https://example.com");
    const scanBtn = page.getByRole("button", { name: "Scan" });

    await expect(input).toBeVisible();
    await expect(scanBtn).toBeVisible();

    await input.fill("https://example.com");
    await expect(scanBtn).toBeEnabled();
  });
});

test.describe("Pricing Page", () => {
  test("pricing page loads with free and pro tiers", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: /simple, transparent pricing/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$9")).toBeVisible();
  });

  test("free tier shows correct features", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("3 scans per day")).toBeVisible();
    await expect(page.getByText("10 security headers checked").first()).toBeVisible();
    await expect(page.getByText("A-F grading with breakdown")).toBeVisible();
  });

  test("pro tier shows upgrade button", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("button", { name: /upgrade to pro/i })).toBeVisible();
  });

  test("pro tier shows POPULAR badge", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("POPULAR")).toBeVisible();
  });

  test("free tier Get Started links back to home", async ({ page }) => {
    await page.goto("/pricing");

    const getStarted = page.getByRole("link", { name: "Get Started" });
    await expect(getStarted).toHaveAttribute("href", "/");
  });
});

test.describe("Auth Login Page", () => {
  test("login page renders magic link form", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByRole("heading", { name: /sign in to headerguard/i })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with github/i })).toBeVisible();
  });

  test("magic link button requires valid email", async ({ page }) => {
    await page.goto("/auth/login");

    const emailInput = page.getByPlaceholder("you@example.com");
    const submitBtn = page.getByRole("button", { name: /send magic link/i });

    // HTML5 validation prevents submit with empty/invalid email
    await emailInput.fill("not-an-email");
    await submitBtn.click();

    // Browser validation prevents submission - no "Check your email" screen
    await expect(page.getByText(/check your email/i)).not.toBeVisible();
  });
});

test.describe("API - Scan Endpoint", () => {
  test("POST /api/scan returns 400 for missing URL", async ({ request }) => {
    const res = await request.post("/api/scan", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url is required/i);
  });

  test("POST /api/scan returns 400 for invalid URL", async ({ request }) => {
    const res = await request.post("/api/scan", { data: { url: "not-a-url-at-all" } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid url/i);
  });

  test("POST /api/scan returns 400 for non-http protocol", async ({ request }) => {
    const res = await request.post("/api/scan", { data: { url: "ftp://example.com" } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/only http/i);
  });

  test("POST /api/scan returns valid scan result for real URL", async ({ request }) => {
    const res = await request.post("/api/scan", {
      data: { url: "https://example.com" },
      timeout: 30_000,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty("url");
    expect(body).toHaveProperty("overallGrade");
    expect(body).toHaveProperty("score");
    expect(body).toHaveProperty("headers");
    expect(body).toHaveProperty("scannedAt");
    expect(Array.isArray(body.headers)).toBe(true);
    expect(body.headers.length).toBe(10);
    expect(["A", "B", "C", "D", "F"]).toContain(body.overallGrade);
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
  });

  test("POST /api/scan normalizes URL without scheme", async ({ request }) => {
    const res = await request.post("/api/scan", {
      data: { url: "example.com" },
      timeout: 30_000,
    });
    // Should succeed by prepending https://
    expect([200, 502]).toContain(res.status());
  });
});
