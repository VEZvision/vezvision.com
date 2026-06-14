import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildContentSecurityPolicy } from './csp-policy.mjs'

describe('buildContentSecurityPolicy', () => {
  it('includes nonce in script-src when provided', () => {
    const policy = buildContentSecurityPolicy('abc123')
    const scriptSrc = policy.split(';').find((part) => part.trim().startsWith('script-src'))
    assert.match(scriptSrc ?? '', /'nonce-abc123'/)
    assert.doesNotMatch(scriptSrc ?? '', /unsafe-inline/)
  })

  it('allows HTTPS media without weakening script execution', () => {
    const policy = buildContentSecurityPolicy('abc123')
    const scriptSrc = policy.split(';').find((part) => part.trim().startsWith('script-src'))
    assert.doesNotMatch(scriptSrc ?? '', /unsafe-inline/)
    assert.match(policy, /img-src[^;]*\bhttps:/)
    assert.match(policy, /media-src[^;]*\bhttps:/)
    assert.match(policy, /object-src 'none'/)
  })
})
