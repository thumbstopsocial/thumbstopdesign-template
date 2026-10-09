import { z } from "zod";
import type { FormField } from "./config.schema";

export const HONEYPOT_FIELD = "company_website";
export const MIN_FILL_MS = 3000;
export const MAX_BODY_BYTES = 20_000;

const DEFAULT_MAX = { text: 200, email: 254, tel: 30, select: 200, textarea: 5000 } as const;

function fieldSchema(field: FormField) {
  const max = Math.min(field.maxLength ?? DEFAULT_MAX[field.type], DEFAULT_MAX.textarea);
  let schema = z
    .string({ error: `${field.label} is required` })
    .trim()
    .max(max, `${field.label} must be ${max} characters or fewer`);
  if (field.required) schema = schema.min(1, `${field.label} is required`);

  let checked: z.ZodType<string> = schema;
  if (field.type === "email") {
    checked = schema.refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address");
  } else if (field.type === "tel") {
    checked = schema.regex(/^[0-9 +()-]*$/, "Enter a valid phone number");
  } else if (field.type === "select") {
    const options = field.options ?? [];
    checked = schema.refine((v) => v === "" || options.includes(v), `Choose an option for ${field.label}`);
  }

  if (field.required) return checked;
  return checked.optional().transform((v) => (v ? v : undefined));
}

/** Server-side schema built from the config's form fields. Unknown keys are dropped. */
export function buildFormSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

/** What the client form needs. Safe to pass from a server component to a client one. */
export type PublicForm = {
  fields: FormField[];
  successMessage: string;
  honeypotField: string;
};
