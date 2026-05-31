import type { Language } from '@/hooks/useLanguage'

type Registry = Record<Language, Record<string, string>>

const registry: Registry = {
  pl: {},
  en: {},
}

export function setCmsTranslationsRegistry(nextRegistry: Registry) {
  registry.pl = nextRegistry.pl
  registry.en = nextRegistry.en
}

export function getCmsTranslation(language: Language, key: string): string | null {
  return registry[language]?.[key] ?? null
}
