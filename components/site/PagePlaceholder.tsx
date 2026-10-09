import { getPage } from "@/lib/config";

/** Template only. /new-site replaces every use of this with the page built from the deck. */
export function PagePlaceholder({ path, children }: { path: string; children?: React.ReactNode }) {
  const page = getPage(path);
  return (
    <section className="mx-auto max-w-2xl space-y-4 p-4">
      <h1>{page?.navLabel ?? path}</h1>
      <p>{page?.description}</p>
      {children}
    </section>
  );
}
