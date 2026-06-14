import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readPublicSettingsCache, writePublicSettingsCache } from './publicSettingsCache'
import type { SettingsState } from '@/contexts/SettingsContext'

const sampleSettings: SettingsState = {
  identity: null,
  contact: null,
  social: null,
  seo: null,
  maintenance: { enabled: true, message: 'Down', description: 'Soon' },
  seo_files: null,
  company: null,
  navigation: null,
  footer: null,
  pageSeo: {},
  pageSections: {},
}

function createLocalStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('publicSettingsCache', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('never returns cached maintenance flag', () => {
    writePublicSettingsCache(sampleSettings)
    const cached = readPublicSettingsCache()
    expect(cached?.settings.maintenance).toBeNull()
  })
})
