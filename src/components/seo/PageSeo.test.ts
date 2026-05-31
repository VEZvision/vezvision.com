import { describe, expect, it } from 'vitest'

import { getSafeStructuredDataJson } from '@/utils/safeJsonLd'

describe('getSafeStructuredDataJson', () => {
  it('serializes valid structured data safely', () => {
    expect(getSafeStructuredDataJson('{"name":"<VezVision>","@type":"WebSite"}')).toBe(
      '{"name":"\\u003cVezVision\\u003e","@type":"WebSite"}'
    )
  })

  it('ignores blank or invalid structured data', () => {
    expect(getSafeStructuredDataJson('')).toBeNull()
    expect(getSafeStructuredDataJson('{invalid json')).toBeNull()
  })
})
