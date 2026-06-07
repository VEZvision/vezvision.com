import { useCallback, useEffect, useState } from 'react';

type MotionActiveOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useMotionActive<T extends HTMLElement>({
  rootMargin = '640px 0px',
  threshold = 0,
}: MotionActiveOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [active, setActive] = useState(false);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(Boolean(entry?.isIntersecting));
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, rootMargin, threshold]);

  return { ref, active };
}
