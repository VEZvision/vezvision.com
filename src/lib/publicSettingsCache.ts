import type { SettingsState } from '@/contexts/SettingsContext';

const CACHE_KEY = 'vez-public-settings-v1'
const CACHE_TTL_MS = 5 * 60 * 1000

export type CachedPublicSettings = {
  savedAt: number
  settings: SettingsState
}

export function readPublicSettingsCache(): CachedPublicSettings | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return undefined

    const parsed = JSON.parse(raw) as CachedPublicSettings
    if (!parsed?.savedAt || !parsed.settings) return undefined
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return undefined

    return parsed
  } catch {
    return undefined
  }
}

export function writePublicSettingsCache(settings: SettingsState): void {
  if (typeof window === 'undefined') return

  try {
    const payload: CachedPublicSettings = { savedAt: Date.now(), settings }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Quota or private mode — ignore.
  }
}
