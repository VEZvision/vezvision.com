import fs from 'node:fs'
import path from 'node:path'

// Some static Apache/LiteSpeed hosts normalize URLs that point to directories
// (e.g. `/en` → 301 `/en/`) and then tries to find an index file inside
// that directory. When no `index.html` is present and directory listing is
// disabled, LiteSpeed returns 403 — even if mod_rewrite rules normally
// fall back to the SPA `/index.html`. Spidering through the subdir tree
// created by Vite for static assets (e.g. `public/<locale>/blog/feed.xml`)
// is the only reliable fix: copy the Vite-emitted `dist/index.html` into
// each locale subtree so Apache/LiteSpeed has an index file to serve and
// the SPA can take over client-side routing once hydrated.
//
// Fill-only: if `prerender-head.ts` already produced a richer pre-rendered
// `index.html` (Chromium available in CI), we keep it untouched.
const distDir = path.resolve('dist')
const sourceIndex = path.join(distDir, 'index.html')

if (!fs.existsSync(sourceIndex)) {
  console.error(
    '[copy-spa-index] dist/index.html not found — run vite build first',
  )
  process.exit(1)
}

const localeDirs = ['en', 'pl']
let copied = 0
let skipped = 0

const walk = (dir) => {
  const targetIndex = path.join(dir, 'index.html')
  if (fs.existsSync(targetIndex)) {
    skipped++
  } else {
    fs.copyFileSync(sourceIndex, targetIndex)
    copied++
  }

  for (const entry of fs.readdirSync(dir)) {
    if (entry.startsWith('.')) continue
    const entryPath = path.join(dir, entry)
    if (fs.statSync(entryPath).isDirectory()) walk(entryPath)
  }
}

for (const locale of localeDirs) {
  const localeDir = path.join(distDir, locale)
  if (!fs.existsSync(localeDir)) {
    console.warn(`[copy-spa-index] dist/${locale}/ missing — skipping locale`)
    continue
  }
  walk(localeDir)
}

// Nginx serves this document with a genuine 404 status for unknown URLs.
// Prefer the Polish prerendered error page so crawlers receive noindex metadata
// even when the original request does not identify a supported locale.
const prerenderedNotFound = path.join(distDir, 'pl', '404', 'index.html')
fs.copyFileSync(
  fs.existsSync(prerenderedNotFound) ? prerenderedNotFound : sourceIndex,
  path.join(distDir, '404.html'),
)

console.log(
  `[copy-spa-index] Copied ${copied} index.html file(s), skipped ${skipped} already-present; generated 404.html`,
)
