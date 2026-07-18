import type { LenisOptions } from "lenis";

export type ScrollMode = "native" | "lenis";

const LENIS_FLAG = import.meta.env.VITE_ENABLE_SMOOTH_SCROLL;

/** Smooth scrolling stays enabled by default; deployments can opt out explicitly. */
export function isLenisRequested(): boolean {
  return LENIS_FLAG !== "false";
}

export function shouldUseNativeScroll(): boolean {
  if (typeof window === "undefined") return true;
  if (!isLenisRequested()) return true;

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const SCROLL_IDLE_MS = 120;

export function getLenisOptions(): LenisOptions {
  return {
    autoRaf: true,
    lerp: 0.11,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoResize: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    prevent: (node: Element) => node.hasAttribute("data-lenis-prevent"),
  };
}
