import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMaintenanceAccess, isSiteAccessible } from './maintenanceAccess'

const invokeMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invokeMock(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

describe('fetchMaintenanceAccess', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('allows everyone when maintenance is off in the database', async () => {
    invokeMock.mockResolvedValue({ data: { success: true, maintenance: false, bypass: true }, error: null })

    await expect(fetchMaintenanceAccess()).resolves.toEqual({
      maintenance: false,
      bypass: true,
      unavailable: false,
    })
  })

  it('blocks visitors when maintenance is on and bypass is false', async () => {
    invokeMock.mockResolvedValue({ data: { success: true, maintenance: true, bypass: false }, error: null })

    const snapshot = await fetchMaintenanceAccess()
    expect(isSiteAccessible(snapshot)).toBe(false)
  })

  it('allows whitelisted visitors during maintenance', async () => {
    invokeMock.mockResolvedValue({ data: { success: true, maintenance: true, bypass: true }, error: null })

    const snapshot = await fetchMaintenanceAccess()
    expect(isSiteAccessible(snapshot)).toBe(true)
  })

  it('fails open when the edge function is unavailable', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    const snapshot = await fetchMaintenanceAccess()
    expect(snapshot).toEqual({
      maintenance: false,
      bypass: true,
      unavailable: true,
    })
    expect(isSiteAccessible(snapshot)).toBe(true)
  })
})
