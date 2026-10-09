import { Resend } from "resend";
import { config } from "./config";
import type { FormField } from "./config.schema";

/**
 * All mail goes through Resend from website@<client domain>. On previews, set
 * RESEND_TEST_RECIPIENT (e.g. delivered@resend.dev) so test submissions never
 * reach the client.
 */

const apiKey = process.env.RESEND_API_KEY;
export const emailConfigured = Boolean(apiKey && apiKey !== "re_dummy");

const resend = new Resend(apiKey || "re_dummy");

export const fromAddress = `${config.business.tradingName} website <website@${config.domain.apex}>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type SendResult = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string };

async function send(args: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!emailConfigured) {
    if (process.env.VERCEL_ENV === "production") return { ok: false, error: "RESEND_API_KEY is not set" };
    console.info(`[email skipped, no Resend key] ${args.subject} -> ${args.to.join(", ")}`);
    return { ok: true, skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: fromAddress, ...args });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export function enquiryRecipients(): string[] {
  const test = process.env.RESEND_TEST_RECIPIENT;
  return test ? [test] : config.form.recipients;
}

export async function sendEnquiry(fields: FormField[], values: Record<string, string | undefined>): Promise<SendResult> {
  const rows = fields
    .filter((f) => values[f.name])
    .map((f) => ({ label: f.label, value: values[f.name] as string }));
  const who = values.name || values.email || "the website";
  const text = rows.map((r) => `${r.label}:\n${r.value}`).join("\n\n");
  const html = `<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(
      (r) =>
        `<tr><td style="vertical-align:top;font-weight:bold">${escapeHtml(r.label)}</td><td style="white-space:pre-wrap">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("")}</table>`;
  return send({
    to: enquiryRecipients(),
    subject: `New enquiry from ${who}`.slice(0, 150),
    text,
    html,
    replyTo: values.email,
  });
}

export async function sendAutoReply(to: string): Promise<SendResult> {
  const name = config.business.tradingName;
  const text = `Thanks for contacting ${name}.\n\n${config.form.successMessage}\n\n${name}`;
  return send({
    to: [process.env.RESEND_TEST_RECIPIENT || to],
    subject: `Thanks for contacting ${name}`,
    text,
    html: `<p>${escapeHtml(`Thanks for contacting ${name}.`)}</p><p>${escapeHtml(config.form.successMessage)}</p><p>${escapeHtml(name)}</p>`,
  });
}

export async function sendAlert(subject: string, text: string, to: string[]): Promise<SendResult> {
  return send({ to, subject, text, html: `<pre style="font-family:monospace">${escapeHtml(text)}</pre>` });
}
