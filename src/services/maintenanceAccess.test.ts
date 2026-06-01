import { beforeEach, describe, expect, it, vi } from 'vitest'

import { checkMaintenanceBypass } from './maintenanceAccess'

const invokeMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invokeMock(...args),
    },
  },
}))

describe('checkMaintenanceBypass', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('allows access when maintenance is disabled on the edge', async () => {
    invokeMock.mockResolvedValue({ data: { maintenance: false, bypass: true }, error: null })

    await expect(checkMaintenanceBypass()).resolves.toBe(true)
    expect(invokeMock).toHaveBeenCalledWith('check-maintenance-access')
  })

  it('returns bypass flag when maintenance is active', async () => {
    invokeMock.mockResolvedValue({ data: { maintenance: true, bypass: true }, error: null })

    await expect(checkMaintenanceBypass()).resolves.toBe(true)
  })

  it('blocks access when the edge call fails', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('network') })

    await expect(checkMaintenanceBypass()).resolves.toBe(false)
  })
})
