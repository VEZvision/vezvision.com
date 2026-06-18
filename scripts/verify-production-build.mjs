import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const indexPath = path.join(distDir, 'index.html')
const htaccessPath = path.join(distDir, '.htaccess')
const assetsDir = path.join(distDir, 'assets')
const isE2EBuild = process.env.E2E_BUILD === '1'

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

  if (indexHtml.includes('__e2e__/error')) {
    errors.push('production build must not include E2E probe routes')
  }
}

if (!fs.existsSync(htaccessPath)) {
  errors.push('dist/.htaccess is missing — Hostido SPA routing will not work')
} else {
  const htaccess = fs.readFileSync(htaccessPath, 'utf8')
  if (!htaccess.includes('RewriteRule . /index.html')) {
    errors.push('dist/.htaccess is missing SPA fallback rewrite')
  }
  if (!htaccess.includes('Content-Security-Policy') || !htaccess.includes("frame-ancestors 'none'")) {
    errors.push('dist/.htaccess must include CSP frame-ancestors defense')
  }
  if (!htaccess.includes('Require all denied') || !htaccess.includes('\\.map$')) {
    errors.push('dist/.htaccess must deny public source map access')
  }
}

if (fs.existsSync(assetsDir)) {
  const assetNames = fs.readdirSync(assetsDir)
  const sourceMaps = assetNames.filter((name) => name.endsWith('.map'))
  if (sourceMaps.length > 0) {
    errors.push(`dist/assets must not include public source maps (${sourceMaps.length} found)`)
  }

  if (!isE2EBuild) {
    const e2eAssets = assetNames.filter((name) => /E2eErrorTrigger|__e2e__/i.test(name))
    if (e2eAssets.length > 0) {
      errors.push(`production build must not include E2E probe assets: ${e2eAssets.join(', ')}`)
    }
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
