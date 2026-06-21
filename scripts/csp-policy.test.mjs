import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildContentSecurityPolicy } from './csp-policy.mjs'

describe('buildContentSecurityPolicy', () => {
  it('excludes unsafe-inline from script-src', () => {
    const policy = buildContentSecurityPolicy()
    const scriptSrc = policy.split(';').find((part) => part.trim().startsWith('script-src'))
    assert.doesNotMatch(scriptSrc ?? '', /unsafe-inline/)
    assert.match(scriptSrc ?? '', /'self'/)
    assert.match(scriptSrc ?? '', /googletagmanager\.com/)
    assert.match(scriptSrc ?? '', /challenges\.cloudflare\.com/)
  })

  it('allows HTTPS media without weakening script execution', () => {
    const policy = buildContentSecurityPolicy()
    const scriptSrc = policy.split(';').find((part) => part.trim().startsWith('script-src'))
    assert.doesNotMatch(scriptSrc ?? '', /unsafe-inline/)
    assert.match(policy, /img-src[^;]*\bhttps:/)
    assert.match(policy, /media-src[^;]*\bhttps:/)
    assert.match(policy, /object-src 'none'/)
  })

  it('includes frame-ancestors none and base-uri self', () => {
    const policy = buildContentSecurityPolicy()
    assert.match(policy, /frame-ancestors 'none'/)
    assert.match(policy, /base-uri 'self'/)
    assert.match(policy, /form-action 'self'/)
  })
})
