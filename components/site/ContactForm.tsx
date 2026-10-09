"use client";

import type { PublicForm } from "@/lib/form";
import { useContactForm } from "@/components/system/useContactForm";

/**
 * Placeholder. Restyled per client from the deck by /new-site.
 * Fields, validation and sending come from useContactForm and the config.
 * Keep the honeypot, the name attributes and the status messages.
 */
export function ContactForm({ form }: { form: PublicForm }) {
  const { status, error, fieldErrors, fields, successMessage, formProps, honeypot } = useContactForm(form);

  if (status === "success") {
    return (
      <p role="status" data-testid="form-success">
        {successMessage}
      </p>
    );
  }

  return (
    <form {...formProps} data-testid="contact-form" className="space-y-4">
      {fields.map((f) => {
        const id = `field-${f.name}`;
        const errorId = `${id}-error`;
        const common = {
          id,
          name: f.name,
          required: f.required,
          maxLength: f.maxLength,
          "aria-invalid": fieldErrors[f.name] ? true : undefined,
          "aria-describedby": fieldErrors[f.name] ? errorId : undefined,
        };
        return (
          <div key={f.name} className="flex flex-col gap-1">
            <label htmlFor={id}>
              {f.label}
              {f.required ? " (required)" : ""}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={6} className="border p-2" />
            ) : f.type === "select" ? (
              <select {...common} defaultValue="" className="border p-2">
                <option value="" disabled>
                  Choose one
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input {...common} className="border p-2" type={f.type} autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.name === "name" ? "name" : undefined} />
            )}
            {fieldErrors[f.name] ? <p id={errorId}>{fieldErrors[f.name]}</p> : null}
          </div>
        );
      })}
      <div {...honeypot.wrapperProps}>
        <label htmlFor="hp-field">Leave this blank</label>
        <input id="hp-field" {...honeypot.inputProps} />
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" className="border px-4 py-2" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
