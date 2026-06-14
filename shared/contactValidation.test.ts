import { describe, expect, it } from 'vitest'

import {
  normalizeContactEmail,
  normalizeContactPhone,
  normalizeContactText,
} from './contactValidation'

describe('shared/contactValidation', () => {
  it('normalizes valid email', () => {
    expect(normalizeContactEmail('  Test@Example.com ')).toBe('test@example.com')
  })

  it('rejects invalid phone', () => {
    expect(normalizeContactPhone('abc').invalid).toBe(true)
  })

  it('accepts optional empty phone', () => {
    expect(normalizeContactPhone('')).toEqual({ phone: null, invalid: false })
  })

  it('trims and validates text', () => {
    expect(normalizeContactText('  hello  ', 10)).toBe('hello')
    expect(normalizeContactText('x'.repeat(11), 10)).toBeNull()
  })

  it('enforces minimum message length aligned with DB RPC', () => {
    expect(normalizeContactText('short', 5000, 10)).toBeNull()
    expect(normalizeContactText('long enough', 5000, 10)).toBe('long enough')
  })
})
