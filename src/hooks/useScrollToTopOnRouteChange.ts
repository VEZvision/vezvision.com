import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { refreshSmoothScrolling, scrollToTopInstant } from '@/utils/smoothScrolling'

export function useScrollToTopOnRouteChange() {
  const location = useLocation()

  useEffect(() => {
    scrollToTopInstant()

    const rafId = requestAnimationFrame(() => {
      refreshSmoothScrolling()
    })
    const timeoutId = window.setTimeout(() => {
      refreshSmoothScrolling()
    }, 400)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [location.pathname])
}
