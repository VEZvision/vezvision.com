import { useCallback, useEffect, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { subscribeScroll } from '@/scroll/scrollBus';
import type { RevealOptions } from '@/reveal/types';

function isNodeInView(node: HTMLElement, amount: number): boolean {
  const rect = node.getBoundingClientRect();
  const viewport = window.innerHeight;
  const visibleHeight = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0);
  const ratio = visibleHeight / Math.max(rect.height, 1);
  return ratio >= amount && rect.bottom > 0 && rect.top < viewport;
}

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

    let revealed = false;

    const markVisible = () => {
      if (revealed) return true;
      revealed = true;
      setVisible(true);
      return true;
    };

    if (isNodeInView(node, amount) && markVisible() && once) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          markVisible();
          if (once) observer.disconnect();
        } else if (!once) {
          revealed = false;
          setVisible(false);
        }
      },
      { threshold: amount, rootMargin },
    );

    observer.observe(node);

    const unsubscribeScroll = subscribeScroll(() => {
      if (isNodeInView(node, amount) && markVisible() && once) {
        observer.disconnect();
        unsubscribeScroll();
      }
    });

    return () => {
      observer.disconnect();
      unsubscribeScroll();
    };
  }, [amount, node, once, reducedMotion, rootMargin]);

  return { ref, visible: visible || reducedMotion };
}
