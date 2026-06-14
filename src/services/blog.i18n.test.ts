import { describe, expect, it } from 'vitest'

import { localizedBlogCategoryName } from './blog'

describe('localizedBlogCategoryName', () => {
  it('uses English name on EN pages', () => {
    expect(
      localizedBlogCategoryName(
        { name_pl: 'Technologia', name_en: 'Technology', slug: 'tech' },
        'en',
      ),
    ).toBe('Technology')
  })

  it('falls back to Polish then slug on EN when English name is missing', () => {
    expect(
      localizedBlogCategoryName({ name_pl: 'Technologia', name_en: null, slug: 'tech' }, 'en'),
    ).toBe('Technologia')
  })

  it('uses Polish name on PL pages', () => {
    expect(
      localizedBlogCategoryName(
        { name_pl: 'Technologia', name_en: 'Technology', slug: 'tech' },
        'pl',
      ),
    ).toBe('Technologia')
  })
})
