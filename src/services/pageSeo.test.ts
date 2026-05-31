import { describe, expect, it } from 'vitest'

import { normalizePageSeoEntries } from '@/services/pageSeo'

describe('normalizePageSeoEntries', () => {
  it('creates a keyed page seo map', () => {
    const pageSeo = normalizePageSeoEntries([
      {
        page_key: 'home',
        title_pl: 'VezVision - Nowoczesne Strony i Aplikacje Internetowe',
        title_en: 'VezVision - Modern Websites and Web Applications',
        description_pl: 'PL description',
        description_en: 'EN description',
        og_title_pl: 'PL OG',
        og_title_en: 'EN OG',
        og_description_pl: 'PL OG desc',
        og_description_en: 'EN OG desc',
        og_image_url: 'https://cdn.example.com/og.png',
        canonical_url: '',
        robots: 'index,follow',
        indexable: true,
        structured_data_json: '{"@type":"WebSite"}',
      },
    ])

    expect(pageSeo.home?.title_pl).toBe('VezVision - Nowoczesne Strony i Aplikacje Internetowe')
    expect(pageSeo.home?.indexable).toBe(true)
    expect(pageSeo.home?.og_image_url).toBe('https://cdn.example.com/og.png')
  })

  it('skips invalid rows safely', () => {
    const pageSeo = normalizePageSeoEntries([
      null,
      { page_key: '', title_pl: 'Missing key' },
      { page_key: 'about', indexable: false },
    ])

    expect(pageSeo.about?.indexable).toBe(false)
    expect(pageSeo.about?.title_pl).toBe('')
    expect(pageSeo.home).toBeUndefined()
  })
})
