import { afterEach, describe, expect, it, vi } from 'vitest'

import { unregisterLegacyServiceWorkers } from './serviceWorkerCleanup'

const originalServiceWorker = navigator.serviceWorker

describe('unregisterLegacyServiceWorkers', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalServiceWorker,
    })
    vi.restoreAllMocks()
  })

  it('unregisters every existing service worker registration', async () => {
    const firstUnregister = vi.fn().mockResolvedValue(true)
    const secondUnregister = vi.fn().mockResolvedValue(true)
    const getRegistrations = vi.fn().mockResolvedValue([
      { unregister: firstUnregister },
      { unregister: secondUnregister },
    ])

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations },
    })

    await unregisterLegacyServiceWorkers()

    expect(getRegistrations).toHaveBeenCalledTimes(1)
    expect(firstUnregister).toHaveBeenCalledTimes(1)
    expect(secondUnregister).toHaveBeenCalledTimes(1)
  })

  it('does not throw when cleanup fails', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: vi.fn().mockRejectedValue(new Error('blocked')) },
    })

    await expect(unregisterLegacyServiceWorkers()).resolves.toBeUndefined()
  })
})
