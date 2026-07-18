import { readFileSync } from 'node:fs'

export const EMAIL_LOGO_CID = 'vezvision-logo'

const emailLogoPath = process.env.EMAIL_LOGO_PATH || new URL('../public/email-logo.png', import.meta.url)
const emailLogoContent = readFileSync(emailLogoPath).toString('base64')

export function buildResendPayload({ from, to, subject, html, text, replyTo }) {
  return {
    from,
    to: [to],
    subject,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
    attachments: [
      {
        content: emailLogoContent,
        filename: 'vezvision-logo.png',
        content_id: EMAIL_LOGO_CID,
        content_type: 'image/png',
      },
    ],
  }
}

export async function sendEmail({ apiKey, from, to, subject, html, text, replyTo }) {
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify(buildResendPayload({ from, to, subject, html, text, replyTo })),
  })
  if (!response.ok) throw new Error(`Resend HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)

  const result = await response.json()
  return { sent: true, id: result.id }
}
