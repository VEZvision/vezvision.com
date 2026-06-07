const REVEAL_IDLE_MS = 90;

const pending = new Set<HTMLElement>();
const idleCallbacks = new Set<() => void>();
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let scrolling = false;
let detachScroll: (() => void) | null = null;

function flushPending(): void {
  scrolling = false;
  pending.forEach((el) => el.classList.add('vez-reveal--in'));
  pending.clear();
  idleCallbacks.forEach((callback) => callback());
  idleCallbacks.clear();
}

function pingScroll(): void {
  scrolling = true;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    idleTimer = null;
    flushPending();
  }, REVEAL_IDLE_MS);
}

export function isRevealScrollActive(): boolean {
  return scrolling;
}

export function scheduleReveal(el: HTMLElement): void {
  if (!scrolling) {
    el.classList.add('vez-reveal--in');
    return;
  }
  pending.add(el);
}

export function revealImmediately(el: HTMLElement): void {
  pending.delete(el);
  el.classList.add('vez-reveal--in');
}

export function runWhenScrollIdle(callback: () => void): void {
  if (!scrolling) {
    callback();
    return;
  }
  idleCallbacks.add(callback);
}

export function attachRevealScrollSource(
  lenis: { on: (event: 'scroll', handler: () => void) => () => void } | null,
): void {
  detachRevealScrollSource();

  if (lenis) {
    const unsubscribe = lenis.on('scroll', pingScroll);
    detachScroll = () => {
      unsubscribe();
      detachScroll = null;
    };
    return;
  }

  window.addEventListener('scroll', pingScroll, { passive: true });
  detachScroll = () => {
    window.removeEventListener('scroll', pingScroll);
    detachScroll = null;
  };
}

export function detachRevealScrollSource(): void {
  detachScroll?.();
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  scrolling = false;
  pending.clear();
  idleCallbacks.clear();
}
