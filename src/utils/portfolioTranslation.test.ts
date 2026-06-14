import { describe, expect, it } from 'vitest'

import type { PortfolioProject } from '@/types/portfolio'
import { getAvailablePortfolioLocales, hasPortfolioTranslation } from './portfolioTranslation'

function makeProject(overrides: Partial<PortfolioProject> = {}): PortfolioProject {
  return {
    id: '1',
    slug: 'demo',
    category: 'web',
    status: 'published',
    featured: false,
    order_index: 0,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    translations: {
      pl: { title: 'Polski', short_description: '', description: '' },
      en: { title: '', short_description: '', description: '' },
    },
    images: [],
    technologies: [],
    ...overrides,
  }
}

describe('portfolioTranslation', () => {
  it('detects locales with non-empty titles', () => {
    const project = makeProject()
    expect(hasPortfolioTranslation(project, 'pl')).toBe(true)
    expect(hasPortfolioTranslation(project, 'en')).toBe(false)
    expect(getAvailablePortfolioLocales(project)).toEqual(['pl'])
  })
})
