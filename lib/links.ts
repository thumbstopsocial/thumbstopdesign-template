/**
 * Link extraction and checking. Shared by the health check (/api/health) and
 * the CI link check (scripts/link-check.ts), so both judge links the same way.
 */

export type LinkResult = { url: string; status: number | "error"; ok: boolean; skipped?: boolean; note?: string };

/** Sites that block automated checks. A 999, 401, 403 or 429 from these is not a failure. */
const BOT_HOSTILE = /(^|\.)(linkedin\.com|instagram\.com|facebook\.com|x\.com|twitter\.com|tiktok\.com)$/;

/**
 * selfOrigins: other origins that count as this site, e.g. the production URL
 * used in canonical tags when checking a preview or localhost.
 */
export function extractLinks(
  html: string,
  pageUrl: string,
  selfOrigins: string[] = [],
): { internal: string[]; external: string[] } {
  const internal = new Set<string>();
  const external = new Set<string>();
  const base = new URL(pageUrl);
  const self = new Set([base.origin, ...selfOrigins.map((o) => new URL(o).origin)]);
  const attr = /\s(?:href|src)=["']([^"'#]+)(?:#[^"']*)?["']/gi;
  for (const match of html.matchAll(attr)) {
    const raw = match[1].trim().replace(/&amp;/g, "&");
    if (!raw || /^(mailto:|tel:|data:|javascript:|blob:)/i.test(raw)) continue;
    let url: URL;
    try {
      url = new URL(raw, base);
    } catch {
      continue;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    if (self.has(url.origin)) {
      // Framework assets are checked by the build itself.
      if (url.pathname.startsWith("/_next/")) continue;
      internal.add(url.pathname + url.search);
    } else {
      // GTM and fonts load fine at runtime but refuse bare requests.
      if (/googletagmanager\.com|google-analytics\.com|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) continue;
      external.add(url.toString());
    }
  }
  return { internal: [...internal], external: [...external] };
}

export async function checkUrl(url: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<LinkResult> {
  const attempt = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, {
      ...init,
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "ThumbStop-LinkCheck/1.0 (+site health)", ...(init.headers ?? {}) },
    });
    await res.body?.cancel().catch(() => {});
    return res.status;
  };
  try {
    let status = await attempt("HEAD");
    if (status === 405 || status === 404 || status === 403 || status >= 500) status = await attempt("GET");
    const host = new URL(url).hostname;
    if ([401, 403, 429, 999].includes(status) && BOT_HOSTILE.test(host)) {
      return { url, status, ok: true, skipped: true, note: "site blocks automated checks" };
    }
    return { url, status, ok: status < 400 };
  } catch (err) {
    return { url, status: "error", ok: false, note: err instanceof Error ? err.message : String(err) };
  }
}

/** Runs checks with limited concurrency. */
export async function checkAll(urls: string[], init: RequestInit = {}, concurrency = 6): Promise<LinkResult[]> {
  const results: LinkResult[] = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      results.push(await checkUrl(url, init));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

/** Sample values that pass the form schema, for health checks and tests. */
export function sampleFormValues(fields: { name: string; type: string; options?: string[] }[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) {
    values[f.name] =
      f.type === "email"
        ? "delivered@resend.dev"
        : f.type === "tel"
          ? "01234 567890"
          : f.type === "select"
            ? (f.options?.[0] ?? "")
            : "ThumbStop automated check";
  }
  return values;
}
