import type { Metadata } from "next";
import type { PageConfig } from "./config.schema";
import { config, isProduction, siteUrl } from "./config";

export function pageMetadata(page: PageConfig): Metadata {
  const url = `${siteUrl}${page.path === "/" ? "" : page.path}`;
  return {
    title: { absolute: page.seoTitle },
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.seoTitle,
      description: page.description,
      url,
      siteName: config.business.tradingName,
      locale: "en_GB",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.description },
    robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export function organisationJsonLd() {
  const b = config.business;
  const sameAs = Object.values(config.socials);
  return {
    "@context": "https://schema.org",
    "@type": config.seo.schemaType,
    name: b.tradingName,
    legalName: b.legalName,
    url: siteUrl,
    email: b.email,
    ...(b.phone ? { telephone: b.phone } : {}),
    address: { "@type": "PostalAddress", streetAddress: b.registeredAddress, addressCountry: "GB" },
    logo: `${siteUrl}/icon`,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Safe for embedding inside a script tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
