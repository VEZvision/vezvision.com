/**
 * Ensures mirrored shared/ modules stay aligned with supabase/functions/_shared/.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

function normalize(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/["']/g, '"')
    .replace(/;/g, '')
    .replace(/\s+/g, '')
}

function extractFunction(source, name) {
  const markers = [`export function ${name}`, `export async function ${name}`]
  const start = markers.map((marker) => source.indexOf(marker)).find((index) => index >= 0)
  if (start === undefined || start < 0) return null

  const braceStart = source.indexOf('{', start)
  if (braceStart < 0) return null

  let depth = 0
  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return normalize(source.slice(start, i + 1))
    }
  }

  return null
}

const errors = []

const contactApp = fs.readFileSync(path.join(ROOT, 'shared/contactValidation.ts'), 'utf8')
const contactEdge = fs.readFileSync(path.join(ROOT, 'supabase/functions/_shared/contactValidation.ts'), 'utf8')
for (const fn of ['normalizeContactText', 'normalizeContactEmail', 'normalizeContactPhone']) {
  const appFn = extractFunction(contactApp, fn)
  const edgeFn = extractFunction(contactEdge, fn)
  if (!appFn || appFn !== edgeFn) {
    errors.push(`shared/contactValidation.ts ${fn} diverged from edge copy`)
  }
}

const clientApp = fs.readFileSync(path.join(ROOT, 'shared/clientIp.ts'), 'utf8')
const clientEdge = fs.readFileSync(path.join(ROOT, 'supabase/functions/_shared/clientIp.ts'), 'utf8')
const clientAppFn = extractFunction(clientApp, 'getClientIpFromHeaders')
const clientEdgeFn = extractFunction(clientEdge, 'getClientIpFromHeaders')
if (!clientAppFn || clientAppFn !== clientEdgeFn) {
  errors.push('shared/clientIp.ts getClientIpFromHeaders diverged from edge copy')
}

const rateApp = fs.readFileSync(path.join(ROOT, 'shared/rateLimitKey.ts'), 'utf8')
const rateEdge = fs.readFileSync(path.join(ROOT, 'supabase/functions/_shared/rateLimitKey.ts'), 'utf8')
for (const fn of ['sha256Hex16', 'buildEdgeRateLimitKey']) {
  const appFn = extractFunction(rateApp, fn)
  const edgeFn = extractFunction(rateEdge, fn)
  if (!appFn || appFn !== edgeFn) {
    errors.push(`shared/rateLimitKey.ts ${fn} diverged from edge copy`)
  }
}

const zodEdge = (() => {
  const m = contactEdge.match(/npm:zod@([\d.]+)/)
  return m?.[1] ?? null
})()

let zodWeb = null
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  zodWeb = pkg.dependencies?.zod?.replace(/^[\^~]/, '') ?? null
} catch { /* ignore */ }

if (zodEdge && zodWeb && zodEdge !== zodWeb) {
  errors.push(
    `Zod version mismatch: edge=${zodEdge} vs web=${zodWeb}. ` +
    'Pin the same version in supabase/functions/_shared/contactValidation.ts (npm:zod@...) and package.json dependencies.zod.'
  )
}

if (errors.length > 0) {
  console.error('Edge shared parity check failed:\n')
  for (const message of errors) console.error(`- ${message}`)
  process.exit(1)
}

console.log('Edge shared parity verified.')
