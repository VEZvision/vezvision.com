/**
 * Verifies deploy bundles were generated from current edge source (Zod validation, rate limits).
 */
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve('scripts/edge-bundles')
const errors = []

const requiredSnippets = [
  {
    file: 'deploy-submit-contact.json',
    includes: ['npm:zod@', 'buildEdgeRateLimitKey', 'normalizeContactText(body?.message, 5000, 10)'],
  },
  {
    file: 'deploy-subscribe-newsletter.json',
    includes: ['buildEdgeRateLimitKey', 'normalizeContactEmail'],
  },
]

for (const { file, includes } of requiredSnippets) {
  const content = fs.readFileSync(path.join(OUT_DIR, file), 'utf8')
  for (const snippet of includes) {
    if (!content.includes(snippet)) {
      errors.push(`${file} missing expected snippet: ${snippet}`)
    }
  }
}

if (errors.length > 0) {
  console.error('Edge bundle verification failed:\n')
  for (const message of errors) console.error(`- ${message}`)
  console.error('\nRun: npm run sync:edge-bundles')
  process.exit(1)
}

console.log('Edge bundles verified.')
