type ScrollListener = () => void;

const listeners = new Set<ScrollListener>();

let detachHandler: (() => void) | null = null;
let pendingFrame = 0;

function dispatchScroll(): void {
  pendingFrame = 0;
  listeners.forEach((listener) => listener());
}

function scheduleDispatchScroll(): void {
  if (pendingFrame !== 0) return;
  pendingFrame = window.requestAnimationFrame(dispatchScroll);
}

export function dispatchScrollBus(): void {
  dispatchScroll();
}

export function subscribeScroll(listener: ScrollListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function attachScrollBus(
  lenis: {
    on: (event: "scroll", handler: ScrollListener) => () => void;
  } | null,
): void {
  detachScrollBus();

  if (lenis) {
    const unsubscribe = lenis.on("scroll", scheduleDispatchScroll);
    detachHandler = () => {
      unsubscribe();
      detachHandler = null;
    };
    return;
  }

  window.addEventListener("scroll", scheduleDispatchScroll, { passive: true });
  detachHandler = () => {
    window.removeEventListener("scroll", scheduleDispatchScroll);
    if (pendingFrame !== 0) {
      window.cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
    }
    detachHandler = null;
  };
}

export function detachScrollBus(): void {
  detachHandler?.();
}
