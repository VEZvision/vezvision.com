import type { LenisOptions } from 'lenis';

export type ScrollMode = 'native' | 'lenis';

const LENIS_FLAG = import.meta.env.VITE_ENABLE_SMOOTH_SCROLL;

/** Lenis on by default on desktop; set VITE_ENABLE_SMOOTH_SCROLL=false to disable. */
export function isLenisRequested(): boolean {
  if (LENIS_FLAG === 'false') return false;
  return true;
}

export function shouldUseNativeScroll(): boolean {
  if (typeof window === 'undefined') return true;
  if (!isLenisRequested()) return true;

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const SCROLL_IDLE_MS = 150;

export const LENIS_OPTIONS: Omit<LenisOptions, 'wrapper' | 'content'> = {
  autoRaf: true,
  duration: 1.05,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1,
  touchMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,
  autoResize: true,
  stopInertiaOnNavigate: true,
  prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
};
