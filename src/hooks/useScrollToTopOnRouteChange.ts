import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { scrollToTopInstant } from '@/utils/smoothScrolling'

export function useScrollToTopOnRouteChange() {
  const location = useLocation()

  useEffect(() => {
    scrollToTopInstant()
  }, [location.pathname])
}
