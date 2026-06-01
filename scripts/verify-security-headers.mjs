import fs from 'node:fs'
import path from 'node:path'
import { CONTENT_SECURITY_POLICY } from './csp-policy.mjs'

const root = path.resolve(import.meta.dirname, '..')
const errors = []

function assertIncludes(filePath, label) {
  const absolutePath = path.join(root, filePath)
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${label} is missing at ${filePath}`)
    return
  }

  const contents = fs.readFileSync(absolutePath, 'utf8')
  if (!contents.includes(CONTENT_SECURITY_POLICY)) {
    errors.push(`${label} CSP does not match scripts/csp-policy.mjs`)
  }
}

assertIncludes('public/.htaccess', 'public/.htaccess')
assertIncludes('vercel.json', 'vercel.json')

if (errors.length > 0) {
  console.error('Security header verification failed:\n')
  for (const message of errors) {
    console.error(`- ${message}`)
  }
  process.exit(1)
}

console.log('Security header sources verified.')
