import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { LENIS_OPTIONS, shouldUseNativeScroll, type ScrollMode } from '@/scroll/config';

let lenis: Lenis | null = null;
let resizeListenersAttached = false;

function scheduleResize(): void {
  requestAnimationFrame(() => lenis?.resize());
}

function attachResizeListeners(): void {
  if (resizeListenersAttached || typeof window === 'undefined') return;
  resizeListenersAttached = true;
  window.addEventListener('load', scheduleResize, { once: true });
  window.addEventListener('resize', scheduleResize, { passive: true });
}

function detachResizeListeners(): void {
  if (!resizeListenersAttached || typeof window === 'undefined') return;
  resizeListenersAttached = false;
  window.removeEventListener('load', scheduleResize);
  window.removeEventListener('resize', scheduleResize);
}

export function getScrollMode(): ScrollMode {
  return lenis ? 'lenis' : 'native';
}

export function initLenis(): Lenis | null {
  if (lenis) return lenis;
  if (shouldUseNativeScroll()) return null;

  lenis = new Lenis(LENIS_OPTIONS);
  attachResizeListeners();
  scheduleResize();

  return lenis;
}

export function destroyLenis(): void {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  detachResizeListeners();
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function refreshLenis(): void {
  lenis?.resize();
}

export function getScrollY(): number {
  return lenis?.scroll ?? (typeof window !== 'undefined' ? window.scrollY : 0);
}

export function scrollToTopInstant(): void {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    refreshLenis();
    return;
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}
