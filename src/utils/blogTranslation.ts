import type { BlogPostTranslation } from '@/types/blog'
import type { BlogPostWithDetails } from '@/services/blog'

export type BlogLocale = 'pl' | 'en'

function hasTranslationContent(translation: BlogPostTranslation | undefined): boolean {
  return Boolean(translation?.title?.trim() || translation?.content?.trim())
}

export function getBlogPostTranslation(
  post: BlogPostWithDetails,
  language: BlogLocale,
): BlogPostTranslation | undefined {
  return post.translations.find((translation) => translation.language === language)
}

export function hasBlogPostTranslation(post: BlogPostWithDetails, language: BlogLocale): boolean {
  return hasTranslationContent(getBlogPostTranslation(post, language))
}

export function getAvailableBlogLocales(post: BlogPostWithDetails): BlogLocale[] {
  return (['pl', 'en'] as const).filter((locale) => hasBlogPostTranslation(post, locale))
}
