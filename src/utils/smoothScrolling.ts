/**
 * Smooth scrolling powered by Lenis.
 *
 * Provides a cinematic, slow, silky-smooth scroll on desktop.
 * On mobile / touch devices Lenis runs in its default (non-smooth-touch)
 * mode so the OS native momentum scroll is preserved — no jank, no lag.
 */

import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

function shouldUseNativeScroll(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function tick(time: number): void {
  lenisInstance?.raf(time);
  rafId = requestAnimationFrame(tick);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export function initSmoothScrolling(): Lenis | null {
  if (lenisInstance) return lenisInstance;

  if (shouldUseNativeScroll()) {
    return null;
  }

  lenisInstance = new Lenis({
    lerp: 0.08,
    // Keep native momentum scroll on touch screens (iOS / Android).
    // syncTouch: false (default) means Lenis does NOT intercept touch events —
    // the OS handles them natively for best mobile feel.
    syncTouch: false,
    // Slightly soften mouse wheel input without adding expensive scroll handlers.
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
    // Allow inner scrollable areas to opt-out via data-lenis-prevent
    prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
    smoothWheel: true,
  });

  rafId = requestAnimationFrame(tick);

  return lenisInstance;
}

export function destroySmoothScrolling(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

/**
 * Jump to the top of the page instantly — used on route changes so the new
 * page always starts from y=0 without any scroll animation playing.
 */
export function scrollToTopInstant(): void {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true });
  } else if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}
