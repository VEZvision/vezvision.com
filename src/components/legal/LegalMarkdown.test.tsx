import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LegalMarkdown from './LegalMarkdown'

vi.mock('@/hooks/useLanguage', () => ({
  useLanguageContext: () => ({ language: 'pl' as const }),
}))

describe('LegalMarkdown', () => {
  it('renders safe external links', () => {
    render(<LegalMarkdown content="[Docs](https://example.com/docs)" />)
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', 'https://example.com/docs')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('localizes internal links', () => {
    render(<LegalMarkdown content="[Privacy](/privacy-policy)" />)
    const link = screen.getByRole('link', { name: 'Privacy' })
    expect(link).toHaveAttribute('href', '/pl/privacy-policy')
  })

  it('blocks javascript links', () => {
    render(<LegalMarkdown content="[Click me](javascript:alert(1))" />)
    expect(screen.queryByRole('link', { name: 'Click me' })).toBeNull()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('blocks data links', () => {
    render(<LegalMarkdown content="[Payload](data:text/html,<script>alert(1)</script>)" />)
    expect(screen.queryByRole('link', { name: 'Payload' })).toBeNull()
  })
})
