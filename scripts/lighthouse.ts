/**
 * Lighthouse CI on every page. Thresholds live in lighthouserc.json:
 * performance 90, accessibility 95, best practice 95, SEO 100.
 * Usage: tsx scripts/lighthouse.ts --url <base>
 */
import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { allPages, baseUrl, pageUrl } from "./lib";

const base = baseUrl();
const urls = allPages.map((p) => `--collect.url=${pageUrl(base, p.path)}`);
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();

const result = spawnSync("npx", ["lhci", "autorun", ...urls], {
  stdio: "inherit",
  env: { ...process.env, CHROME_PATH: chromePath },
});
process.exit(result.status ?? 1);
