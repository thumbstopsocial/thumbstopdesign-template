import type { MetadataRoute } from "next";
import { allPages, siteUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages.map((p) => ({
    url: `${siteUrl}${p.path === "/" ? "" : p.path}`,
    changeFrequency: "monthly",
    priority: p.path === "/" ? 1 : p.inNav ? 0.8 : 0.3,
  }));
}
