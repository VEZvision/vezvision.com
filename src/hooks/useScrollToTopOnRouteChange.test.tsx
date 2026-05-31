import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useScrollToTopOnRouteChange } from '@/hooks/useScrollToTopOnRouteChange'
import { scrollToTopInstant } from '@/utils/smoothScrolling'

vi.mock('@/utils/smoothScrolling', () => ({
  scrollToTopInstant: vi.fn(),
}))

function TestLayout() {
  useScrollToTopOnRouteChange()

  return (
    <div>
      <Link to="/about">Go to about</Link>
      <Outlet />
    </div>
  )
}

describe('useScrollToTopOnRouteChange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('scrolls to top on initial render and route changes', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<TestLayout />}>
            <Route path="/" element={<div>Home page</div>} />
            <Route path="/about" element={<div>About page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(scrollToTopInstant).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('link', { name: 'Go to about' }))

    await waitFor(() => {
      expect(screen.getByText('About page')).toBeInTheDocument()
    })

    expect(scrollToTopInstant).toHaveBeenCalledTimes(2)
  })
})
