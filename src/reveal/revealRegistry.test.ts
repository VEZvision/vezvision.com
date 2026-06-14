import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  registerRevealElement,
  resetRevealRegistryState,
  revealImmediately,
} from '@/reveal/revealRegistry';

describe('revealRegistry', () => {
  let observe: ReturnType<typeof vi.fn>;
  let unobserve: ReturnType<typeof vi.fn>;
  let callback: IntersectionObserverCallback;

  beforeEach(() => {
    resetRevealRegistryState();
    observe = vi.fn();
    unobserve = vi.fn();

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }

      observe = observe;
      unobserve = unobserve;
      disconnect = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reveals immediately for above-fold elements', () => {
    const el = document.createElement('section');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 300,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const cleanup = registerRevealElement(el, { once: true });

    expect(el.dataset.revealed).toBe('true');
    expect(observe).not.toHaveBeenCalled();
    cleanup();
  });

  it('observes below-fold elements and reveals on intersect', () => {
    const el = document.createElement('section');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      bottom: 1400,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    registerRevealElement(el, { once: true });

    expect(observe).toHaveBeenCalledWith(el);
    expect(el.dataset.revealed).toBeUndefined();

    callback(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(el.dataset.revealed).toBe('true');
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it('revealImmediately sets data-revealed', () => {
    const el = document.createElement('section');
    revealImmediately(el);
    expect(el.dataset.revealed).toBe('true');
  });

  it('cleanup unobserve removes tracking', () => {
    const el = document.createElement('section');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      bottom: 1400,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const cleanup = registerRevealElement(el, { once: false });
    cleanup();

    expect(unobserve).toHaveBeenCalledWith(el);
  });
});
