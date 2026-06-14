import type { PortfolioProject } from '@/types/portfolio'

export type PortfolioLocale = 'pl' | 'en'

export function hasPortfolioTranslation(project: PortfolioProject, locale: PortfolioLocale): boolean {
  const translation = project.translations[locale]
  return Boolean(translation?.title?.trim())
}

export function getAvailablePortfolioLocales(project: PortfolioProject): PortfolioLocale[] {
  return (['pl', 'en'] as const).filter((locale) => hasPortfolioTranslation(project, locale))
}
