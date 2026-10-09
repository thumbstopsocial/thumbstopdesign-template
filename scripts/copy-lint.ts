/**
 * Copy lint. Checks the rendered text of every page (body copy, headings,
 * titles, meta descriptions, alt text) for em dashes, banned phrases and
 * American spellings. Runs against a running site: --url <base>.
 */
import { AMBIGUOUS, AMERICAN_SPELLINGS, BANNED_PHRASES } from "../lib/copy-rules";
import { allPages, baseUrl, config, pageUrl, report, requestHeaders } from "./lib";

const allow = config.copyLint.allow.map((a) => a.toLowerCase());

function decode(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;|&#8212;|&#x2014;/g, "—")
    .replace(/&ndash;|&#8211;|&#x2013;/g, "–");
}

/** Visible text plus the text people and search engines see without rendering. */
function copyFrom(html: string): string {
  const meta = [
    ...html.matchAll(/<title>([^<]*)<\/title>/gi),
    ...html.matchAll(/<meta[^>]+name="description"[^>]+content="([^"]*)"/gi),
    ...html.matchAll(/<meta[^>]+property="og:(?:title|description)"[^>]+content="([^"]*)"/gi),
    ...html.matchAll(/\salt="([^"]+)"/gi),
    ...html.matchAll(/\saria-label="([^"]+)"/gi),
    ...html.matchAll(/\splaceholder="([^"]+)"/gi),
  ].map((m) => m[1]);
  const body = html
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<(script|style|noscript|template|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
  return decode([...meta, body].join("\n")).replace(/[ \t]+/g, " ");
}

function context(text: string, index: number): string {
  return text.slice(Math.max(0, index - 30), index + 40).replace(/\s+/g, " ").trim();
}

function isAllowed(snippet: string): boolean {
  const s = snippet.toLowerCase();
  return allow.some((a) => s.includes(a));
}

async function main() {
  const base = baseUrl();
  const failures: string[] = [];
  const warnings: string[] = [];

  for (const page of allPages) {
    const res = await fetch(pageUrl(base, page.path), { headers: requestHeaders() });
    if (!res.ok) {
      failures.push(`${page.path}: HTTP ${res.status}`);
      continue;
    }
    const text = copyFrom(await res.text());
    const lower = text.toLowerCase();

    for (const m of text.matchAll(/—| – /g)) {
      const ctx = context(text, m.index!);
      if (!isAllowed(ctx)) failures.push(`${page.path}: dash used as punctuation in "...${ctx}..."`);
    }

    for (const phrase of BANNED_PHRASES) {
      const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*`, "gi");
      for (const m of lower.matchAll(re)) {
        const ctx = context(text, m.index!);
        if (!isAllowed(ctx)) failures.push(`${page.path}: banned phrase "${phrase}" in "...${ctx}..."`);
      }
    }

    for (const [us, uk] of Object.entries(AMERICAN_SPELLINGS)) {
      for (const m of lower.matchAll(new RegExp(`\\b${us}\\b`, "g"))) {
        const ctx = context(text, m.index!);
        if (isAllowed(ctx)) continue;
        const msg = `${page.path}: "${us}" (use ${uk}) in "...${ctx}..."`;
        if (AMBIGUOUS.has(us)) warnings.push(msg);
        else failures.push(msg);
      }
    }
  }

  report("Copy lint", failures, warnings);
}

main();
