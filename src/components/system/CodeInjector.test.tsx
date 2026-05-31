import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import CodeInjector from './CodeInjector'

const useSettingsMock = vi.fn()

vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => useSettingsMock(),
}))

describe('CodeInjector', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="cms-test"], script, style, [data-vez-cms-head]').forEach((node) => node.remove())
    document.body.querySelectorAll('[data-cms-test], [data-vez-cms-body], script').forEach((node) => node.remove())
    useSettingsMock.mockReset()
  })

  it('replaces head markup when CMS settings change', async () => {
    useSettingsMock.mockReturnValue({
      code: {
        head: '<meta name="cms-test" content="v1">',
        body: '',
      },
    })

    const { rerender } = render(<CodeInjector />)

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="cms-test"]')?.getAttribute('content')).toBe('v1')
    })

    useSettingsMock.mockReturnValue({
      code: {
        head: '<meta name="cms-test" content="v2">',
        body: '',
      },
    })

    rerender(<CodeInjector />)

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="cms-test"]')?.getAttribute('content')).toBe('v2')
    })
    expect(document.head.querySelectorAll('meta[name="cms-test"]')).toHaveLength(1)
  })

  it('injects safe head metadata and strips executable tags', async () => {
    useSettingsMock.mockReturnValue({
      code: {
        head: '<meta name="cms-test" content="ok"><script src="https://evil.example/x.js"></script><style>body{display:none}</style>',
        body: '',
      },
    })

    render(<CodeInjector />)

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="cms-test"]')?.getAttribute('content')).toBe('ok')
    })
    expect(document.head.querySelector('script')).toBeNull()
    expect(document.head.querySelector('style')).toBeNull()
  })

  it('injects sanitized body markup without scripts', async () => {
    useSettingsMock.mockReturnValue({
      code: {
        head: '',
        body: '<div data-cms-test="body">Hello</div><script>window.__xss = true</script>',
      },
    })

    render(<CodeInjector />)

    await waitFor(() => {
      expect(document.body.querySelector('[data-cms-test="body"]')).toHaveTextContent('Hello')
    })
    expect(document.body.querySelector('script')).toBeNull()
  })
})
