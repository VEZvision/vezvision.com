/** Frontend site key — must be paired with TURNSTILE_SECRET_KEY on edge functions. */
export function isTurnstileEnabled(): boolean {
  return Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim());
}

export function getTurnstileSiteKey(): string {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
}
