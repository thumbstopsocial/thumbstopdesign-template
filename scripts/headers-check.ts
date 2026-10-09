/** Confirms every security header is served on every page: --url <base>. */
import { allPages, baseUrl, pageUrl, report, requestHeaders } from "./lib";

const REQUIRED: Record<string, (v: string) => boolean> = {
  "content-security-policy": (v) => v.includes("default-src 'self'") && v.includes("frame-ancestors 'none'") && v.includes("object-src 'none'"),
  "strict-transport-security": (v) => /max-age=\d{8,}/.test(v),
  "x-frame-options": (v) => v.toUpperCase() === "DENY",
  "x-content-type-options": (v) => v === "nosniff",
  "referrer-policy": (v) => v.length > 0,
  "permissions-policy": (v) => v.includes("camera=()"),
};

async function main() {
  const base = baseUrl();
  const failures: string[] = [];
  const paths = [...allPages.map((p) => p.path), "/api/contact"];
  for (const path of paths) {
    const res = await fetch(pageUrl(base, path), { method: path.startsWith("/api") ? "OPTIONS" : "GET", headers: requestHeaders() });
    for (const [name, valid] of Object.entries(REQUIRED)) {
      const value = res.headers.get(name);
      if (!value) failures.push(`${path}: ${name} missing`);
      else if (!valid(value)) failures.push(`${path}: ${name} looks wrong: ${value}`);
    }
    if (res.headers.get("x-powered-by")) failures.push(`${path}: x-powered-by should not be sent`);
  }
  report("Security headers", failures);
}

main();
