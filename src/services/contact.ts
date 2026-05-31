import { supabase } from '@/lib/supabase'

export interface ContactSubmissionPayload {
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  language: 'pl' | 'en'
}

interface ContactSubmissionResult {
  success?: boolean
  error?: string
  field?: string
}

export async function submitContactForm(payload: ContactSubmissionPayload): Promise<void> {
  const { data, error } = await supabase.functions.invoke('submit-contact', {
    body: payload,
  })

  if (error) throw error

  const result = data as ContactSubmissionResult | null
  if (result && result.success === false) {
    throw new Error(result.error || 'Contact form submission failed')
  }
}
