/**
 * Regenerate scripts/edge-bundles/*.json from supabase/functions source.
 * Run after changing edge handlers or _shared modules.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const FUNCTIONS_DIR = path.join(ROOT, 'supabase/functions')
const SHARED_DIR = path.join(FUNCTIONS_DIR, '_shared')
const OUT_DIR = path.join(ROOT, 'scripts/edge-bundles')

function getProjectId() {
  const url = process.env.VITE_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable')
  }
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    throw new Error(`Could not extract project id from VITE_SUPABASE_URL: ${url}`)
  }
  return match[1]
}

const PROJECT_ID = getProjectId()

const FUNCTIONS = [
  { name: 'submit-contact', verifyJwt: true },
  { name: 'subscribe-newsletter', verifyJwt: false },
  { name: 'unsubscribe-newsletter', verifyJwt: false },
  { name: 'check-maintenance-access', verifyJwt: false },
  { name: 'get-code-injection', verifyJwt: false },
  { name: 'increment-blog-view', verifyJwt: false },
]

function readSharedDeps(entryContent) {
  const deps = new Set()
  const re = /from\s+["']\.\.\/_shared\/([^"']+)["']/g
  let match
  while ((match = re.exec(entryContent)) !== null) {
    deps.add(match[1])
  }
  return [...deps]
}

function buildBundle(fn) {
  const entryPath = path.join(FUNCTIONS_DIR, fn.name, 'index.ts')
  const entryContent = fs.readFileSync(entryPath, 'utf8')
  const sharedDeps = readSharedDeps(entryContent)
  const denoJson = fs.readFileSync(path.join(FUNCTIONS_DIR, 'deno.json'), 'utf8')

  const files = [
    { name: 'deno.json', content: denoJson },
    { name: `${fn.name}/index.ts`, content: entryContent },
  ]

  for (const dep of sharedDeps) {
    const sharedPath = path.join(SHARED_DIR, dep)
    if (!fs.existsSync(sharedPath)) {
      throw new Error(`Missing shared dep ${dep} for ${fn.name}`)
    }
    files.push({ name: `_shared/${dep}`, content: fs.readFileSync(sharedPath, 'utf8') })
  }

  return {
    project_id: PROJECT_ID,
    name: fn.name,
    entrypoint_path: `${fn.name}/index.ts`,
    import_map_path: 'deno.json',
    verify_jwt: fn.verifyJwt,
    files,
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const fn of FUNCTIONS) {
  const bundle = buildBundle(fn)
  const deployPath = path.join(OUT_DIR, `deploy-${fn.name}.json`)
  const mcpPath = path.join(OUT_DIR, `mcp-${fn.name}.json`)
  const json = `${JSON.stringify(bundle)}\n`
  fs.writeFileSync(deployPath, json)
  fs.writeFileSync(mcpPath, json)
  console.log(`Wrote ${path.basename(deployPath)}`)
}

console.log('Edge bundles synced.')
