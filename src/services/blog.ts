import { supabase, supabaseAnonKey, supabaseUrl } from '@/lib/supabase'
import { logError } from '@/lib/logger'
import { isAbortLikeError } from './utils'
import { BlogPost, BlogPostTranslation } from '@/types/blog'

export interface BlogCategory {
  id: string
  name: string
  color: string
  created_at: string
}

export interface BlogPostWithDetails extends BlogPost {
  translations: BlogPostTranslation[]
  categories: BlogCategory[]
}

interface DBPostCategory {
  vv_blog_categories?: {
    id: string
    slug: string
    name_pl?: string
    color?: string
    created_at: string
  }
}

interface DBBlogPost {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  featured_image: string | null
  featured: boolean
  created_at: string
  updated_at: string
  views_count: number
  reading_time?: number
  title_pl?: string
  title_en?: string
  excerpt_pl?: string
  excerpt_en?: string
  content_pl?: string
  content_en?: string
  meta_title_pl?: string
  meta_title_en?: string
  meta_desc_pl?: string
  meta_desc_en?: string
  tags_pl?: string[]
  tags_en?: string[]
  vv_blog_post_categories?: DBPostCategory[]
}

interface DBBlogCategory {
  id: string
  slug: string
  name_pl?: string
  color?: string
  created_at: string
}

const mapCategoryFromDB = (category: DBBlogCategory): BlogCategory => ({
  id: category.id,
  name: category.name_pl || category.slug,
  color: category.color || '#000000',
  created_at: category.created_at,
})

const mapPostFromDB = (post: DBBlogPost): BlogPostWithDetails => {
  const translations: BlogPostTranslation[] = [
    {
      id: `${post.id}-pl`,
      post_id: post.id,
      language: 'pl',
      title: post.title_pl || '',
      excerpt: post.excerpt_pl || '',
      content: post.content_pl || '',
      seo_title: post.meta_title_pl,
      seo_description: post.meta_desc_pl,
      seo_keywords: post.tags_pl,
    },
    {
      id: `${post.id}-en`,
      post_id: post.id,
      language: 'en',
      title: post.title_en || '',
      excerpt: post.excerpt_en || '',
      content: post.content_en || '',
      seo_title: post.meta_title_en,
      seo_description: post.meta_desc_en,
      seo_keywords: post.tags_en,
    },
  ]

  const categories: BlogCategory[] = (post.vv_blog_post_categories || [])
    .map((postCategory) => postCategory.vv_blog_categories)
    .filter((category): category is NonNullable<typeof category> => Boolean(category))
    .map((category) => mapCategoryFromDB(category))

  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    published_at: post.published_at,
    featured_image: post.featured_image,
    is_featured: post.featured,
    created_at: post.created_at,
    updated_at: post.updated_at,
    views_count: post.views_count || 0,
    reading_time: post.reading_time,
    translations,
    categories,
  }
}

export async function listPublishedBlogContent(signal?: AbortSignal): Promise<{
  posts: BlogPostWithDetails[]
  categories: BlogCategory[]
}> {
  try {
    const { data: postsData, error: postsError } = await supabase
      .from('vv_blog_posts')
      .select('*, vv_blog_post_categories(vv_blog_categories(*))')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(100)
      .abortSignal(signal)

    if (postsError) throw postsError

    const { data: rawCategories, error: categoriesError } = await supabase
      .from('vv_blog_categories')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
      .abortSignal(signal)

    if (categoriesError) throw categoriesError

    return {
      posts: (postsData || []).map((post) => mapPostFromDB(post as DBBlogPost)),
      categories: (rawCategories || []).map((category) => mapCategoryFromDB(category as DBBlogCategory)),
    }
  } catch (error) {
    if (isAbortLikeError(error)) throw new Error('Request aborted')
    logError('blog.list', error)
    throw new Error('Failed to list blog content')
  }
}

export async function getPublishedPostBySlug(slug: string, signal?: AbortSignal): Promise<BlogPostWithDetails | null> {
  try {
    const { data: post, error: postError } = await supabase
      .from('vv_blog_posts')
      .select('*, vv_blog_post_categories(vv_blog_categories(*))')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .abortSignal(signal)
      .single()

    if (postError) throw postError
    if (!post) return null

    return mapPostFromDB(post as DBBlogPost)
  } catch (error) {
    if (isAbortLikeError(error)) throw new Error('Request aborted')
    logError('blog.getBySlug', error)
    return null
  }
}

export async function incrementBlogViewCount(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/vv_blog_increment_views`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_slug: slug }),
      keepalive: true,
    })

    return response.ok
  } catch {
    return false
  }
}
