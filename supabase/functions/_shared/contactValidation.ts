export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_PHONE_PATTERN = /^\+?[0-9()\s-]{5,30}$/;

export function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

export function normalizeContactEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 254 || !CONTACT_EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function isContactPhoneProvided(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function normalizeContactPhone(value: unknown): { phone: string | null; invalid: boolean } {
  if (!isContactPhoneProvided(value)) {
    return { phone: null, invalid: false };
  }

  if (typeof value !== "string") {
    return { phone: null, invalid: true };
  }

  const phone = value.trim();
  if (!CONTACT_PHONE_PATTERN.test(phone)) {
    return { phone: null, invalid: true };
  }

  return { phone, invalid: false };
}
