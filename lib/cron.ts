import { timingSafeEqual } from "node:crypto";

/** True when the request carries the CRON_SECRET, as Vercel cron sends it. */
export function hasCronSecret(headers: Headers): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = headers.get("authorization") ?? "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : (headers.get("x-health-check") ?? "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
