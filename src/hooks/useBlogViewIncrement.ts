import { useCallback, useRef } from 'react'

import { incrementBlogViewCount } from '@/services/blog'

export function useBlogViewIncrement() {
  const incrementingRef = useRef<Set<string>>(new Set())

  return useCallback(async (slug: string) => {
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
}
