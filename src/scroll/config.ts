import type { LenisOptions } from "lenis";

export type ScrollMode = "native" | "lenis";

const LENIS_FLAG = import.meta.env.VITE_ENABLE_SMOOTH_SCROLL;

/** Native scrolling is the stable default; Lenis can be enabled explicitly per deployment. */
export function isLenisRequested(): boolean {
  return LENIS_FLAG === "true";
}

export function shouldUseNativeScroll(): boolean {
  if (typeof window === "undefined") return true;
  if (!isLenisRequested()) return true;

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const SCROLL_IDLE_MS = 150;

export function getLenisOptions(): LenisOptions {
  const eventsTarget =
    typeof document !== "undefined"
      ? (document.querySelector<HTMLElement>("[data-lenis-events]") ??
        undefined)
      : undefined;

  return {
    autoRaf: true,
    lerp: 0.08,
    wheelMultiplier: 0.85,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoResize: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    eventsTarget: eventsTarget ?? undefined,
    prevent: (node: Element) => node.hasAttribute("data-lenis-prevent"),
  } as LenisOptions;
}
