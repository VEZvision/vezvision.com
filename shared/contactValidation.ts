/** Shared contact validation — used by Vite app and Supabase edge functions. */

import {
  CONTACT_EMAIL_PATTERN,
  CONTACT_PHONE_PATTERN,
  contactEmailSchema,
  contactPhoneSchema,
  contactTextSchema,
} from "./contactSchema";

export { CONTACT_EMAIL_PATTERN, CONTACT_PHONE_PATTERN };

export function normalizeContactText(
  value: unknown,
  maxLength: number,
  minLength = 1,
): string | null {
  const result = contactTextSchema(maxLength, minLength).safeParse(value);
  return result.success ? result.data : null;
}

export function normalizeContactEmail(value: unknown): string | null {
  const result = contactEmailSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function isContactPhoneProvided(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function normalizeContactPhone(value: unknown): {
  phone: string | null;
  invalid: boolean;
} {
  if (!isContactPhoneProvided(value)) {
    return { phone: null, invalid: false };
  }

  if (typeof value !== "string") {
    return { phone: null, invalid: true };
  }

  const result = contactPhoneSchema.safeParse(value);
  if (!result.success) {
    return { phone: null, invalid: true };
  }

  return { phone: result.data, invalid: false };
}

export function formatTelHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}
