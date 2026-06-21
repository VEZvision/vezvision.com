/**
 * Shared IntersectionObserver pool for section reveals.
 * Avoids N observers + N React setStates (the main source of home-page hitches).
 */

const DEFAULT_ROOT_MARGIN = "80px 0px 40px 0px";

type Entry = {
  once: boolean;
  observerKey: string;
  onReveal?: (() => void) | undefined;
};

const tracked = new Map<Element, Entry>();
const observers = new Map<string, IntersectionObserver>();

function reveal(el: HTMLElement, onReveal?: () => void) {
  if (el.dataset.revealed === "true") return;
  el.dataset.revealed = "true";
  onReveal?.();
}

function observerKey(rootMargin: string, threshold: number): string {
  return `${rootMargin}|${threshold}`;
}

function handleIntersect(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target as HTMLElement;
    const meta = tracked.get(el);
    reveal(el, meta?.onReveal);
    if (meta?.once) {
      observers.get(meta.observerKey)?.unobserve(el);
      tracked.delete(el);
    }
  }
}

function getObserver(
  rootMargin: string,
  threshold: number,
): IntersectionObserver {
  const key = observerKey(rootMargin, threshold);
  let observer = observers.get(key);
  if (!observer) {
    observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });
    observers.set(key, observer);
  }
  return observer;
}

function isAboveFold(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) ||
    rect.bottom <= 0
  );
}

export type RegisterRevealOptions = {
  once?: boolean;
  rootMargin?: string | undefined;
  amount?: number;
  onReveal?: (() => void) | undefined;
};

export function registerRevealElement(
  el: HTMLElement,
  {
    once = true,
    rootMargin = DEFAULT_ROOT_MARGIN,
    amount = 0,
    onReveal,
  }: RegisterRevealOptions = {},
): () => void {
  const threshold = Math.min(1, Math.max(0, amount));
  const key = observerKey(rootMargin, threshold);
  el.dataset.revealPending = "true";

  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    reveal(el, onReveal);
    return () => {};
  }

  if (isAboveFold(el)) {
    reveal(el, onReveal);
    if (once) return () => {};
  }

  const observer = getObserver(rootMargin, threshold);
  tracked.set(el, { once, observerKey: key, onReveal });
  observer.observe(el);

  return () => {
    observer.unobserve(el);
    tracked.delete(el);
  };
}

export function revealImmediately(el: HTMLElement) {
  reveal(el);
}

export function resetRevealRegistryState(): void {
  for (const observer of observers.values()) {
    observer.disconnect();
  }
  observers.clear();
  tracked.clear();
}
