import crypto from 'node:crypto'
import http from 'node:http'
import { Pool } from 'pg'
import { contactAutoReplyEmail, contactNotificationEmail, newsletterConfirmationEmail } from './email-templates.mjs'
import { sendEmail as sendResendEmail } from './resend-email.mjs'

const databaseUrl = process.env.DATABASE_URL
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim()
const turnstileTestMode = process.env.TURNSTILE_TEST_MODE === 'true'
const turnstileExpectedHostnames = String(process.env.TURNSTILE_EXPECTED_HOSTNAMES || '')
  .split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
const resendApiKey = process.env.RESEND_API_KEY?.trim()
const legacyFromEmail = process.env.RESEND_FROM_EMAIL?.trim()
const legacyContactFromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || legacyFromEmail
const contactNotificationFromEmail = process.env.CONTACT_NOTIFICATION_FROM_EMAIL?.trim() || legacyContactFromEmail
const contactReplyFromEmail = process.env.CONTACT_REPLY_FROM_EMAIL?.trim() || legacyContactFromEmail
const newsletterFromEmail = process.env.NEWSLETTER_FROM_EMAIL?.trim() || legacyFromEmail
const newsletterReplyTo = process.env.NEWSLETTER_REPLY_TO?.trim() || 'contact@vezvision.com'
const contactNotifyEmail = process.env.CONTACT_NOTIFY_EMAIL?.trim() || 'contact@vezvision.com'
const adminApiTokenSha256 = process.env.ADMIN_API_TOKEN_SHA256?.trim().toLowerCase()
const adminPostgrestUrl = process.env.ADMIN_POSTGREST_URL?.trim().replace(/\/$/, '')
const adminPostgrestApiKey = process.env.ADMIN_POSTGREST_API_KEY?.trim()
const publicSiteUrl = (process.env.PUBLIC_SITE_URL?.trim() || allowedOrigins[0] || '').replace(/\/$/, '')
const publicEmailSiteUrl = (process.env.PUBLIC_EMAIL_SITE_URL?.trim() || 'https://vezvision.com').replace(/\/$/, '')
if (!databaseUrl || allowedOrigins.length === 0) throw new Error('DATABASE_URL and ALLOWED_ORIGIN/ALLOWED_ORIGINS are required')
if (!turnstileSecret) console.warn('TURNSTILE_SECRET_KEY is not set; contact and newsletter captcha verification is disabled')
if (turnstileTestMode) console.warn('TURNSTILE_TEST_MODE is enabled; use only in development')
if (!resendApiKey || !contactNotificationFromEmail || !contactReplyFromEmail || !newsletterFromEmail) console.warn('Resend API key or sender addresses are not fully configured; some emails are disabled')
if ([adminApiTokenSha256, adminPostgrestUrl, adminPostgrestApiKey].some(Boolean)
  && ![adminApiTokenSha256, adminPostgrestUrl, adminPostgrestApiKey].every(Boolean)) {
  throw new Error('ADMIN_API_TOKEN_SHA256, ADMIN_POSTGREST_URL and ADMIN_POSTGREST_API_KEY must be configured together')
}
const pool = new Pool({ connectionString: databaseUrl, max: 10, ssl: false })

const adminTables = new Set([
  'vv_blog_categories', 'vv_blog_post_categories', 'vv_blog_posts',
  'vv_faq_categories', 'vv_faq_items', 'vv_legal_documents',
  'vv_newsletter_subscribers', 'vv_page_sections', 'vv_page_seo',
  'vv_project_categories', 'vv_project_category_assignments',
  'vv_project_images', 'vv_project_technologies', 'vv_projects',
  'vv_service_categories', 'vv_service_category_assignments',
  'vv_services', 'vv_site_settings',
])
const adminMethods = new Set(['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'])
const forwardedRequestHeaders = new Set([
  'accept', 'accept-profile', 'content-profile', 'content-type', 'prefer', 'range', 'range-unit',
])
const forwardedResponseHeaders = new Set([
  'content-location', 'content-range', 'content-type', 'date', 'location', 'preference-applied', 'range-unit',
])

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
  const contentType = String(req.headers['content-type'] || '').toLowerCase()
  if (contentType.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw))
  try { return JSON.parse(raw) }
  catch { throw Object.assign(new Error('Invalid payload'), { status: 400 }) }
}

function validAdminToken(req) {
  if (!adminApiTokenSha256 || !/^[a-f0-9]{64}$/.test(adminApiTokenSha256)) return false
  const authorization = String(req.headers.authorization || '')
  const supplied = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : String(req.headers['x-internal-api-key'] || '').trim()
  if (supplied.length < 32 || supplied.length > 512) return false
  const suppliedHash = crypto.createHash('sha256').update(supplied).digest()
  const expectedHash = Buffer.from(adminApiTokenSha256, 'hex')
  return suppliedHash.length === expectedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash)
}

async function proxyAdminApi(req, res, url) {
  if (!adminPostgrestUrl || !adminPostgrestApiKey) return json(res, 503, { error: 'Administration API is unavailable' })
  if (!validAdminToken(req)) {
    res.setHeader('www-authenticate', 'Bearer')
    return json(res, 401, { error: 'Unauthorized' })
  }
  if (!adminMethods.has(req.method)) return json(res, 405, { error: 'Method not allowed' })

  const resource = url.pathname.slice('/admin/v1/'.length).replace(/\/$/, '')
  if (!adminTables.has(resource)) return json(res, 404, { error: 'Not found' })

  const headers = { 'x-internal-api-key': adminPostgrestApiKey, 'x-client-info': 'vezvision-admin-gateway/1.0' }
  for (const [name, value] of Object.entries(req.headers)) {
    if (forwardedRequestHeaders.has(name) && typeof value === 'string') headers[name] = value
  }

  let requestBody
  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 2_097_152) return json(res, 413, { error: 'Payload too large' })
      chunks.push(chunk)
    }
    requestBody = chunks.length ? Buffer.concat(chunks) : undefined
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const upstream = await fetch(`${adminPostgrestUrl}/${resource}${url.search}`, {
      method: req.method,
      headers,
      body: requestBody,
      redirect: 'error',
      signal: controller.signal,
    })
    const responseHeaders = {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    }
    for (const [name, value] of upstream.headers) {
      if (forwardedResponseHeaders.has(name)) responseHeaders[name] = value
    }
    res.writeHead(upstream.status, responseHeaders)
    if (req.method === 'HEAD') return res.end()
    res.end(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    console.error('Administration API proxy failed', error)
    json(res, 502, { error: 'Administration API upstream unavailable' })
  } finally {
    clearTimeout(timeout)
  }
}
const ip = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 128)
async function sendEmail({ from, to, subject, html, text, replyTo }) {
  return sendResendEmail({ apiKey: resendApiKey, from, to, subject, html, text, replyTo })
}
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
async function cleanupRateLimits() {
  try {
    const { rows: [row] } = await pool.query(
      `SELECT public.cleanup_rate_limit_buckets(interval '7 days') AS deleted_count`,
    )
    if (Number(row?.deleted_count) > 0) console.info(`Cleaned ${row.deleted_count} expired rate-limit buckets`)
  } catch (error) {
    console.error('Rate-limit retention cleanup failed', error)
  }
}
async function verifyTurnstile(req, input, expectedAction) {
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
    const hostnameValid = turnstileTestMode || turnstileExpectedHostnames.length === 0
      || turnstileExpectedHostnames.includes(String(result?.hostname || '').toLowerCase())
    const actionValid = turnstileTestMode || !expectedAction || result?.action === expectedAction
    return result?.success === true && hostnameValid && actionValid
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
  const captcha = await verifyTurnstile(req, input, 'contact')
  if (!captcha.ok) return json(res, captcha.status, { error: captcha.error, field: 'form' })
  const { rows: [row] } = await pool.query('INSERT INTO public.messages(full_name,email,subject,message,phone,language,client_ip) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [fullName, email, subject, message, String(input.phone || '').trim().slice(0, 40) || null, input.language === 'en' ? 'en' : 'pl', ip(req)])
  const phone = String(input.phone || '').trim().slice(0, 40)
  const lang = input.language === 'en' ? 'en' : 'pl'
  const notification = contactNotificationEmail({ fullName, email, phone, subject, message, siteUrl: publicEmailSiteUrl })
  const autoReply = contactAutoReplyEmail({ fullName, language: lang, siteUrl: publicEmailSiteUrl })
  const emailResults = await Promise.allSettled([
    sendEmail({ from: `VEZvision Formularz <${contactNotificationFromEmail}>`, to: contactNotifyEmail, ...notification }),
    sendEmail({ from: `VEZvision <${contactReplyFromEmail}>`, to: email, ...autoReply, replyTo: contactNotifyEmail }),
  ])
  for (const result of emailResults) if (result.status === 'rejected') console.error('Contact email delivery failed', result.reason)
  json(res, 201, { success: true, id: row.id, email_sent: emailResults.every(result => result.status === 'fulfilled' && result.value.sent) })
}
async function subscribe(req, res) {
  const input = await body(req); const email = String(input.email || '').trim().toLowerCase()
  if (!await allow(rateKey('newsletter', ip(req), email), 5, 300000)) return json(res, 429, { error: 'Too many requests' })
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Invalid email' })
  if (input.privacy_accepted !== true) return json(res, 400, { error: 'Privacy consent is required' })
  const captcha = await verifyTurnstile(req, input, 'newsletter')
  if (!captcha.ok) return json(res, captcha.status, { error: captcha.error })
  const token = crypto.randomBytes(32).toString('hex')
  const source = String(input.source || 'newsletter').trim().slice(0, 80).replace(/[^\w .:/-]/g, '') || 'newsletter'
  const language = input.language === 'en' ? 'en' : 'pl'
  const { rows: [row] } = await pool.query(`INSERT INTO public.vv_newsletter_subscribers(email,source,tags,token,is_active,language,confirmation_requested_at) VALUES ($1,$2,ARRAY['newsletter'],$3,false,$4,now()) ON CONFLICT(email) DO UPDATE SET token=CASE WHEN public.vv_newsletter_subscribers.is_active THEN public.vv_newsletter_subscribers.token ELSE EXCLUDED.token END, confirmation_requested_at=CASE WHEN public.vv_newsletter_subscribers.is_active THEN public.vv_newsletter_subscribers.confirmation_requested_at ELSE now() END, updated_at=now(), source=EXCLUDED.source, language=EXCLUDED.language RETURNING id,is_active,token`, [email, source, token, language])
  const confirmationUrl = `${publicSiteUrl}/${language}/newsletter/confirm?token=${encodeURIComponent(row.token)}`
  const confirmation = newsletterConfirmationEmail({ language, confirmationUrl, siteUrl: publicEmailSiteUrl })
  let emailSent = false
  if (!row.is_active) try { emailSent = (await sendEmail({ from: `VEZvision Newsletter <${newsletterFromEmail}>`, to: email, ...confirmation, replyTo: newsletterReplyTo })).sent }
  catch (error) { console.error('Newsletter confirmation delivery failed', error) }
  json(res, 201, { success: true, id: row.id, confirmation_required: !row.is_active, email_sent: row.is_active || emailSent })
}
async function confirmNewsletter(req, res) {
  const input = await body(req)
  const token = String(input.token || '').trim()
  if (!/^[a-f0-9]{64}$/i.test(token)) return json(res, 400, { success: false, error: 'Invalid token' })
  const { rows: [row] } = await pool.query(`UPDATE public.vv_newsletter_subscribers SET is_active=true, confirmed_at=COALESCE(confirmed_at,now()), consent_ip=COALESCE(consent_ip,$2::inet), consent_user_agent=COALESCE(consent_user_agent,$3), unsubscribed_at=NULL, updated_at=now() WHERE token=$1 AND (is_active=true OR confirmation_requested_at >= now() - interval '48 hours') RETURNING id`, [token, ip(req), String(req.headers['user-agent'] || '').slice(0, 500) || null])
  if (!row) return json(res, 404, { success: false, error: 'Confirmation not found' })
  json(res, 200, { success: true })
}
async function unsubscribe(req, res) {
  const input = await body(req)
  const token = String(input.token || new URL(req.url, 'http://localhost').searchParams.get('token') || '')
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return json(res, 400, { success: false, error: 'Invalid token' })
  const { rows: [row] } = await pool.query(`UPDATE public.vv_newsletter_subscribers SET is_active=false, unsubscribed_at=COALESCE(unsubscribed_at,now()), updated_at=now() WHERE token=$1 RETURNING id`, [token])
  if (!row) return json(res, 404, { success: false, error: 'Subscription not found' })
  json(res, 200, { success: true })
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
const handlers = { 'submit-contact': submitContact, 'subscribe-newsletter': subscribe, 'confirm-newsletter': confirmNewsletter, 'unsubscribe-newsletter': unsubscribe, 'increment-blog-view': incrementBlogView, 'check-maintenance-access': maintenance, 'get-code-injection': codeInjection }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname.startsWith('/admin/v1/')) {
    try { return await proxyAdminApi(req, res, url) }
    catch (error) { console.error(error); return json(res, 500, { error: 'Internal server error' }) }
  }
  cors(req, res)
  if (req.method === 'OPTIONS') return res.end()
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  const name = url.pathname.split('/').pop()
  try { const handler = handlers[name]; if (!handler) return json(res, 404, { error: 'Not found' }); await handler(req, res) }
  catch (error) { console.error(error); json(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' }) }
})

server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
  cleanupRateLimits()
  const cleanupTimer = setInterval(cleanupRateLimits, 6 * 60 * 60 * 1000)
  cleanupTimer.unref()
})
