/**
 * Screenshots every page at 1280px and 390px for /qa to compare with the deck.
 * Also captures the deck itself. Output: qa/screenshots/ (git-ignored).
 * Usage: tsx scripts/qa-screenshots.ts --url <base>
 */
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { allPages, baseUrl, pageUrl, requestHeaders } from "./lib";
import { CONSENT_KEY } from "../components/system/consent-key";

const WIDTHS = [1280, 390];

function fileName(path: string, width: number) {
  const slug = path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
  return `${slug}-${width}.png`;
}

async function main() {
  const base = baseUrl();
  const out = join(process.cwd(), "qa/screenshots");
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const context = await browser.newContext({ extraHTTPHeaders: requestHeaders() });
  // Dismiss the cookie banner so it doesn't cover the page.
  await context.addInitScript((key) => {
    try {
      window.localStorage.setItem(key, "denied");
    } catch {}
  }, CONSENT_KEY);
  const page = await context.newPage();

  for (const p of allPages) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(pageUrl(base, p.path), { waitUntil: "networkidle" });
      const file = join(out, fileName(p.path, width));
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ${file}`);
    }
  }

  const deck = join(process.cwd(), "design/deck.html");
  if (existsSync(deck)) {
    await page.setViewportSize({ width: 2400, height: 1200 });
    await page.goto(pathToFileURL(deck).toString(), { waitUntil: "load" });
    await page.screenshot({ path: join(out, "deck.png"), fullPage: true });
    console.log(`  ${join(out, "deck.png")}`);
  }

  await browser.close();
  console.log(`✓ ${allPages.length * WIDTHS.length} page screenshots saved to qa/screenshots`);
}

main();
