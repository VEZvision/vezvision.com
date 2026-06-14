import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCodeInjection } from './codeInjection'

const invokeMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => Promise.resolve({
    functions: { invoke: invokeMock },
  })),
}))

describe('fetchCodeInjection', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('returns empty markup when edge reports failure', async () => {
    invokeMock.mockResolvedValue({ data: { success: false, head: '<x>', body: '<y>' }, error: null })
    await expect(fetchCodeInjection()).resolves.toEqual({ head: '', body: '' })
  })

  it('returns head and body on success', async () => {
    invokeMock.mockResolvedValue({ data: { success: true, head: '<meta>', body: '<div/>' }, error: null })
    await expect(fetchCodeInjection()).resolves.toEqual({ head: '<meta>', body: '<div/>' })
  })
})
