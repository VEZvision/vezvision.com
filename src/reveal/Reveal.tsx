import { useCallback, useEffect, useRef, type CSSProperties } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerRevealElement, revealImmediately } from '@/reveal/revealRegistry';
import type { RevealProps } from '@/reveal/types';

/**
 * Reveal wrapper — DOM-only activation via `data-revealed` (no React state).
 * Design/animations live in reveal.css; the registry prefetches ~320px early.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  stagger = false,
  once = true,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
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

  const classes = ['vez-reveal', stagger ? 'vez-stagger-parent' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setRef}
      className={classes}
      style={{ '--vez-reveal-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
