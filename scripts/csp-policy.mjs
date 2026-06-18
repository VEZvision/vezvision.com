/** Single source of truth for CSP — synced to index.html meta (build) and security verify scripts. */

function getSupabaseHost() {
  const url = process.env.VITE_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable for CSP generation')
  }
  try {
    return new URL(url).origin
  } catch {
    throw new Error(`Invalid VITE_SUPABASE_URL: ${url}`)
  }
}

function getSupabaseRealtimeHost(supabaseHost) {
  return supabaseHost.replace(/^https:/, 'wss:')
}

/**
 * @param {string | null | undefined} nonce Build-time nonce for inline JSON-LD (Helmet). Dev omits nonce.
 * @param {string} [supabaseHost] Optional override for Supabase origin.
 */
export function buildContentSecurityPolicy(nonce, supabaseHost) {
  const host = supabaseHost || getSupabaseHost()
  const realtimeHost = getSupabaseRealtimeHost(host)

  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' https://www.googletagmanager.com https://challenges.cloudflare.com`
    : `'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com`

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "object-src 'none'",
    `connect-src 'self' ${host} ${realtimeHost} https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.sentry.io https://challenges.cloudflare.com`,
    'frame-src https://challenges.cloudflare.com',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

