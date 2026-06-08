import { useCallback, useEffect, useRef } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerRevealElement, revealImmediately } from '@/reveal/revealRegistry';
import type { RevealOptions } from '@/reveal/types';

/** @deprecated rootMargin/amount are handled by the shared registry. */
export function useRevealInView<T extends HTMLElement>({
  once = true,
}: RevealOptions = {}) {
  const reducedMotion = useReducedMotion();
  const nodeRef = useRef<T | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((element: T | null) => {
    nodeRef.current = element;
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    cleanupRef.current?.();

    if (reducedMotion) {
      revealImmediately(node);
      return;
    }

    cleanupRef.current = registerRevealElement(node, { once });

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [once, reducedMotion]);

  return { ref };
}
