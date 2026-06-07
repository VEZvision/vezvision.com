import { ReactNode, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** @deprecated Opacity-only reveals ignore vertical offset. */
  y?: number;
  /** @deprecated Opacity-only reveals ignore duration. */
  duration?: number;
  once?: boolean;
  amount?: number;
}

interface CssRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
  stagger?: boolean;
}

function CssReveal({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.15,
  stagger = false,
}: CssRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
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
      { threshold: amount, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, once]);

  const classes = [
    'vez-reveal',
    visible ? 'vez-reveal--in' : '',
    stagger ? 'vez-stagger-parent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ '--vez-reveal-delay': `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

const SectionReveal = ({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.15,
}: SectionRevealProps) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <CssReveal className={className} delay={delay} once={once} amount={amount}>
      {children}
    </CssReveal>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
}

const StaggerReveal = ({
  children,
  className = '',
  once = true,
  amount = 0.1,
}: StaggerContainerProps) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <CssReveal className={className} once={once} amount={amount} stagger>
      {children}
    </CssReveal>
  );
};

const StaggerItem = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`vez-stagger-item${className ? ` ${className}` : ''}`}>{children}</div>;
};

export { SectionReveal, StaggerReveal, StaggerItem };
export default SectionReveal;
