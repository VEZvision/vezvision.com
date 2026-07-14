import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/** PostgREST gateway URL. The client is used only as a REST/RPC transport. */
export const apiUrl = import.meta.env.VITE_API_URL
export const publicAssetsUrl = import.meta.env.VITE_PUBLIC_ASSETS_URL
const apiAnonKey = import.meta.env.VITE_API_ANON_KEY

let client: SupabaseClient<Database> | null = null
let clientPromise: Promise<SupabaseClient<Database>> | null = null

export async function getSupabase(): Promise<SupabaseClient<Database>> {
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
