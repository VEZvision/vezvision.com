import type { LenisOptions } from 'lenis';

export type ScrollMode = 'native' | 'lenis';

const LENIS_FLAG = import.meta.env.VITE_ENABLE_SMOOTH_SCROLL;

/** Lenis is opt-in — native scroll is smoother on long pages unless explicitly enabled. */
export function isLenisRequested(): boolean {
  return LENIS_FLAG === 'true';
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
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,
  autoResize: true,
  stopInertiaOnNavigate: true,
  prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
};
