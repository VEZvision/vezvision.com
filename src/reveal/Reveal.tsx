import { type CSSProperties } from 'react';

import { useRevealInView } from '@/reveal/useRevealInView';
import type { RevealProps } from '@/reveal/types';

export function Reveal({
  children,
  className = '',
  delay = 0,
  stagger = false,
  once = true,
  amount = 0.12,
  rootMargin,
}: RevealProps) {
  const { ref } = useRevealInView<HTMLDivElement>({ once, amount, rootMargin });

  const classes = ['vez-reveal', stagger ? 'vez-stagger-parent' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ '--vez-reveal-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
