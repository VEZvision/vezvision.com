import { logError } from '@/lib/logger'
import { getSupabase } from '@/lib/supabase'
export interface CodeInjectionSettings {
  head: string
  body: string
}

interface CodeInjectionResponse {
  success?: boolean
  head?: string
  body?: string
}

const EMPTY_CODE: CodeInjectionSettings = {
  head: '',
  body: '',
}

export async function fetchCodeInjection(): Promise<CodeInjectionSettings> {
  try {
    const supabase = await getSupabase()
    const response = await supabase.functions.invoke<CodeInjectionResponse>('get-code-injection')

    if (response.error || response.data?.success === false) {
      if (response.error) logError('codeInjection.invoke', response.error)
      return EMPTY_CODE
    }

    const data = response.data
    return {
      head: typeof data?.head === 'string' ? data.head : '',
      body: typeof data?.body === 'string' ? data.body : '',
    }
  } catch (error) {
    logError('codeInjection.fetch', error)
    return EMPTY_CODE
  }
}
