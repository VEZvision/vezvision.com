import { describe, expect, it } from 'vitest'

import type { BlogPostWithDetails } from '@/services/blog'
import {
  getAvailableBlogLocales,
  getBlogPostTranslation,
  hasBlogPostTranslation,
} from './blogTranslation'

function makePost(overrides: Partial<BlogPostWithDetails> = {}): BlogPostWithDetails {
  return {
    id: '1',
    slug: 'test',
    status: 'published',
    published_at: '2026-01-01',
    featured_image: null,
    is_featured: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    views_count: 0,
    translations: [
      {
        id: '1-pl',
        post_id: '1',
        language: 'pl',
        title: 'Polski tytuł',
        excerpt: 'Opis PL',
        content: '<p>Treść PL</p>',
      },
      {
        id: '1-en',
        post_id: '1',
        language: 'en',
        title: 'English title',
        excerpt: 'EN excerpt',
        content: '<p>EN content</p>',
      },
    ],
    categories: [],
    ...overrides,
  }
}

describe('blogTranslation', () => {
  it('returns locale-specific translation without cross-locale fallback', () => {
    const post = makePost()
    expect(getBlogPostTranslation(post, 'en')?.title).toBe('English title')
    expect(getBlogPostTranslation(post, 'pl')?.title).toBe('Polski tytuł')
  })

  it('detects missing locale content', () => {
    const post = makePost({
      translations: [
        {
          id: '1-pl',
          post_id: '1',
          language: 'pl',
          title: 'Polski tytuł',
          excerpt: '',
          content: '',
        },
      ],
    })

    expect(hasBlogPostTranslation(post, 'pl')).toBe(true)
    expect(hasBlogPostTranslation(post, 'en')).toBe(false)
    expect(getAvailableBlogLocales(post)).toEqual(['pl'])
  })
})
