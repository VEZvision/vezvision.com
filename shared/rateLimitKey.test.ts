import { describe, expect, it } from 'vitest'

import { buildEdgeRateLimitKey, sha256Hex16 } from './rateLimitKey'

describe('rateLimitKey', () => {
  it('hashes consistently', async () => {
    const a = await sha256Hex16('test-input')
    const b = await sha256Hex16('test-input')
    expect(a).toBe(b)
    expect(a).toHaveLength(16)
  })

  it('builds scoped fingerprint keys', async () => {
    const req = new Request('https://example.com', {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'pl-PL',
      },
    })

    const key = await buildEdgeRateLimitKey('edge-test', req, '1.2.3.4')
    expect(key.startsWith('edge-test:')).toBe(true)
  })
})
