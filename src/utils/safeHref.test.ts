import { describe, expect, it } from 'vitest'

import {
  isSafeInternalHref,
  safeAbsoluteHttpUrl,
  safeExternalHref,
  safeImageUrl,
  safePublicHref,
} from './safeHref'

describe('safeHref helpers', () => {
  it('allows only real internal paths and anchors for internal hrefs', () => {
    expect(isSafeInternalHref('/contact')).toBe(true)
    expect(isSafeInternalHref('#kontakt')).toBe(true)
    expect(isSafeInternalHref('//evil.example')).toBe(false)
    expect(isSafeInternalHref('javascript:alert(1)')).toBe(false)
  })

  it('sanitizes public hrefs by context', () => {
    expect(safePublicHref('https://vezvision.com')).toBe('https://vezvision.com')
    expect(safePublicHref('mailto:contact@vezvision.com')).toBe('mailto:contact@vezvision.com')
    expect(safePublicHref('tel:+48572711535')).toBe('tel:+48572711535')
    expect(safePublicHref('javascript:alert(1)', '/contact')).toBe('/contact')
  })

  it('keeps external and image urls strict', () => {
    expect(safeExternalHref('/contact')).toBe('')
    expect(safeAbsoluteHttpUrl('https://vezvision.com/path')).toBe('https://vezvision.com/path')
    expect(safeAbsoluteHttpUrl('data:text/html,<script>')).toBe('')
    expect(safeImageUrl('/logo.svg')).toBe('/logo.svg')
    expect(safeImageUrl('javascript:alert(1)', '/fallback.svg')).toBe('/fallback.svg')
  })
})
