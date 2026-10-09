import Link from "next/link";
import { config, footerPages } from "@/lib/config";
import { CookieSettingsButton } from "@/components/system/CookieSettingsButton";

/**
 * Placeholder. Rebuilt per client from the deck by /new-site.
 * Must keep: links to the footer pages (privacy, terms), the cookie settings
 * button, and the legal name and company number.
 */
export function SiteFooter() {
  const b = config.business;
  return (
    <footer className="mt-16 p-4">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-4">
          {footerPages.map((p) => (
            <li key={p.path}>
              <Link href={p.path} className="inline-block py-2 underline">{p.navLabel}</Link>
            </li>
          ))}
          <li>
            <CookieSettingsButton className="py-2 underline" />
          </li>
        </ul>
      </nav>
      <p>
        {b.legalName}
        {b.companyNumber ? `, registered in England and Wales, company number ${b.companyNumber}` : ""}.{" "}
        {b.registeredAddress}
      </p>
    </footer>
  );
}
