import type { NextConfig } from "next";
import raw from "./client.config";
import { clientConfigSchema } from "./lib/config.schema";

/**
 * Security headers and redirects. Same on every site. Extra CSP sources for a
 * client's embeds (booking widgets, video, maps) go in client.config.ts under
 * csp, never in this file.
 */

const config = clientConfigSchema.parse(raw);
const isDev = process.env.NODE_ENV === "development";
const isProduction = process.env.VERCEL_ENV === "production";

const google = {
  script: ["https://www.googletagmanager.com", "https://*.googletagmanager.com"],
  img: [
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://*.g.doubleclick.net",
    "https://*.google.com",
    "https://*.google.co.uk",
  ],
  connect: [
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.g.doubleclick.net",
    "https://*.google.com",
    "https://*.google.co.uk",
  ],
  frame: ["https://www.googletagmanager.com", "https://td.doubleclick.net"],
};

function csp(): string {
  const extra = (d: keyof typeof config.csp) => config.csp[d] ?? [];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...google.script, ...extra("script-src")],
    "style-src": ["'self'", "'unsafe-inline'", ...extra("style-src")],
    "img-src": ["'self'", "data:", "blob:", ...google.img, ...extra("img-src")],
    "font-src": ["'self'", "data:", ...extra("font-src")],
    "connect-src": ["'self'", ...google.connect, ...extra("connect-src")],
    "frame-src": [...google.frame, ...extra("frame-src")],
    "media-src": ["'self'", ...extra("media-src")],
    "form-action": ["'self'", ...extra("form-action")],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp() },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
  async redirects() {
    return config.redirects.map((r) => ({ source: r.from, destination: r.to, permanent: r.permanent }));
  },
};

export default nextConfig;
