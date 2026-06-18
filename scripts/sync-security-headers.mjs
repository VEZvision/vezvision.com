/**
 * Generates public/.htaccess and vercel.json from templates,
 * injecting the same CSP used by the Vite CSP nonce plugin.
 */
import fs from 'node:fs'
import path from 'node:path'

import { buildContentSecurityPolicy } from './csp-policy.mjs'

const root = path.resolve(import.meta.dirname, '..')
const csp = buildContentSecurityPolicy(null)

const htaccessTemplate = `<IfModule mod_headers.c>
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

  <FilesMatch "\\.(js|mjs|css|svg|png|jpg|jpeg|gif|webp|mp4|woff|woff2|html)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <FilesMatch "^index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header append Vary Accept-Encoding
  </FilesMatch>
</IfModule>

<IfModule mod_mime.c>
  AddType text/css .css
  AddType application/javascript .js .mjs
  AddType text/html .html
  AddType application/json .json
  AddType image/svg+xml .svg
  AddType image/webp .webp
  AddType video/webm .webm
  AddType video/mp4 .mp4
  AddType application/manifest+json .webmanifest
  AddType text/plain .txt
  AddType application/xml .xml
  AddEncoding br .br
  AddEncoding gzip .gz
</IfModule>

<FilesMatch "\\.js\\.br$">
  ForceType application/javascript
</FilesMatch>
<FilesMatch "\\.mjs\\.br$">
  ForceType application/javascript
</FilesMatch>
<FilesMatch "\\.css\\.br$">
  ForceType text/css
</FilesMatch>
<FilesMatch "\\.html\\.br$">
  ForceType text/html
</FilesMatch>
<FilesMatch "\\.json\\.br$">
  ForceType application/json
</FilesMatch>
<FilesMatch "\\.svg\\.br$">
  ForceType image/svg+xml
</FilesMatch>
<FilesMatch "\\.js\\.gz$">
  ForceType application/javascript
</FilesMatch>
<FilesMatch "\\.mjs\\.gz$">
  ForceType application/javascript
</FilesMatch>
<FilesMatch "\\.css\\.gz$">
  ForceType text/css
</FilesMatch>
<FilesMatch "\\.html\\.gz$">
  ForceType text/html
</FilesMatch>
<FilesMatch "\\.json\\.gz$">
  ForceType application/json
</FilesMatch>
<FilesMatch "\\.svg\\.gz$">
  ForceType image/svg+xml
</FilesMatch>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule . - [L]

  RewriteRule . /index.html [L]
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
