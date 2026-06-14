import { describe, expect, it } from 'vitest'

import { getTurnstileSiteKey, isTurnstileEnabled } from './turnstile'

describe('turnstile config', () => {
  it('is disabled when site key is missing', () => {
    expect(isTurnstileEnabled()).toBe(false)
    expect(getTurnstileSiteKey()).toBe('')
  })
})
