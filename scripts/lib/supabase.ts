import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const apiUrl = process.env.VITE_API_URL
const apiAnonKey = process.env.VITE_API_ANON_KEY

let client: SupabaseClient<Database> | null = null
let clientPromise: Promise<SupabaseClient<Database>> | null = null

export async function getScriptSupabase(): Promise<SupabaseClient<Database>> {
  if (client) return client

  if (!clientPromise) {
    clientPromise = (async () => {
      if (!apiUrl || !apiAnonKey) {
        throw new Error('Missing VITE_API_URL or VITE_API_ANON_KEY environment variables')
      }

      const { createClient } = await import('@supabase/supabase-js')
      client = createClient<Database>(apiUrl, apiAnonKey)
      return client
    })()
  }

  return clientPromise
}
