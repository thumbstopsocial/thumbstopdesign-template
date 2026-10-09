import type { Metadata, Viewport } from "next";
import "./globals.css";
import { config, siteUrl } from "@/lib/config";
import { jsonLdString, organisationJsonLd } from "@/lib/seo";
import { AnalyticsHead, AnalyticsNoScript } from "@/components/system/Analytics";
import { fontClassName } from "@/components/site/fonts";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ConsentBanner } from "@/components/site/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: config.business.tradingName,
  applicationName: config.business.tradingName,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const gtmId = config.analytics.gtmId;
  return (
    <html lang="en-GB" className={fontClassName}>
      <head>
        <AnalyticsHead gtmId={gtmId} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(organisationJsonLd()) }} />
      </head>
      <body>
        <AnalyticsNoScript gtmId={gtmId} />
        <a href="#main" className="absolute -left-[9999px] top-2 z-50 p-3 focus:left-2">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
