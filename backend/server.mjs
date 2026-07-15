import crypto from 'node:crypto'
import http from 'node:http'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim()
if (!databaseUrl || allowedOrigins.length === 0) throw new Error('DATABASE_URL and ALLOWED_ORIGIN/ALLOWED_ORIGINS are required')
if (!turnstileSecret) console.warn('TURNSTILE_SECRET_KEY is not set; contact and newsletter captcha verification is disabled')
const pool = new Pool({ connectionString: databaseUrl, max: 10, ssl: false })

const json = (res, status, body) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  })
  res.end(JSON.stringify(body))
}
const cors = (req, res) => {
  if (allowedOrigins.includes(req.headers.origin)) res.setHeader('access-control-allow-origin', req.headers.origin)
  res.setHeader('vary', 'Origin')
  res.setHeader('access-control-allow-methods', 'POST, OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type, accept')
}
const body = async req => {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 32_768) throw Object.assign(new Error('Payload too large'), { status: 413 })
  }
  if (!raw) return {}
  try { return JSON.parse(raw) }
  catch { throw Object.assign(new Error('Invalid JSON payload'), { status: 400 }) }
}
const ip = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 128)
const rateKey = (scope, ...parts) => `${scope}:${crypto.createHash('sha256').update(parts.map(part => String(part)).join(':')).digest('hex')}`
async function allow(key, limit, windowMs) {
  const { rows: [row] } = await pool.query(
    `INSERT INTO public.rate_limit_buckets(bucket_key, window_started_at, request_count)
     VALUES ($1, now(), 1)
     ON CONFLICT (bucket_key) DO UPDATE SET
       window_started_at = CASE WHEN public.rate_limit_buckets.window_started_at + ($2::text || ' milliseconds')::interval <= now() THEN now() ELSE public.rate_limit_buckets.window_started_at END,
       request_count = CASE WHEN public.rate_limit_buckets.window_started_at + ($2::text || ' milliseconds')::interval <= now() THEN 1 ELSE public.rate_limit_buckets.request_count + 1 END
     RETURNING request_count`, [key, windowMs])
  return row.request_count <= limit
}
async function verifyTurnstile(req, input) {
  if (!turnstileSecret) return { ok: true }
  const token = String(input.turnstile_token || input.turnstileToken || '').trim()
  if (!token) return { ok: false, status: 400, error: 'Captcha verification is required' }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)
  try {
    const payload = new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: ip(req) })
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: payload,
      signal: controller.signal,
    })
    const result = await response.json()
    return result?.success === true
      ? { ok: true }
      : { ok: false, status: 400, error: 'Captcha verification failed' }
  } catch (error) {
    console.error('Turnstile verification failed', error)
    return { ok: false, status: 503, error: 'Captcha verification unavailable' }
  } finally {
    clearTimeout(timeout)
  }
}
async function submitContact(req, res) {
  const input = await body(req)
  const email = String(input.email || '').trim().toLowerCase()
  const fullName = String(input.fullName || input.full_name || '').trim()
  const subject = String(input.subject || '').trim()
  const message = String(input.message || '').trim()
  if (!await allow(rateKey('contact', ip(req), email), 3, 300000)) return json(res, 429, { error: 'Too many requests' })
  if (fullName.length < 2 || fullName.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length < 2 || subject.length > 160 || message.length < 10 || message.length > 5000) return json(res, 400, { error: 'Invalid input' })
  const captcha = await verifyTurnstile(req, input)
  if (!captcha.ok) return json(res, captcha.status, { error: captcha.error, field: 'form' })
  const { rows: [row] } = await pool.query('INSERT INTO public.messages(full_name,email,subject,message,phone,language,client_ip) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [fullName, email, subject, message, String(input.phone || '').trim().slice(0, 40) || null, input.language === 'en' ? 'en' : 'pl', ip(req)])
  json(res, 201, { success: true, id: row.id })
}
async function subscribe(req, res) {
  const input = await body(req); const email = String(input.email || '').trim().toLowerCase()
  if (!await allow(rateKey('newsletter', ip(req), email), 5, 300000)) return json(res, 429, { error: 'Too many requests' })
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Invalid email' })
  const captcha = await verifyTurnstile(req, input)
  if (!captcha.ok) return json(res, captcha.status, { error: captcha.error })
  const token = crypto.randomBytes(32).toString('hex')
  const source = String(input.source || 'newsletter').trim().slice(0, 80).replace(/[^\w .:/-]/g, '') || 'newsletter'
  const language = input.language === 'en' ? 'en' : 'pl'
  const { rows: [row] } = await pool.query(`INSERT INTO public.vv_newsletter_subscribers(email,source,tags,token,is_active,language) VALUES ($1,$2,ARRAY['newsletter'],$3,true,$4) ON CONFLICT(email) DO UPDATE SET is_active=true,unsubscribed_at=NULL,updated_at=now(),source=EXCLUDED.source,language=EXCLUDED.language RETURNING id`, [email, source, token, language])
  json(res, 201, { success: true, id: row.id })
}
async function unsubscribe(req, res) {
  const { token } = await body(req)
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return json(res, 400, { success: false, error: 'Invalid token' })
  const { rows: [row] } = await pool.query(`UPDATE public.vv_newsletter_subscribers SET is_active=false, unsubscribed_at=now(), updated_at=now() WHERE token=$1 AND is_active=true RETURNING email`, [token])
  if (!row) return json(res, 404, { success: false, error: 'Subscription not found' })
  json(res, 200, { success: true, email: row.email })
}
async function incrementBlogView(req, res) {
  const { slug } = await body(req)
  if (typeof slug !== 'string' || !/^[a-z0-9-]{1,160}$/i.test(slug)) return json(res, 400, { success: false, error: 'Invalid post slug' })
  const fingerprint = crypto.createHash('sha256').update(`${ip(req)}:${slug}`).digest('hex')
  if (!await allow(`blog-view:${fingerprint}`, 1, 86400000)) return json(res, 200, { success: true, counted: false })
  const { rows: [row] } = await pool.query(`SELECT public.vv_blog_increment_views($1, $2) AS views_count`, [slug, ip(req)])
  json(res, 200, { success: true, counted: typeof row?.views_count === 'number', views_count: row?.views_count })
}
async function maintenance(_req, res) {
  const { rows: [row] } = await pool.query(`SELECT value FROM public.vv_site_settings WHERE key='maintenance_mode' AND is_public=true LIMIT 1`)
  json(res, 200, { success: true, maintenance: row?.value?.enabled === true, bypass: false })
}
async function codeInjection(req, res) {
  if (!await allow(`code-injection:${ip(req)}`, 30, 60000)) return json(res, 429, { success: false, error: 'Too many requests' })
  const { rows } = await pool.query(`SELECT key, value FROM public.vv_site_settings WHERE key IN ('code_injection_head','code_injection_body') AND is_public=true`)
  const values = Object.fromEntries(rows.map(row => [row.key, row.value]))
  json(res, 200, { success: true, head: typeof values.code_injection_head?.content === 'string' ? values.code_injection_head.content : '', body: typeof values.code_injection_body?.content === 'string' ? values.code_injection_body.content : '' })
}
const handlers = { 'submit-contact': submitContact, 'subscribe-newsletter': subscribe, 'unsubscribe-newsletter': unsubscribe, 'increment-blog-view': incrementBlogView, 'check-maintenance-access': maintenance, 'get-code-injection': codeInjection }
http.createServer(async (req, res) => {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const name = new URL(req.url, 'http://localhost').pathname.split('/').pop()
  try { const handler = handlers[name]; if (!handler) return json(res, 404, { error: 'Not found' }); await handler(req, res) }
  catch (error) { console.error(error); json(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' }) }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0')
