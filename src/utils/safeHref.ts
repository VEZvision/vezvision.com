export function isSafeHref(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.startsWith('/') || trimmed.startsWith('#')
}

export function safeCmsHref(value: unknown, fallback: string): string {
  return isSafeHref(value) ? (value as string).trim() : fallback
}
