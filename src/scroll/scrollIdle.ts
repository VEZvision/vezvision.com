import { SCROLL_IDLE_MS } from '@/scroll/config';

export type ScrollIdleTracker = {
  ping: () => void;
  dispose: () => void;
};

export function createScrollIdleTracker(idleMs = SCROLL_IDLE_MS): ScrollIdleTracker {
  const root = document.documentElement;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let scrolling = false;

  const end = () => {
    scrolling = false;
    root.classList.remove('vez-is-scrolling');
    timer = null;
  };

  const ping = () => {
    if (!scrolling) {
      scrolling = true;
      root.classList.add('vez-is-scrolling');
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(end, idleMs);
  };

  const dispose = () => {
    if (timer) clearTimeout(timer);
    if (scrolling) end();
  };

  return { ping, dispose };
}
