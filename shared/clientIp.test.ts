import { describe, expect, it } from 'vitest'

import { getClientIpFromHeaders } from './clientIp'

function headersFrom(record: Record<string, string>): Pick<Headers, 'get'> {
  return {
    get(name: string) {
      const key = Object.keys(record).find((entry) => entry.toLowerCase() === name.toLowerCase())
      return key ? record[key] : null
    },
  }
}

describe('getClientIpFromHeaders', () => {
  it('prefers cf-connecting-ip over spoofed x-forwarded-for', () => {
    expect(
      getClientIpFromHeaders(
        headersFrom({
          'cf-connecting-ip': '203.0.113.10',
          'x-forwarded-for': '198.51.100.99, 203.0.113.10',
        }),
      ),
    ).toBe('203.0.113.10')
  })

  it('ignores spoofable x-real-ip and x-forwarded-for', () => {
    expect(
      getClientIpFromHeaders(
        headersFrom({
          'x-real-ip': '198.51.100.99',
          'x-forwarded-for': '198.51.100.99, 203.0.113.44',
        }),
      ),
    ).toBe('unknown')
  })

  it('uses true-client-ip when cloudflare header is absent', () => {
    expect(
      getClientIpFromHeaders(
        headersFrom({
          'true-client-ip': '203.0.113.55',
        }),
      ),
    ).toBe('203.0.113.55')
  })

  it('returns unknown when no trusted ip is present', () => {
    expect(
      getClientIpFromHeaders(
        headersFrom({
          'x-forwarded-for': 'not-an-ip',
        }),
      ),
    ).toBe('unknown')
  })
})
