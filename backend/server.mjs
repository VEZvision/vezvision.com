import crypto from 'node:crypto'
import http from 'node:http'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
const allowedOrigin = process.env.ALLOWED_ORIGIN
if (!databaseUrl || !allowedOrigin) throw new Error('DATABASE_URL and ALLOWED_ORIGIN are required')
const pool = new Pool({ connectionString: databaseUrl, max: 10, ssl: false })

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}
const cors = (req, res) => {
  if (req.headers.origin === allowedOrigin) res.setHeader('access-control-allow-origin', allowedOrigin)
  res.setHeader('vary', 'Origin')
  res.setHeader('access-control-allow-methods', 'POST, OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type, apikey, authorization')
}
const body = async req => {
  let raw = ''
  for await (const chunk of req) { raw += chunk; if (raw.length > 32_768) throw new Error('Payload too large') }
  return raw ? JSON.parse(raw) : {}
}
const ip = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 128)
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
async function submitContact(req, res) {
  const input = await body(req)
  const email = String(input.email || '').trim().toLowerCase()
  const fullName = String(input.fullName || input.full_name || '').trim()
  const subject = String(input.subject || '').trim()
  const message = String(input.message || '').trim()
  if (!await allow(`contact:${ip(req)}:${email}`, 3, 300000)) return json(res, 429, { error: 'Too many requests' })
  if (fullName.length < 2 || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length < 2 || subject.length > 160 || message.length < 10 || message.length > 5000) return json(res, 400, { error: 'Invalid input' })
  const { rows: [row] } = await pool.query('INSERT INTO public.messages(full_name,email,subject,message,phone,language,client_ip) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [fullName, email, subject, message, String(input.phone || '').trim().slice(0, 40) || null, input.language === 'en' ? 'en' : 'pl', ip(req)])
  json(res, 201, { success: true, id: row.id })
}
async function subscribe(req, res) {
  const input = await body(req); const email = String(input.email || '').trim().toLowerCase()
  if (!await allow(`newsletter:${ip(req)}:${email}`, 5, 300000)) return json(res, 429, { error: 'Too many requests' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Invalid email' })
  const token = crypto.randomBytes(32).toString('hex')
  const { rows: [row] } = await pool.query(`INSERT INTO public.vv_newsletter_subscribers(email,source,tags,token,is_active) VALUES ($1,'newsletter',ARRAY['newsletter'],$2,true) ON CONFLICT(email) DO UPDATE SET is_active=true,unsubscribed_at=NULL,updated_at=now() RETURNING id`, [email, token])
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
  const result = await pool.query(`UPDATE public.vv_blog_posts SET views_count=views_count+1 WHERE slug=$1 AND status='published' RETURNING views_count`, [slug])
  json(res, 200, { success: true, counted: result.rowCount === 1, views_count: result.rows[0]?.views_count })
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
  catch (error) { console.error(error); json(res, 500, { error: 'Internal server error' }) }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0')
