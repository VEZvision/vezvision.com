export function getLocalizedLabel(language: 'pl' | 'en', labelPl: string, labelEn: string): string {
  return language === 'en' ? (labelEn || labelPl) : labelPl
}

export function getLocalizedValue<T>(
  language: 'pl' | 'en',
  valuePl: T | null | undefined,
  valueEn: T | null | undefined,
  fallback?: T,
): T | undefined {
  if (language === 'en') return valueEn ?? valuePl ?? fallback
  return valuePl ?? valueEn ?? fallback
}
