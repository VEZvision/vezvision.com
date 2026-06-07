import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { RevealOptions } from '@/reveal/types';

export function useRevealInView<T extends HTMLElement>({
  once = true,
  amount = 0.12,
  rootMargin = '0px 0px -4% 0px',
}: RevealOptions = {}) {
  const reducedMotion = useReducedMotion();
  const [node, setNode] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: amount, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [amount, node, once, reducedMotion, rootMargin]);

  return { ref, visible: visible || reducedMotion };
}
