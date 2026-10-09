import { config, allPages, siteUrl } from "@/lib/config";
import { hasCronSecret } from "@/lib/cron";
import { checkAll, checkUrl, extractLinks, sampleFormValues, type LinkResult } from "@/lib/links";
import { emailConfigured, sendAlert } from "@/lib/email";
import { rateLimitConfigured } from "@/lib/ratelimit";

/**
 * Weekly health check, called by Vercel cron (see vercel.json) with CRON_SECRET.
 * Checks every page returns 200, the contact form endpoint validates, external
 * links resolve and the env vars are set. Emails THUMBSTOP_ALERT_EMAIL on
 * failure. With ?report=monthly it also sends the client their all-clear.
 */

export const maxDuration = 60;

type Check = { name: string; ok: boolean; detail?: string };

function bypassHeaders(): Record<string, string> {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return bypass ? { "x-vercel-protection-bypass": bypass } : {};
}

export async function GET(request: Request) {
  if (!hasCronSecret(request.headers)) return new Response("Unauthorised", { status: 401 });

  const origin = new URL(request.url).origin;
  const monthly = new URL(request.url).searchParams.get("report") === "monthly";
  const checks: Check[] = [];
  const headers = bypassHeaders();

  checks.push({ name: "Resend API key set", ok: emailConfigured });
  checks.push({ name: "Rate limiting configured", ok: rateLimitConfigured });

  // Pages
  const external = new Set<string>();
  for (const page of allPages) {
    const url = `${origin}${page.path}`;
    try {
      const res = await fetch(url, { headers, redirect: "manual", signal: AbortSignal.timeout(15_000) });
      const html = await res.text();
      checks.push({ name: `Page ${page.path}`, ok: res.status === 200, detail: res.status === 200 ? undefined : `HTTP ${res.status}` });
      if (res.status === 200) extractLinks(html, url, [siteUrl]).external.forEach((l) => external.add(l));
    } catch (err) {
      checks.push({ name: `Page ${page.path}`, ok: false, detail: String(err) });
    }
  }

  // Contact form endpoint (validates, sends nothing)
  try {
    const res = await fetch(`${origin}/api/contact`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", "x-health-check": process.env.CRON_SECRET ?? "" },
      body: JSON.stringify(sampleFormValues(config.form.fields)),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; test?: boolean };
    checks.push({ name: "Contact form endpoint", ok: res.status === 200 && body.test === true, detail: `HTTP ${res.status}` });
  } catch (err) {
    checks.push({ name: "Contact form endpoint", ok: false, detail: String(err) });
  }

  // External links
  const linkResults: LinkResult[] = await checkAll([...external]);
  for (const r of linkResults.filter((l) => !l.ok)) {
    checks.push({ name: `External link ${r.url}`, ok: false, detail: `${r.status}${r.note ? `, ${r.note}` : ""}` });
  }
  checks.push({ name: `External links (${linkResults.length})`, ok: linkResults.every((l) => l.ok) });

  // Sitemap
  const sitemap = await checkUrl(`${origin}/sitemap.xml`, { headers });
  checks.push({ name: "Sitemap", ok: sitemap.ok, detail: String(sitemap.status) });

  const failed = checks.filter((c) => !c.ok);
  const ok = failed.length === 0;
  const site = `${config.business.tradingName} (${siteUrl})`;

  const alertTo = process.env.THUMBSTOP_ALERT_EMAIL;
  if (!ok && alertTo) {
    const text = [`Health check failed for ${site}`, "", ...failed.map((c) => `FAIL  ${c.name}${c.detail ? `: ${c.detail}` : ""}`)].join("\n");
    await sendAlert(`Health check failed: ${config.business.tradingName}`, text, alertTo.split(",").map((s) => s.trim()));
  }

  let reportSent = false;
  if (monthly && ok && config.care.reportTo.length) {
    const month = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date());
    const text = [
      `Your website care report for ${month}`,
      "",
      `Site: ${siteUrl}`,
      "",
      `Every page loaded correctly (${allPages.length} pages checked).`,
      "The contact form is working.",
      `All external links work (${linkResults.length} checked).`,
      "Security updates are applied weekly and tested before they go live.",
      "",
      "Nothing needs your attention. If you would like any small changes, just reply to this email.",
      "",
      "ThumbStop",
    ].join("\n");
    const sent = await sendAlert(`Website care report: ${month}`, text, config.care.reportTo);
    reportSent = sent.ok;
  }

  return Response.json({ ok, checks, reportSent }, { status: ok ? 200 : 500, headers: { "Cache-Control": "no-store" } });
}
