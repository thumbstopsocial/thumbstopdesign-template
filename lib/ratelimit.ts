import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "./config";

/**
 * One shared Upstash database for every ThumbStop site. Keys are prefixed by
 * the site slug, and IPs are hashed so no raw IP is stored.
 */

const configured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const limiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: `ts:${config.slug}:contact`,
      analytics: false,
    })
  : null;

export const rateLimitConfigured = configured;

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(`${config.slug}:${ip}`).digest("hex").slice(0, 32);
}

/** Returns true when the request may go ahead. Allows everything when Upstash isn't configured. */
export async function allowRequest(ip: string): Promise<boolean> {
  if (!limiter) {
    if (process.env.VERCEL_ENV === "production") console.error("Rate limiting is not configured: set the Upstash env vars");
    return true;
  }
  const { success } = await limiter.limit(hashIp(ip));
  return success;
}
