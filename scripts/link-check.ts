/**
 * Link check. Every internal link on every page must return 200 without a
 * redirect; every external link must resolve. --url <base>.
 */
import { checkAll, extractLinks } from "../lib/links";
import { allPages, baseUrl, pageUrl, report, requestHeaders, siteUrl } from "./lib";

async function main() {
  const base = baseUrl();
  const headers = requestHeaders();
  const failures: string[] = [];
  const warnings: string[] = [];
  const internal = new Map<string, string>();
  const external = new Map<string, string>();

  for (const page of allPages) {
    const url = pageUrl(base, page.path);
    const res = await fetch(url, { headers });
    if (res.status !== 200) {
      failures.push(`${page.path}: HTTP ${res.status}`);
      continue;
    }
    const links = extractLinks(await res.text(), url, [siteUrl]);
    links.internal.forEach((l) => internal.has(l) || internal.set(l, page.path));
    links.external.forEach((l) => external.has(l) || external.set(l, page.path));
  }

  for (const [path, from] of internal) {
    const res = await fetch(`${base}${path}`, { headers, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) failures.push(`${from}: links to ${path}, which redirects. Link to the final page`);
    else if (res.status !== 200) failures.push(`${from}: links to ${path}, which returns ${res.status}`);
  }

  for (const r of await checkAll([...external.keys()])) {
    if (r.skipped) warnings.push(`${r.url}: ${r.note}`);
    else if (!r.ok) failures.push(`${external.get(r.url)}: ${r.url} returned ${r.status}${r.note ? ` (${r.note})` : ""}`);
  }

  report(`Links (${internal.size} internal, ${external.size} external)`, failures, warnings);
}

main();
