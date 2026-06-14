import { useEffect, useRef, useState } from 'react'
import { getScrollY, subscribeScroll } from '@/scroll'

export function useNavbarScroll(threshold = 48) {
  const [isScrolled, setIsScrolled] = useState(false)
  const isScrolledRef = useRef(false)

  useEffect(() => {
    let frameId: number | null = null

    const updateScrolled = () => {
      frameId = null
      const next = getScrollY() > threshold
      if (next !== isScrolledRef.current) {
        isScrolledRef.current = next
        setIsScrolled(next)
      }
    }

    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateScrolled)
    }

    updateScrolled()
    const unsubscribe = subscribeScroll(handleScroll)

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      unsubscribe()
    }
  }, [threshold])

  return isScrolled
}
