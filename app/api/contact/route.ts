import { config } from "@/lib/config";
import { buildFormSchema, HONEYPOT_FIELD, MAX_BODY_BYTES, MIN_FILL_MS } from "@/lib/form";
import { allowRequest, clientIp } from "@/lib/ratelimit";
import { sendAutoReply, sendEnquiry } from "@/lib/email";
import { hasCronSecret } from "@/lib/cron";

/**
 * Contact form endpoint. Validation, spam checks and rate limiting live here
 * and are the same on every site. The form's look is built per client.
 *
 * A request carrying CRON_SECRET (the health check) runs every check but
 * sends nothing and skips the rate limit.
 */

const schema = buildFormSchema(config.form.fields);

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const healthCheck = hasCronSecret(request.headers);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { ok: false, error: "invalid_body" });
  const data = body as Record<string, unknown>;

  // Honeypot filled in: a bot. Pretend it worked and send nothing.
  if (typeof data[HONEYPOT_FIELD] === "string" && data[HONEYPOT_FIELD] !== "") {
    return json(200, { ok: true });
  }

  // Submitted faster than a person could fill it in.
  if (!healthCheck && (typeof data._t !== "number" || data._t < MIN_FILL_MS)) {
    return json(400, { ok: false, error: "too_fast" });
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return json(400, { ok: false, error: "validation", fieldErrors });
  }

  if (healthCheck) return json(200, { ok: true, test: true });

  if (!(await allowRequest(clientIp(request.headers)))) {
    return json(429, { ok: false, error: "rate_limited" });
  }

  const values = parsed.data as Record<string, string | undefined>;
  const sent = await sendEnquiry(config.form.fields, values);
  if (!sent.ok) {
    console.error("Contact form email failed:", sent.error);
    return json(502, { ok: false, error: "send_failed" });
  }

  if (config.form.autoReply && values.email) {
    const reply = await sendAutoReply(values.email);
    if (!reply.ok) console.error("Auto-reply failed:", reply.error);
  }

  return json(200, { ok: true, ...(sent.id ? { id: sent.id } : {}) });
}
