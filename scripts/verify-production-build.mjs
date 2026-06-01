import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const indexPath = path.join(distDir, 'index.html')
const htaccessPath = path.join(distDir, '.htaccess')

const errors = []

if (!fs.existsSync(indexPath)) {
  errors.push('dist/index.html is missing — run vite build first')
} else {
  const indexHtml = fs.readFileSync(indexPath, 'utf8')

  if (indexHtml.includes('%LANG%')) {
    errors.push('dist/index.html still contains unresolved %LANG% placeholder')
  }

  if (!/<html[^>]*\slang="[a-z]{2}"/i.test(indexHtml)) {
    errors.push('dist/index.html must declare a valid html lang attribute')
  }
}

if (!fs.existsSync(htaccessPath)) {
  errors.push('dist/.htaccess is missing — Hostido SPA routing and CSP will not work')
} else {
  const htaccess = fs.readFileSync(htaccessPath, 'utf8')
  if (!htaccess.includes('RewriteRule . /index.html')) {
    errors.push('dist/.htaccess is missing SPA fallback rewrite')
  }
  if (!htaccess.includes('google-analytics.com')) {
    errors.push('dist/.htaccess CSP must allow Google Analytics connect-src')
  }
}

if (errors.length > 0) {
  console.error('Production build verification failed:\n')
  for (const message of errors) {
    console.error(`- ${message}`)
  }
  process.exit(1)
}

console.log('Production build verification passed.')
