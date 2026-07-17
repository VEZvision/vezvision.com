import assert from 'node:assert/strict'
import test from 'node:test'

import { contactAutoReplyEmail, contactNotificationEmail, newsletterConfirmationEmail } from './email-templates.mjs'

const siteUrl = 'https://vezvision.vezlabs.dev'

test('contact replies are localized and include the text brand mark', () => {
  const polish = contactAutoReplyEmail({ fullName: 'Anna', language: 'pl', siteUrl })
  const english = contactAutoReplyEmail({ fullName: 'Alex', language: 'en', siteUrl })

  assert.equal(polish.html.includes('email-logo.png'), false)
  assert.match(polish.html, /VEZ<span/)
  assert.match(polish.html, /Dzień dobry Anna/)
  assert.match(english.html, /Hello Alex/)
  assert.equal(polish.subject.includes('—'), false)
  assert.equal(english.subject.includes('—'), false)
})

test('notification escapes untrusted form content', () => {
  const email = contactNotificationEmail({
    fullName: '<script>alert(1)</script>',
    email: 'test@example.com',
    phone: '',
    subject: 'Test',
    message: '<img src=x onerror=alert(1)>',
    siteUrl,
  })

  assert.equal(email.html.includes('<script>'), false)
  assert.equal(email.html.includes('<img src=x'), false)
  assert.match(email.html, /&lt;script&gt;/)
  assert.match(email.html, /overflow-wrap:anywhere/)
})

test('newsletter confirmation has bilingual copy and a 48-hour notice', () => {
  const polish = newsletterConfirmationEmail({ language: 'pl', confirmationUrl: `${siteUrl}/pl/newsletter/confirm?token=test`, siteUrl })
  const english = newsletterConfirmationEmail({ language: 'en', confirmationUrl: `${siteUrl}/en/newsletter/confirm?token=test`, siteUrl })

  assert.match(polish.html, /48 godzin/)
  assert.match(english.html, /48 hours/)
  assert.match(polish.text, /newslettera VEZvision/)
})
