import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  registerRevealElement,
  resetRevealRegistryState,
  revealImmediately,
} from "@/reveal/revealRegistry";

describe("revealRegistry", () => {
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

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("observes without synchronous layout measurement", async () => {
    const el = document.createElement("section");
    const measure = vi.spyOn(el, "getBoundingClientRect");

    const cleanup = registerRevealElement(el, { once: true });

    expect(measure).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(el);
    expect(el.dataset.revealed).toBeUndefined();

    callback(
      [
        {
          isIntersecting: true,
          target: el,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(el.dataset.revealed).toBe("true");
    cleanup();
  });

  it("observes below-fold elements and reveals on intersect", async () => {
    const el = document.createElement("section");

    registerRevealElement(el, { once: true });

    expect(observe).toHaveBeenCalledWith(el);
    expect(el.dataset.revealed).toBeUndefined();

    callback(
      [
        {
          isIntersecting: true,
          target: el,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(el.dataset.revealed).toBe("true");
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it("revealImmediately sets data-revealed", () => {
    const el = document.createElement("section");
    revealImmediately(el);
    expect(el.dataset.revealed).toBe("true");
  });

  it("cleanup unobserve removes tracking", () => {
    const el = document.createElement("section");

    const cleanup = registerRevealElement(el, { once: false });
    cleanup();

    expect(unobserve).toHaveBeenCalledWith(el);
  });
});
