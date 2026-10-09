/**
 * Shared helpers for the check scripts. Every URL-based script takes
 * --url <base> (or BASE_URL), e.g. http://localhost:3000 or a Vercel preview.
 */
import { allPages, config, siteUrl } from "../lib/config";

export { allPages, config, siteUrl };

export function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  return eq?.split("=").slice(1).join("=");
}

export function baseUrl(): string {
  const url = arg("url") ?? process.env.BASE_URL;
  if (!url) {
    console.error("Pass --url <base url> or set BASE_URL, e.g. --url http://localhost:3000");
    process.exit(2);
  }
  return url.replace(/\/$/, "");
}

/** Headers needed to reach a protected Vercel preview. */
export function requestHeaders(): Record<string, string> {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return bypass ? { "x-vercel-protection-bypass": bypass } : {};
}

export function pageUrl(base: string, path: string): string {
  return `${base}${path === "/" ? "/" : path}`;
}

export function report(name: string, allFailures: string[], allWarnings: string[] = []): never {
  const failures = [...new Set(allFailures)];
  const warnings = [...new Set(allWarnings)];
  for (const w of warnings) console.warn(`  warn  ${w}`);
  if (failures.length) {
    console.error(`\n✗ ${name}: ${failures.length} problem${failures.length === 1 ? "" : "s"}`);
    for (const f of failures) console.error(`  fail  ${f}`);
    process.exit(1);
  }
  console.log(`✓ ${name} passed`);
  process.exit(0);
}
