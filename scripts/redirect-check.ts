/**
 * Requests every old path in the config's redirects and confirms it lands on
 * its new page with a permanent redirect. Run on the preview in CI and on the
 * live domain at go-live: --url <base>.
 */
import { baseUrl, config, report, requestHeaders } from "./lib";

async function main() {
  const base = baseUrl();
  const failures: string[] = [];
  for (const r of config.redirects) {
    const res = await fetch(`${base}${r.from}`, { redirect: "manual", headers: requestHeaders() });
    const expected = r.permanent ? 308 : 307;
    const location = res.headers.get("location");
    const landed = location ? new URL(location, base).pathname : null;
    if (res.status !== expected && !(r.permanent && res.status === 301)) {
      failures.push(`${r.from}: expected ${expected}, got ${res.status}`);
      continue;
    }
    if (landed !== r.to.split(/[?#]/)[0]) {
      failures.push(`${r.from}: redirects to ${landed}, expected ${r.to}`);
      continue;
    }
    const target = await fetch(new URL(location!, base), { headers: requestHeaders() });
    if (target.status !== 200) failures.push(`${r.from} -> ${r.to}: target returned ${target.status}`);
  }
  if (!config.redirects.length) console.log("  no redirects in the config");
  report(`Redirects (${config.redirects.length})`, failures);
}

main();
