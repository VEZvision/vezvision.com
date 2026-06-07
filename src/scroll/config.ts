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

export function getLenisOptions(): Omit<LenisOptions, 'wrapper' | 'content'> {
  return {
    autoRaf: true,
    lerp: 0.075,
    wheelMultiplier: 0.92,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoResize: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    eventsTarget: typeof document !== 'undefined' ? document.body : undefined,
    prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
  };
}
