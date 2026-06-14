import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReducedMotionProvider } from '@/contexts/ReducedMotionContext'
import { useReducedMotion } from './useReducedMotion'

const originalMatchMedia = window.matchMedia

function mockReducedMotion(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_event: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_event: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  return {
    emit(nextMatches: boolean) {
      for (const listener of listeners) {
        listener({ matches: nextMatches } as MediaQueryListEvent)
      }
    },
  }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReducedMotionProvider>{children}</ReducedMotionProvider>
)

describe('useReducedMotion', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
  })

  it('reads prefers-reduced-motion instead of pointer type', () => {
    mockReducedMotion(true)

    const { result } = renderHook(() => useReducedMotion(), { wrapper })

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', async () => {
    const media = mockReducedMotion(false)
    const { result } = renderHook(() => useReducedMotion(), { wrapper })

    expect(result.current).toBe(false)

    act(() => {
      media.emit(true)
    })

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})
