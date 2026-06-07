import { Children, cloneElement, isValidElement, type CSSProperties } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Reveal } from '@/reveal/Reveal';
import type { RevealOptions, StaggerItemProps } from '@/reveal/types';

type SectionRevealProps = RevealOptions & {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** @deprecated Ignored — CSS reveal only uses opacity + translate. */
  y?: number;
  /** @deprecated Ignored — duration is controlled in reveal.css. */
  duration?: number;
};

export function SectionReveal({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.14,
  rootMargin,
}: SectionRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Reveal
      className={className}
      delay={delay}
      once={once}
      amount={amount}
      rootMargin={rootMargin}
    >
      {children}
    </Reveal>
  );
}

type StaggerRevealProps = RevealOptions & {
  children: React.ReactNode;
  className?: string;
};

export function StaggerReveal({
  children,
  className = '',
  once = true,
  amount = 0.1,
  rootMargin,
}: StaggerRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const items = Children.toArray(children);

  return (
    <Reveal
      className={className}
      stagger
      once={once}
      amount={amount}
      rootMargin={rootMargin}
    >
      {items.map((child, index) => {
        if (!isValidElement<StaggerItemProps>(child)) return child;
        return cloneElement(child, { staggerIndex: index });
      })}
    </Reveal>
  );
}

export function StaggerItem({
  children,
  className = '',
  staggerIndex = 0,
}: StaggerItemProps) {
  return (
    <div
      className={`vez-stagger-item${className ? ` ${className}` : ''}`}
      style={{ '--vez-stagger-i': staggerIndex } as CSSProperties}
    >
      {children}
    </div>
  );
}

export default SectionReveal;
