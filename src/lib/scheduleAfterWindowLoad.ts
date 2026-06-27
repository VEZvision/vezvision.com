/**
 * Runs work only after window "load" plus a minimum delay so idle callbacks
 * cannot fire Supabase / CMS requests during the LCP window.
 */
export function scheduleAfterWindowLoad(
  work: () => void,
  minDelayMs = 5000,
): () => void {
  let delayTimer: ReturnType<typeof setTimeout> | null = null;

  const startDelay = (): void => {
    delayTimer = globalThis.setTimeout(work, minDelayMs);
  };

  if (document.readyState === "complete") {
    startDelay();
  } else {
    window.addEventListener("load", startDelay, { once: true });
  }

  return () => {
    window.removeEventListener("load", startDelay);
    if (delayTimer !== null) {
      globalThis.clearTimeout(delayTimer);
    }
  };
}
