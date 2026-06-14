import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient<Database> | null = null
let clientPromise: Promise<SupabaseClient<Database>> | null = null

export async function getSupabase(): Promise<SupabaseClient<Database>> {
  if (client) return client

  if (!clientPromise) {
    clientPromise = (async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
      }

      const { createClient } = await import('@supabase/supabase-js')
      client = createClient<Database>(supabaseUrl, supabaseAnonKey)
      return client
    })()
  }

  return clientPromise
}

/** Ensures client is initialized (e.g. before Realtime subscriptions). */
export async function ensureSupabase(): Promise<SupabaseClient<Database>> {
  return getSupabase()
}
