import { useEffect, useRef, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

const DEFAULT_ROOT_MARGIN = "500px 0px";

declare global {
  interface Window {
    __VEZ_PRERENDER__?: boolean;
    __VEZ_HYDRATING_PRERENDER__?: boolean;
  }
}

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
  // Lazy init reads pre-render flag during initial hydration so initial
  // render = children (matching pre-rendered DOM). Otherwise React 19
  // hydration patches children→placeholder→children, causing a flash.
  const [isRevealed, setIsRevealed] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.__VEZ_HYDRATING_PRERENDER__),
  );

  useEffect(() => {
    if (
      window.__VEZ_PRERENDER__ ||
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

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      ref={placeholderRef}
      className={className}
      style={isRevealed ? undefined : { minHeight, contain: "layout style" }}
      aria-hidden={isRevealed ? undefined : true}
    >
      {isRevealed ? children : null}
    </div>
  );
}
