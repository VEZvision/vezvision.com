import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { revealImmediately, scheduleReveal } from '@/reveal/revealScheduler';
import type { RevealOptions } from '@/reveal/types';

export function useRevealInView<T extends HTMLElement>({
  once = true,
  amount = 0.12,
  rootMargin = '0px 0px -4% 0px',
}: RevealOptions = {}) {
  const reducedMotion = useReducedMotion();
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;

    if (reducedMotion) {
      revealImmediately(node);
      return;
    }

    let revealed = false;

    const markVisible = () => {
      if (revealed) return;
      revealed = true;
      scheduleReveal(node);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          markVisible();
          if (once) observer.disconnect();
        } else if (!once) {
          revealed = false;
          node.classList.remove('vez-reveal--in');
        }
      },
      { threshold: amount, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [amount, node, once, reducedMotion, rootMargin]);

  return { ref };
}
