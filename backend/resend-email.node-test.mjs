import assert from 'node:assert/strict'
import test from 'node:test'

import { buildResendPayload, EMAIL_LOGO_CID } from './resend-email.mjs'

test('Resend payload embeds the VEZvision PNG using a matching CID', () => {
  const payload = buildResendPayload({
    from: 'VEZvision <contact@example.com>',
    to: 'recipient@example.com',
    subject: 'Test',
    html: `<img src="cid:${EMAIL_LOGO_CID}" alt="VEZvision">`,
    text: 'Test',
    replyTo: 'reply@example.com',
  })

  assert.equal(payload.reply_to, 'reply@example.com')
  assert.deepEqual(payload.to, ['recipient@example.com'])
  assert.equal(payload.attachments.length, 1)
  assert.equal(payload.attachments[0].content_id, EMAIL_LOGO_CID)
  assert.equal(payload.attachments[0].content_type, 'image/png')
  assert.equal(payload.attachments[0].filename, 'vezvision-logo.png')
  assert.match(payload.attachments[0].content, /^[A-Za-z0-9+/]+=*$/)
  assert.ok(payload.attachments[0].content.length > 1_000)
})
