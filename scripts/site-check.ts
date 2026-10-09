/**
 * Site check. Runs before every build (prebuild) and in CI. No server needed.
 * Fails when: the config is invalid, a config page has no page component or a
 * page component has no config page, a redirect is broken, or the deck or
 * config points at an asset file that doesn't exist.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { clientConfigSchema } from "../lib/config.schema";
import raw from "../client.config";

const root = process.cwd();
const failures: string[] = [];
const warnings: string[] = [];

// 1. Config
const parsed = clientConfigSchema.safeParse(raw);
if (!parsed.success) {
  for (const i of parsed.error.issues) failures.push(`client.config.ts ${i.path.join(".") || "(root)"}: ${i.message}`);
  finish();
}
const config = parsed.data!;
const pagePaths = new Set(config.pages.map((p) => p.path));
const allPaths = new Set([...pagePaths, "/privacy", "/terms"]);

for (const p of config.pages) {
  if (p.seoTitle.length > 60) warnings.push(`${p.path}: SEO title is ${p.seoTitle.length} characters; Google shows about 60`);
  if (p.description.length > 160) warnings.push(`${p.path}: description is ${p.description.length} characters; Google shows about 160`);
}
const titles = config.pages.map((p) => p.seoTitle);
titles.filter((t, i) => titles.indexOf(t) !== i).forEach((t) => failures.push(`Duplicate SEO title: "${t}"`));

// 2. Page registry vs config
const registryFile = join(root, "components/site/pages/index.tsx");
if (!existsSync(registryFile)) {
  failures.push("components/site/pages/index.tsx is missing");
} else {
  const src = readFileSync(registryFile, "utf8");
  const block = src.slice(src.indexOf("pageComponents"));
  const registered = new Set([...block.matchAll(/^\s*["'](\/[a-z0-9/-]*)["']\s*:/gm)].map((m) => m[1]));
  for (const p of pagePaths) if (!registered.has(p)) failures.push(`Page ${p} is in the config but has no entry in components/site/pages`);
  for (const p of registered) if (!pagePaths.has(p)) failures.push(`components/site/pages has ${p}, which is not in the config`);
}

// 3. Redirects
const froms = new Set<string>();
for (const r of config.redirects) {
  if (froms.has(r.from)) failures.push(`Redirect from ${r.from} is listed twice`);
  froms.add(r.from);
  if (allPaths.has(r.from)) failures.push(`Redirect from ${r.from} would hide a live page`);
  const target = r.to.split(/[?#]/)[0];
  if (!allPaths.has(target)) failures.push(`Redirect ${r.from} -> ${r.to}: target is not a page on the site`);
  if (r.from === r.to) failures.push(`Redirect ${r.from} points at itself`);
}
for (const r of config.redirects) {
  if (froms.has(r.to)) failures.push(`Redirect chain: ${r.from} -> ${r.to} -> another redirect. Point it straight at the final page`);
}

// 4. Deck and assets
const deck = join(root, "design/deck.html");
const assetsDir = join(root, "design/assets");
if (!existsSync(deck)) failures.push("design/deck.html is missing");

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? listFiles(full) : [relative(assetsDir, full)];
  });
}
const assetFiles = new Set(listFiles(assetsDir));
const assetRef = /(?:^|["'(\s/])assets\/([A-Za-z0-9._/-]+\.(?:jpe?g|png|webp|avif|gif|svg|mp4|webm|woff2?|ttf|otf|pdf))/g;
for (const [label, file] of [
  ["design/deck.html", deck],
  ["client.config.ts", join(root, "client.config.ts")],
] as const) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(assetRef)) {
    if (!assetFiles.has(m[1])) failures.push(`${label} references assets/${m[1]}, which is not in design/assets`);
  }
}

finish();

function finish(): never {
  for (const w of warnings) console.warn(`  warn  ${w}`);
  if (failures.length) {
    console.error(`\n✗ Site check: ${failures.length} problem${failures.length === 1 ? "" : "s"}`);
    for (const f of failures) console.error(`  fail  ${f}`);
    process.exit(1);
  }
  console.log("✓ Site check passed");
  process.exit(0);
}
