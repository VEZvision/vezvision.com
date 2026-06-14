/**
 * Generates public/.htaccess and vercel.json from templates,
 * injecting the same CSP used by the Vite CSP nonce plugin.
 */
import fs from 'node:fs'
import path from 'node:path'

import { buildContentSecurityPolicy } from './csp-policy.mjs'

const root = path.resolve(import.meta.dirname, '..')
const csp = buildContentSecurityPolicy(null)

const htaccessTemplate = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve pre-compressed .br or .gz assets when the browser accepts them.
  RewriteCond %{HTTP:Accept-Encoding} br
  RewriteCond %{REQUEST_FILENAME}.br -f
  RewriteRule ^(.*)$ $1.br [L]

  RewriteCond %{HTTP:Accept-Encoding} gzip
  RewriteCond %{REQUEST_FILENAME}.gz -f
  RewriteRule ^(.*)$ $1.gz [L]

  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule . - [L]

  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.br$">
    Header set Content-Encoding br
    Header append Vary Accept-Encoding
  </FilesMatch>

  <FilesMatch "\\.gz$">
    Header set Content-Encoding gzip
    Header append Vary Accept-Encoding
  </FilesMatch>
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "${csp}"

  <FilesMatch "\\.(js|mjs|css|svg|png|jpg|jpeg|gif|webp|mp4|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <FilesMatch "^index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>

  <FilesMatch "\\.map$">
    Header set X-Robots-Tag "noindex, nofollow, noarchive"
    Header set Cache-Control "no-store"
  </FilesMatch>
</IfModule>

<FilesMatch "\\.map$">
  Require all denied
</FilesMatch>
`

fs.writeFileSync(path.join(root, 'public', '.htaccess'), htaccessTemplate, 'utf8')
console.log('Generated public/.htaccess')

const vercelConfig = {
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: csp },
      ],
    },
    {
      source: '/assets/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/(.*\\.(js|css|woff2|webp|png|jpg|jpeg|gif|svg|ico))',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
}

fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8')
console.log('Generated vercel.json')
