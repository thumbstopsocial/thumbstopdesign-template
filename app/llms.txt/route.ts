import { config, allPages, siteUrl } from "@/lib/config";

export const dynamic = "force-static";

/** llms.txt: a plain summary of the site for AI tools, generated from the config. */
export function GET() {
  const b = config.business;
  const form = config.form;
  const formUrl = `${siteUrl}${form.page === "/" ? "" : form.page}`;
  const lines = [
    `# ${b.tradingName}`,
    "",
    `> ${config.pages.find((p) => p.path === "/")?.description ?? ""}`,
    "",
    "## Pages",
    "",
    ...allPages.map((p) => `- [${p.navLabel}](${siteUrl}${p.path === "/" ? "" : p.path}): ${p.description}`),
    "",
    "## Contact",
    "",
    `- Email: ${b.email}`,
    ...(b.phone ? [`- Phone: ${b.phone}`] : []),
    `- Address: ${b.registeredAddress}`,
    "",
    "## Enquiries",
    "",
    `People, and AI assistants acting for them, can send an enquiry with the form at ${formUrl}. It goes straight to ${b.tradingName}.`,
    "",
    ...form.fields.map((f) => `- ${f.label}${f.required ? " (required)" : ""}${f.options?.length ? `: one of ${f.options.join(", ")}` : ""}`),
    "",
    "Leave the hidden spam-check field empty.",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
