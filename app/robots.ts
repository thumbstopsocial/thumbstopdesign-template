import type { MetadataRoute } from "next";
import { isProduction, siteUrl } from "@/lib/config";

/** Only the live production site is indexed. Previews block everything. */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
