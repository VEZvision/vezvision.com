import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
} from 'react';

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
  amount = 0,
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

function isStaggerItem(element: ReactElement): element is ReactElement<StaggerItemProps> {
  return element.type === StaggerItem;
}

/** Walk the tree so StaggerItems nested in layout wrappers still get unique indices. */
function assignStaggerIndices(
  children: ReactNode,
  startIndex = 0,
): { children: ReactNode; nextIndex: number } {
  let index = startIndex;

  const mapped = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    if (isStaggerItem(child)) {
      const el = cloneElement(child, { staggerIndex: index });
      index += 1;
      return el;
    }

    if (child.props.children != null) {
      const nested = assignStaggerIndices(child.props.children, index);
      index = nested.nextIndex;
      return cloneElement(child, undefined, nested.children);
    }

    return child;
  });

  return { children: mapped, nextIndex: index };
}

export function StaggerReveal({
  children,
  className = '',
  once = true,
  amount = 0,
  rootMargin,
}: StaggerRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const { children: staggeredChildren } = assignStaggerIndices(children);

  return (
    <Reveal
      className={className}
      stagger
      once={once}
      amount={amount}
      rootMargin={rootMargin}
    >
      {staggeredChildren}
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
