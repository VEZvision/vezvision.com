import { describe, expect, it, vi } from 'vitest'

import { ContactFormError, submitContactForm } from './contact'

const invokeMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invokeMock(...args),
    },
  },
}))

describe('submitContactForm', () => {
  it('maps server field errors to ContactFormError', async () => {
    invokeMock.mockResolvedValue({
      data: { success: false, error: 'Podaj poprawny numer telefonu.', field: 'phone' },
      error: null,
    })

    await expect(
      submitContactForm({
        full_name: 'Jan Kowalski',
        email: 'jan@example.com',
        phone: 'invalid',
        subject: 'Test',
        message: 'Hello world!',
        language: 'pl',
      }),
    ).rejects.toMatchObject({
      name: 'ContactFormError',
      message: 'Podaj poprawny numer telefonu.',
      field: 'phone',
    })
  })
})

describe('ContactFormError', () => {
  it('normalizes snake_case field names from the API', () => {
    const error = new ContactFormError('Invalid', 'full_name')
    expect(error.field).toBe('fullName')
  })

  it('maps generic form errors without a field key', () => {
    const error = new ContactFormError('Invalid payload', 'form')
    expect(error.field).toBe('form')
  })
})
