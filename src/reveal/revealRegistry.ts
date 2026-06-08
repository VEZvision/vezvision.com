/**
 * Single shared IntersectionObserver for all section reveals.
 * Avoids N observers + N React setStates (the main source of home-page hitches).
 */

const DEFAULT_ROOT_MARGIN = '320px 0px 120px 0px';

type Entry = { once: boolean };

const tracked = new Map<Element, Entry>();

let observer: IntersectionObserver | null = null;

function reveal(el: HTMLElement) {
  if (el.dataset.revealed === 'true') return;
  el.dataset.revealed = 'true';
}

function ensureObserver() {
  if (observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        reveal(el);
        const meta = tracked.get(el);
        if (meta?.once) {
          observer?.unobserve(el);
          tracked.delete(el);
        }
      }
    },
    { threshold: 0, rootMargin: DEFAULT_ROOT_MARGIN },
  );
}

function isAboveFold(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
}

export function registerRevealElement(
  el: HTMLElement,
  { once = true }: { once?: boolean } = {},
): () => void {
  if (isAboveFold(el)) {
    reveal(el);
    if (once) return () => {};
  }

  ensureObserver();
  tracked.set(el, { once });
  observer!.observe(el);

  return () => {
    observer?.unobserve(el);
    tracked.delete(el);
  };
}

export function revealImmediately(el: HTMLElement) {
  reveal(el);
}
