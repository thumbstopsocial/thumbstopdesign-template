import Link from "next/link";
import { config, navPages } from "@/lib/config";

/** Placeholder. Rebuilt per client from the deck by /new-site. Nav items always come from the config. */
export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4">
      <Link href="/" className="inline-block py-2 font-bold">{config.business.tradingName}</Link>
      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-4">
          {navPages.map((p) => (
            <li key={p.path}>
              <Link href={p.path} className="inline-block py-2">{p.navLabel}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
