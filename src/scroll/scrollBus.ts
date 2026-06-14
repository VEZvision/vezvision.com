type ScrollListener = () => void;

const listeners = new Set<ScrollListener>();

let detachHandler: (() => void) | null = null;

function dispatchScroll(): void {
  listeners.forEach((listener) => listener());
}

export function dispatchScrollBus(): void {
  dispatchScroll();
}

export function subscribeScroll(listener: ScrollListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function attachScrollBus(lenis: { on: (event: 'scroll', handler: ScrollListener) => () => void } | null): void {
  detachScrollBus();

  if (lenis) {
    const unsubscribe = lenis.on('scroll', dispatchScroll);
    detachHandler = () => {
      unsubscribe();
      detachHandler = null;
    };
    return;
  }

  window.addEventListener('scroll', dispatchScroll, { passive: true });
  detachHandler = () => {
    window.removeEventListener('scroll', dispatchScroll);
    detachHandler = null;
  };
}

export function detachScrollBus(): void {
  detachHandler?.();
}
