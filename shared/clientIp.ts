/** Canonical client IP helper — keep in sync with supabase/functions/_shared/clientIp.ts for edge deploys. */
const IP_PATTERN = /^[\d.a-fA-F:]+$/;

function isValidIp(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 45 && IP_PATTERN.test(trimmed);
}

/**
 * Trust only platform-set headers (Cloudflare / CDN).
 * Do not trust client-spoofable x-real-ip or x-forwarded-for.
 */
export function getClientIpFromHeaders(headers: Pick<Headers, 'get'>): string {
  const trustedHeaders = ['cf-connecting-ip', 'true-client-ip'] as const;

  for (const header of trustedHeaders) {
    const value = headers.get(header);
    if (value && isValidIp(value)) {
      return value.trim().slice(0, 45);
    }
  }

  return 'unknown';
}
