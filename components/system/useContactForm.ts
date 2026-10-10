"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { PublicForm } from "@/lib/form";

/**
 * Contact form behaviour, unstyled. The per-client form in components/site
 * renders the fields however the deck says, and wires in what this returns.
 * Do not restyle or rewrite this file per client.
 */

export type ContactFormStatus = "idle" | "sending" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  too_fast: "That was quick. Please check your details and send again.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again, or email us directly.",
  send_failed: "Your message could not be sent. Please try again or email us directly.",
  validation: "Please check the highlighted fields.",
};

const hiddenStyle: CSSProperties = {
  position: "absolute",
  left: "-10000px",
  width: 1,
  height: 1,
  overflow: "hidden",
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function useContactForm(form: PublicForm) {
  const startedAt = useRef(0);
  const [status, setStatus] = useState<ContactFormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const el = event.currentTarget;
    const values = Object.fromEntries(new FormData(el).entries());
    setStatus("sending");
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, _t: Date.now() - startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        el.reset();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "form_submit", form_name: "contact" });
        return;
      }
      setFieldErrors(data.fieldErrors ?? {});
      setError(ERROR_MESSAGES[data.error ?? ""] ?? ERROR_MESSAGES.send_failed);
      setStatus("error");
    } catch {
      setError(ERROR_MESSAGES.send_failed);
      setStatus("error");
    }
  }

  return {
    status,
    error,
    fieldErrors,
    fields: form.fields,
    successMessage: form.successMessage,
    formProps: { onSubmit, "aria-busy": status === "sending" },
    /**
     * Render inside the form, with the label. Hidden from people and screen
     * readers; spam bots fill it in. The label tells AI agents filling the form
     * for a real person to leave it alone, so their enquiry isn't silently dropped.
     */
    honeypot: {
      label: "Leave this blank. It's a spam check, not part of your enquiry.",
      wrapperProps: { style: hiddenStyle, "aria-hidden": true as const },
      inputProps: { name: form.honeypotField, type: "text", tabIndex: -1, autoComplete: "off", defaultValue: "" },
    },
  };
}
