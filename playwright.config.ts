import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright runs against BASE_URL: a local `next start` in CI, or a Vercel
 * preview for the form test. VERCEL_AUTOMATION_BYPASS_SECRET gets past
 * preview protection.
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    // CHROME_PATH uses an installed Chrome instead of the Playwright download.
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
    extraHTTPHeaders: bypass ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
