/** Edge bundle — logic mirrored in shared/contactValidation.ts (Zod). */
import { z } from "npm:zod@4.4.3";

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_PHONE_PATTERN = /^\+?[0-9()\s-]{5,30}$/;

const contactEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5)
  .max(254)
  .regex(CONTACT_EMAIL_PATTERN);

const contactPhoneSchema = z.string().trim().regex(CONTACT_PHONE_PATTERN);

function contactTextSchema(maxLength: number, minLength = 1) {
  return z.string().trim().min(minLength).max(maxLength);
}

export function normalizeContactText(
  value: unknown,
  maxLength: number,
  minLength = 1,
): string | null {
  const result = contactTextSchema(maxLength, minLength).safeParse(value);
  return result.success ? result.data : null;
}

export const normalizeText = normalizeContactText;

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
