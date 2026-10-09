"use client";

import Link from "next/link";
import { useConsent } from "@/components/system/consent";

/**
 * Placeholder. Restyled per client from the deck by /new-site.
 * Rules: position fixed (no layout shift), Accept and Reject given equal
 * weight (same size, style and prominence), link to /privacy.
 */
export function ConsentBanner() {
  const { visible, accept, reject } = useConsent();
  if (!visible) return null;
  return (
    <div role="region" aria-label="Cookie consent" style={{ position: "fixed", insetInline: 0, bottom: 0, background: "#fff", color: "#111", padding: "1rem", borderTop: "1px solid #111" }}>
      <p>
        We use cookies to understand how the site is used. Choose whether to allow them. See our{" "}
        <Link href="/privacy">privacy notice</Link>.
      </p>
      <button type="button" onClick={accept} style={{ padding: "0.5rem 1rem", border: "1px solid #111" }}>
        Accept
      </button>{" "}
      <button type="button" onClick={reject} style={{ padding: "0.5rem 1rem", border: "1px solid #111" }}>
        Reject
      </button>
    </div>
  );
}
