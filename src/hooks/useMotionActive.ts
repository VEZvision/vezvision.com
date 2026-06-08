import { useCallback, useEffect, useState } from 'react';

type MotionActiveOptions = {
  rootMargin?: string;
  threshold?: number;
  /** When true (default), decorative motion stays on after first enter — no flicker on scroll-back. */
  once?: boolean;
};

export function useMotionActive<T extends HTMLElement>({
  rootMargin = '720px 0px 240px 0px',
  threshold = 0,
  once = true,
}: MotionActiveOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [active, setActive] = useState(false);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;

    const isNearViewport = () => {
      const rect = node.getBoundingClientRect();
      return rect.top < window.innerHeight + 720 && rect.bottom > -240;
    };

    if (isNearViewport()) {
      setActive(true);
      if (once) return;
    }

    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setActive(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, once, rootMargin, threshold]);

  return { ref, active };
}
