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

  return window.matchMedia('(pointer: coarse)').matches;
}

function tick(time: number): void {
  lenisInstance?.raf(time);
  rafId = requestAnimationFrame(tick);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export function initSmoothScrolling(): Lenis {
  if (lenisInstance) return lenisInstance;

  if (shouldUseNativeScroll()) {
    return null as never;
  }

  lenisInstance = new Lenis({
    // Duration in seconds — higher = slower / more cinematic feel
    duration: 1.8,
    // Exponential easing: fast start, elegant deceleration
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    // Keep native momentum scroll on touch screens (iOS / Android).
    // syncTouch: false (default) means Lenis does NOT intercept touch events —
    // the OS handles them natively for best mobile feel.
    syncTouch: false,
    // Natural wheel / touch multipliers
    wheelMultiplier: 1,
    touchMultiplier: 1,
    // Allow inner scrollable areas to opt-out via data-lenis-prevent
    prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
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
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}

