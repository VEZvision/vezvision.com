import { test, expect } from '@playwright/test'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const liveEnabled = process.env.E2E_LIVE_SUPABASE === '1'

test.describe('live Supabase (optional)', () => {
  test.skip(
    !liveEnabled || !supabaseUrl || !anonKey,
    'Set E2E_LIVE_SUPABASE=1 with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
  )

  test('public settings REST is reachable', async ({ request }) => {
    const response = await request.get(
      `${supabaseUrl}/rest/v1/vv_site_settings?select=key&limit=1`,
      {
        headers: {
          apikey: anonKey!,
          Authorization: `Bearer ${anonKey!}`,
        },
      },
    )

    expect(response.ok()).toBeTruthy()
  })
})
