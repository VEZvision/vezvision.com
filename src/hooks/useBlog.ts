import { useState, useEffect, useCallback, useRef } from 'react'
import { logError } from '@/lib/logger'
import {
  getPublishedPostBySlug,
  incrementBlogViewCount,
  listPublishedBlogContent,
  type BlogCategory,
  type BlogPostWithDetails,
} from '@/services/blog'

export type { BlogCategory, BlogPostWithDetails } from '@/services/blog'

export function useBlog() {
  const [posts, setPosts] = useState<BlogPostWithDetails[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await listPublishedBlogContent(controller.signal)
        setPosts(result.posts)
        setCategories(result.categories)
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.message === 'Request aborted')) {
          return
        }
        logError('useBlog.load', err)
        setPosts([])
        setCategories([])
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania postów')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    run()

    return () => controller.abort()
  }, [refreshKey])

  const getPostTranslation = useCallback((post: BlogPostWithDetails, language: 'pl' | 'en') => {
    return post.translations.find((translation) => translation.language === language) || post.translations[0]
  }, [])

  const getFeaturedPosts = useCallback(() => {
    return posts.filter((post) => post.is_featured)
  }, [posts])

  const getPostsByCategory = useCallback((categoryId: string) => {
    return posts.filter((post) => post.categories.some((category) => category.id === categoryId))
  }, [posts])

  const getRecentPosts = useCallback((limit: number = 5) => {
    return posts.slice(0, limit)
  }, [posts])

  const getPostBySlug = useCallback((slug: string) => {
    return posts.find((post) => post.slug === slug)
  }, [posts])

  const incrementingRef = useRef<Set<string>>(new Set())

  const incrementViewCount = useCallback(async (slug: string) => {
    const storageKey = `vv-blog-view:${slug}`
    const canUseSessionStorage = typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'

    if (canUseSessionStorage && window.sessionStorage.getItem(storageKey)) return
    if (incrementingRef.current.has(slug)) return

    incrementingRef.current.add(slug)
    if (canUseSessionStorage) window.sessionStorage.setItem(storageKey, '1')

    const success = await incrementBlogViewCount(slug)
    incrementingRef.current.delete(slug)

    if (!success && canUseSessionStorage) window.sessionStorage.removeItem(storageKey)
  }, [])

  const fetchPostBySlug = useCallback(async (slug: string, signal?: AbortSignal): Promise<BlogPostWithDetails | null> => {
    try {
      return await getPublishedPostBySlug(slug, signal)
    } catch (err) {
      if (err instanceof Error && err.message === 'Request aborted') return null
      logError('useBlog.getBySlug', err)
      return null
    }
  }, [])

  const refreshPosts = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return {
    posts,
    categories,
    loading,
    error,
    getPostTranslation,
    getFeaturedPosts,
    getPostsByCategory,
    getRecentPosts,
    getPostBySlug,
    fetchPostBySlug,
    incrementViewCount,
    refreshPosts,
  }
}
