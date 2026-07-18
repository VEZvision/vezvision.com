import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import http from 'node:http'
import { spawn } from 'node:child_process'
import test from 'node:test'

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

async function freePort() {
  const server = http.createServer()
  const port = await listen(server)
  await new Promise(resolve => server.close(resolve))
  return port
}

async function waitForServer(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error('API process exited before becoming ready')
    try {
      await fetch(url)
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
  throw new Error('API process did not become ready')
}

test('admin gateway authenticates and only proxies allowlisted CMS tables', async t => {
  const token = crypto.randomBytes(32).toString('base64url')
  const internalKey = crypto.randomBytes(32).toString('hex')
  const requests = []
  const upstream = http.createServer((req, res) => {
    requests.push({ url: req.url, key: req.headers['x-internal-api-key'], authorization: req.headers.authorization })
    res.writeHead(200, { 'content-type': 'application/json', 'content-range': '0-0/1' })
    res.end('[{"id":"ok"}]')
  })
  const upstreamPort = await listen(upstream)
  const apiPort = await freePort()
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('.', import.meta.url),
    env: {
      ...process.env,
      PORT: String(apiPort),
      DATABASE_URL: 'postgresql://unused:unused@127.0.0.1:1/unused',
      ALLOWED_ORIGIN: 'https://vezvision.com',
      ADMIN_API_TOKEN_SHA256: crypto.createHash('sha256').update(token).digest('hex'),
      ADMIN_POSTGREST_URL: `http://127.0.0.1:${upstreamPort}`,
      ADMIN_POSTGREST_API_KEY: internalKey,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let stderr = ''
  child.stderr.on('data', chunk => { stderr += chunk })
  t.after(async () => {
    child.kill('SIGTERM')
    await new Promise(resolve => child.once('exit', resolve))
    await new Promise(resolve => upstream.close(resolve))
  })

  const base = `http://127.0.0.1:${apiPort}`
  await waitForServer(`${base}/admin/v1/vv_blog_posts`, child)

  const unauthorized = await fetch(`${base}/admin/v1/vv_blog_posts`)
  assert.equal(unauthorized.status, 401, stderr)

  const forbiddenResource = await fetch(`${base}/admin/v1/vv_files`, {
    headers: { 'x-internal-api-key': token },
  })
  assert.equal(forbiddenResource.status, 404, stderr)

  const allowed = await fetch(`${base}/admin/v1/vv_blog_posts?select=id&limit=1`, {
    headers: { 'x-internal-api-key': token, prefer: 'count=exact' },
  })
  assert.equal(allowed.status, 200, stderr)
  assert.deepEqual(await allowed.json(), [{ id: 'ok' }])
  assert.equal(allowed.headers.get('content-range'), '0-0/1')
  assert.deepEqual(requests.at(-1), {
    url: '/vv_blog_posts?select=id&limit=1',
    key: internalKey,
    authorization: undefined,
  })
})
