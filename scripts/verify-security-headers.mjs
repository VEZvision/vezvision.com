import fs from 'node:fs'
import path from 'node:path'

import { buildContentSecurityPolicy } from './csp-policy.mjs'

const root = path.resolve(import.meta.dirname, '..')
const errors = []

const expectedCsp = buildContentSecurityPolicy(null)
const requiredCspDirectives = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]

function assertFileExists(filePath, label) {
  const absolutePath = path.join(root, filePath)
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label} is missing at ${filePath}`)
    return false
  }
  return true
}

function extractCsp(content, label) {
  if (label === 'vercel.json') {
    try {
      const config = JSON.parse(content)
      const header = config.headers
        ?.find((h) => h.source === '/(.*)')
        ?.headers?.find((h) => h.key === 'Content-Security-Policy')
      return header?.value ?? null
    } catch {
      errors.push(`${label} is not valid JSON`)
      return null
    }
  }
  const cspMatch = content.match(/Content-Security-Policy\s+"([^"]+)"/i)
  return cspMatch?.[1] ?? null
}

function verifyCsp(content, label) {
  const csp = extractCsp(content, label)
  if (!csp) {
    errors.push(`${label} is missing Content-Security-Policy`)
    return
  }
  if (!csp.includes("frame-ancestors 'none'")) {
    errors.push(`${label} CSP must include frame-ancestors 'none'`)
  }
  for (const directive of requiredCspDirectives) {
    if (!csp.includes(directive)) {
      errors.push(`${label} CSP is missing required directive: ${directive}`)
    }
  }
}

if (assertFileExists('public/.htaccess', 'public/.htaccess')) {
  const htaccess = fs.readFileSync(path.join(root, 'public/.htaccess'), 'utf8')
  if (!htaccess.includes('X-Frame-Options')) {
    errors.push('public/.htaccess is missing X-Frame-Options')
  }
  verifyCsp(htaccess, 'public/.htaccess')
  if (!htaccess.includes('Require all denied') || !htaccess.includes('\\.map$')) {
    errors.push('public/.htaccess must deny public source map access')
  }
  if (!htaccess.includes(expectedCsp)) {
    errors.push('public/.htaccess CSP is out of sync with scripts/csp-policy.mjs. Run: npm run sync:security-headers')
  }
}

if (assertFileExists('vercel.json', 'vercel.json')) {
  const vercel = fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')
  verifyCsp(vercel, 'vercel.json')
  if (!vercel.includes(expectedCsp)) {
    errors.push('vercel.json CSP is out of sync with scripts/csp-policy.mjs. Run: npm run sync:security-headers')
  }
}

if (assertFileExists('scripts/csp-policy.mjs', 'scripts/csp-policy.mjs')) {
  const policy = fs.readFileSync(path.join(root, 'scripts/csp-policy.mjs'), 'utf8')
  if (!policy.includes('buildContentSecurityPolicy')) {
    errors.push('scripts/csp-policy.mjs must export buildContentSecurityPolicy')
  }
}

if (errors.length > 0) {
  console.error('Security header verification failed:\n')
  for (const message of errors) {
    console.error(`- ${message}`)
  }
  process.exit(1)
}

console.log('Security header sources verified.')
