import Link from "next/link";
import { navPages } from "@/lib/config";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Restyled per client by /new-site. The links always come from the config. */
export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl space-y-4 p-4">
      <h1>Page not found</h1>
      <p>The page you were looking for has moved or no longer exists. Try one of these instead.</p>
      <ul>
        {navPages.map((p) => (
          <li key={p.path}>
            <a href={p.path} className="inline-block py-2 underline">{p.navLabel}</a>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/" className="inline-block py-2 underline">Back to the home page</Link>
      </p>
    </section>
  );
}
