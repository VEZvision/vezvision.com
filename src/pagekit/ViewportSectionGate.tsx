import { useEffect, useRef, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

const DEFAULT_ROOT_MARGIN = "500px 0px";

export type ViewportSectionGateProps = {
  children: ReactNode;
  className?: string;
  minHeight?: string | undefined;
  rootMargin?: string;
};

export function ViewportSectionGate({
  children,
  className,
  minHeight = "50vh",
  rootMargin = DEFAULT_ROOT_MARGIN,
}: ViewportSectionGateProps) {
  const reducedMotion = useReducedMotion();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (
      reducedMotion ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      setIsRevealed(true);
      return;
    }

    const node = placeholderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin]);

  if (reducedMotion || isRevealed) {
    return <>{children}</>;
  }

  return (
    <div
      ref={placeholderRef}
      className={className}
      style={{
        minHeight,
        contain: "layout style",
      }}
      aria-hidden="true"
    />
  );
}
