import { test, expect } from '@playwright/test'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const liveEnabled = process.env.E2E_LIVE_SUPABASE === '1'

const restHeaders = {
  apikey: anonKey!,
  Authorization: `Bearer ${anonKey!}`,
  'Content-Type': 'application/json',
}

test.describe('live Supabase (optional)', () => {
  test.skip(
    !liveEnabled || !supabaseUrl || !anonKey,
    'Set E2E_LIVE_SUPABASE=1 with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
  )

  test('public settings REST is reachable', async ({ request }) => {
    const response = await request.get(
      `${supabaseUrl}/rest/v1/vv_site_settings?select=key&limit=1`,
      { headers: restHeaders },
    )

    expect(response.ok()).toBeTruthy()
  })

  test('blog view counter edge function accepts slug', async ({ request }) => {
    const postsResponse = await request.get(
      `${supabaseUrl}/rest/v1/vv_blog_posts?select=slug&status=eq.published&limit=1`,
      { headers: restHeaders },
    )
    expect(postsResponse.ok()).toBeTruthy()

    const posts = await postsResponse.json() as Array<{ slug: string }>
    test.skip(posts.length === 0, 'No published posts on live project')

    const response = await request.post(`${supabaseUrl}/functions/v1/increment-blog-view`, {
      headers: restHeaders,
      data: { slug: posts[0].slug },
    })

    expect(response.ok()).toBeTruthy()
    const body = await response.json() as { success?: boolean }
    expect(body.success).toBe(true)
  })

  test('public FAQ items are readable', async ({ request }) => {
    const response = await request.get(
      `${supabaseUrl}/rest/v1/vv_faq_items?select=id,question_pl,is_active&is_active=eq.true&limit=5`,
      { headers: restHeaders },
    )

    expect(response.ok()).toBeTruthy()
    const items = await response.json() as unknown[]
    expect(Array.isArray(items)).toBeTruthy()
  })

  test('anon cannot call blog view RPC directly', async ({ request }) => {
    const response = await request.post(`${supabaseUrl}/rest/v1/rpc/vv_blog_increment_views`, {
      headers: restHeaders,
      data: { p_post_slug: 'test-slug', p_client_ip: '127.0.0.1' },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('published blog list respects schedule filter', async ({ request }) => {
    const now = new Date().toISOString()
    const response = await request.get(
      `${supabaseUrl}/rest/v1/vv_blog_posts?select=slug,published_at&status=eq.published&or=(published_at.is.null,published_at.lte.${now})&limit=5`,
      { headers: restHeaders },
    )

    expect(response.ok()).toBeTruthy()
  })
})
