/** Single source of truth for CSP — synced to index.html meta (build) and security verify scripts. */

function getApiHost() {
  const url = process.env.VITE_API_URL?.trim()
  if (!url) {
    throw new Error('Missing VITE_API_URL environment variable for CSP generation')
  }
  try {
    return new URL(url).origin
  } catch {
    throw new Error(`Invalid VITE_API_URL: ${url}`)
  }
}

/**
 * @param {string} [apiHost] Optional override for the API origin.
 */
export function buildContentSecurityPolicy(apiHost) {
  const host = apiHost || getApiHost()

  const scriptSrc = `'self' https://www.googletagmanager.com https://challenges.cloudflare.com`

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "object-src 'none'",
    `connect-src 'self' ${host} https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.sentry.io https://challenges.cloudflare.com`,
    'frame-src https://challenges.cloudflare.com',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "require-trusted-types-for 'script'",
    "trusted-types default dompurify react-helmet",
  ].join('; ')
}
