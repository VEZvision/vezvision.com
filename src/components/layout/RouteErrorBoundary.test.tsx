import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import RouteErrorBoundary from './RouteErrorBoundary'

vi.mock('@/components/layout/PublicChrome', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-chrome">{children}</div>
  ),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useRouteError: () => new Error('unit test probe'),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/hooks/useLanguage', () => ({
  useLanguageContext: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'routeError.title': 'Coś poszło nie tak',
        'routeError.message': 'Spróbuj ponownie.',
        'routeError.home': 'Strona główna',
        'routeError.retry': 'Odśwież',
        'routeError.unknown': 'Nieznany błąd',
      }
      return map[key] ?? key
    },
    language: 'pl' as const,
  }),
}))

describe('RouteErrorBoundary', () => {
  it('renders recovery UI inside public chrome', () => {
    render(<RouteErrorBoundary />)

    expect(screen.getByTestId('public-chrome')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Coś poszło nie tak' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Strona główna' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Odśwież' })).toBeInTheDocument()
  })
})
