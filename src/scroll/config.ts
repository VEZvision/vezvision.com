import type { LenisOptions } from 'lenis';

export type ScrollMode = 'native' | 'lenis';

const LENIS_FLAG = import.meta.env.VITE_ENABLE_SMOOTH_SCROLL;

/** Lenis is on by default on desktop; set VITE_ENABLE_SMOOTH_SCROLL=false for native scroll. */
export function isLenisRequested(): boolean {
  return LENIS_FLAG !== 'false';
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

export function getLenisOptions(): LenisOptions {
  const eventsTarget =
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>('[data-lenis-events]') ?? undefined
      : undefined;

  return {
    autoRaf: true,
    lerp: 0.12,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoResize: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    eventsTarget,
    prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
  };
}
