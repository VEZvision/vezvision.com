import { describe, expect, it } from 'vitest'

import { getPageKeyFromPath, isDynamicContentPath } from '@/routing/routes.config'
import { localizeInternalHref, localizedPath, resolveLocaleRedirect, switchLocalePath } from '@/routing/locale'

describe('locale routing helpers', () => {
  it('builds localized paths', () => {
    expect(localizedPath('pl')).toBe('/pl')
    expect(localizedPath('en', 'blog/my-post')).toBe('/en/blog/my-post')
  })

  it('redirects bare paths to a locale prefix', () => {
    expect(resolveLocaleRedirect('/about', 'pl')).toBe('/pl/about')
    expect(resolveLocaleRedirect('/', 'en')).toBe('/en')
  })

  it('switches locale while preserving route suffix', () => {
    expect(switchLocalePath('/pl/blog/demo', 'en')).toBe('/en/blog/demo')
  })

  it('localizes internal hrefs from CMS', () => {
    expect(localizeInternalHref('/contact#kontakt', 'pl')).toBe('/pl/contact#kontakt')
  })

  it('resolves page keys from localized paths', () => {
    expect(getPageKeyFromPath('/pl/services')).toBe('services')
    expect(isDynamicContentPath('/en/blog/demo-post')).toBe(true)
  })
})
