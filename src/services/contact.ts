import { supabase } from '@/lib/supabase'

export interface ContactSubmissionPayload {
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  language: 'pl' | 'en'
}

export type ContactFormField = 'fullName' | 'email' | 'phone' | 'subject' | 'message' | 'form'

interface ContactSubmissionResult {
  success?: boolean
  error?: string
  field?: string
}

export class ContactFormError extends Error {
  readonly field?: ContactFormField

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ContactFormError'
    this.field = mapContactField(field)
  }
}

function mapContactField(field?: string): ContactFormField | undefined {
  switch (field) {
    case 'full_name':
      return 'fullName'
    case 'email':
      return 'email'
    case 'phone':
      return 'phone'
    case 'subject':
      return 'subject'
    case 'message':
      return 'message'
    case 'form':
      return 'form'
    default:
      return undefined
  }
}

export async function submitContactForm(payload: ContactSubmissionPayload): Promise<void> {
  const { data, error } = await supabase.functions.invoke('submit-contact', {
    body: payload,
  })

  if (error) {
    throw new ContactFormError(error.message || 'Contact form submission failed')
  }

  const result = data as ContactSubmissionResult | null
  if (result && result.success === false) {
    throw new ContactFormError(
      result.error || 'Contact form submission failed',
      result.field,
    )
  }
}
