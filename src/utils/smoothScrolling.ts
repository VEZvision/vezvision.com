/**
 * Backward-compatible facade — prefer importing from `@/scroll` in new code.
 */

export type { ScrollMode as SmoothScrollMode } from '@/scroll/config';

export {
  destroyLenis as destroySmoothScrolling,
  getLenis as getSmoothScroll,
  getScrollMode as getSmoothScrollMode,
  getScrollY,
  initLenis as initSmoothScrolling,
  refreshLenis as refreshSmoothScrolling,
  scrollToTopInstant,
} from '@/scroll/lenisEngine';
