import { describe, expect, it } from 'vitest'

import {
  formatTelHref,
  isContactPhoneProvided,
  normalizeContactEmail,
  normalizeContactPhone,
} from './contactValidation'

describe('contactValidation', () => {
  it('normalizes optional phone numbers consistently', () => {
    expect(normalizeContactPhone('')).toEqual({ phone: null, invalid: false })
    expect(normalizeContactPhone('+48 572 711 535')).toEqual({
      phone: '+48 572 711 535',
      invalid: false,
    })
    expect(normalizeContactPhone('abc')).toEqual({ phone: null, invalid: true })
    expect(isContactPhoneProvided(123)).toBe(true)
    expect(normalizeContactPhone(123)).toEqual({ phone: null, invalid: true })
  })

  it('formats tel href without spaces', () => {
    expect(formatTelHref('+48 572 711 535')).toBe('tel:+48572711535')
  })

  it('validates contact email', () => {
    expect(normalizeContactEmail('contact@vezvision.com')).toBe('contact@vezvision.com')
    expect(normalizeContactEmail('not-an-email')).toBeNull()
  })
})
