import type { LegalDoc } from "@/lib/legal";

/** Placeholder. Restyled per client by /new-site. The words come from lib/legal.ts and the config. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 p-4">
      <h1>{doc.title}</h1>
      <p>Last updated {doc.updated}</p>
      <p>{doc.intro}</p>
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.list ? (
            <ul>
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
