import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchMaintenanceAccess,
  fetchMaintenanceEnabledFromDb,
  isSiteAccessible,
} from './maintenanceAccess'

const invokeMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => Promise.resolve({
    functions: {
      invoke: (...args: unknown[]) => invokeMock(...args) as Promise<{ data: unknown; error: unknown }>,
    },
    from: (...args: unknown[]) => fromMock(...args) as {
      select: () => {
        eq: () => {
          eq: () => {
            maybeSingle: () => Promise<{ data: unknown; error: unknown }>
          }
        }
      }
    },
  }),
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

function mockMaintenanceDb(enabled: boolean) {
  fromMock.mockReturnValue({
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: { value: { enabled } },
              error: null,
            }),
        }),
      }),
    }),
  })
}

describe('fetchMaintenanceEnabledFromDb', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('reads the public maintenance_mode flag from the database', async () => {
    mockMaintenanceDb(true)
    await expect(fetchMaintenanceEnabledFromDb()).resolves.toBe(true)
  })
})

describe('fetchMaintenanceAccess', () => {
  beforeEach(() => {
    invokeMock.mockReset()
    fromMock.mockReset()
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

  it('fails closed when the edge function is unavailable and db state is unknown', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    const snapshot = await fetchMaintenanceAccess()
    expect(snapshot).toEqual({
      maintenance: false,
      bypass: true,
      unavailable: true,
    })
    expect(isSiteAccessible(snapshot, false, null)).toBe(false)
  })

  it('allows access when edge is unavailable, db confirms maintenance is off', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    const snapshot = await fetchMaintenanceAccess()
    expect(isSiteAccessible(snapshot, false, false)).toBe(true)
  })

  it('fails closed when edge is unavailable but CMS maintenance is enabled', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    const snapshot = await fetchMaintenanceAccess()
    expect(isSiteAccessible(snapshot, true, null)).toBe(false)
    expect(isSiteAccessible(snapshot, true, true)).toBe(false)
  })

  it('fails closed when edge is unavailable, settings are off, but db confirms maintenance', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    const snapshot = await fetchMaintenanceAccess()
    expect(isSiteAccessible(snapshot, false, true)).toBe(false)
  })

  it('honours maintenance responses even when success is false', async () => {
    invokeMock.mockResolvedValue({
      data: { success: false, maintenance: true, bypass: false },
      error: null,
    })

    const snapshot = await fetchMaintenanceAccess()
    expect(snapshot).toEqual({
      maintenance: true,
      bypass: false,
      unavailable: false,
    })
    expect(isSiteAccessible(snapshot)).toBe(false)
  })
})
