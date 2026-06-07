/**
 * Lenis smooth wheel — opt in via VITE_ENABLE_SMOOTH_SCROLL=true.
 * Native scroll is default: on a long homepage it avoids Lenis + animation jank.
 * Decorative motion pauses via html.vez-is-scrolling on .vez-decorative-motion zones.
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance: Lenis | null = null;
let resizeListenerAttached = false;

function scheduleLenisResize() {
  requestAnimationFrame(() => {
    lenisInstance?.resize();
  });
}

function attachLenisResizeListeners() {
  if (resizeListenerAttached || typeof window === 'undefined') return;
  resizeListenerAttached = true;
  window.addEventListener('load', scheduleLenisResize, { once: true });
  window.addEventListener('resize', scheduleLenisResize, { passive: true });
}

function detachLenisResizeListeners() {
  if (!resizeListenerAttached || typeof window === 'undefined') return;
  resizeListenerAttached = false;
  window.removeEventListener('load', scheduleLenisResize);
  window.removeEventListener('resize', scheduleLenisResize);
}

export type SmoothScrollMode = 'off' | 'lenis';

export function getSmoothScrollMode(): SmoothScrollMode {
  return lenisInstance ? 'lenis' : 'off';
}

function isSmoothScrollEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_SMOOTH_SCROLL === 'true';
}

function shouldUseNativeScroll(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  if (!isSmoothScrollEnabled()) {
    return true;
  }

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function initSmoothScrolling(): Lenis | null {
  if (lenisInstance) return lenisInstance;

  if (shouldUseNativeScroll()) {
    return null;
  }

  lenisInstance = new Lenis({
    autoRaf: true,
    lerp: 0.14,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoResize: true,
    stopInertiaOnNavigate: true,
    prevent: (node: Element) => node.hasAttribute('data-lenis-prevent'),
  });

  attachLenisResizeListeners();
  scheduleLenisResize();

  return lenisInstance;
}

export function destroySmoothScrolling(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  detachLenisResizeListeners();
}

export function getSmoothScroll(): Lenis | null {
  return lenisInstance;
}

export function refreshSmoothScrolling(): void {
  lenisInstance?.resize();
}

export function getScrollY(): number {
  return lenisInstance?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
}

export function scrollToTopInstant(): void {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true, force: true });
    refreshSmoothScrolling();
  } else if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}
