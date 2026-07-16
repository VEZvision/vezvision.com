const RECOVERY_WINDOW_MS = 60_000;
const RECOVERY_STORAGE_PREFIX = "vez:chunk-recovery:";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return typeof error === "string" ? error : "";
}

export function isStaleChunkError(error: unknown): boolean {
  const message = errorMessage(error);
  return [
    /ChunkLoadError/i,
    /Failed to fetch dynamically imported module/i,
    /Importing a module script failed/i,
    /error loading dynamically imported module/i,
    /Unable to preload CSS/i,
  ].some((pattern) => pattern.test(message));
}

function recoveryKey(): string {
  return `${RECOVERY_STORAGE_PREFIX}${window.location.pathname}${window.location.search}`;
}

export function tryRecoverFromStaleChunk(
  error: unknown,
  reload: () => void = () => window.location.reload(),
  now = Date.now(),
): boolean {
  if (!isStaleChunkError(error)) return false;

  const key = recoveryKey();
  try {
    const lastAttempt = Number(window.sessionStorage.getItem(key));
    if (Number.isFinite(lastAttempt) && now - lastAttempt < RECOVERY_WINDOW_MS) {
      return false;
    }
    window.sessionStorage.setItem(key, String(now));
  } catch {
    // Private browsing or a storage policy may block sessionStorage. Reloading
    // is still preferable; the browser's normal navigation remains available.
  }

  reload();
  return true;
}

type VitePreloadErrorEvent = Event & { payload?: unknown };

export function installChunkRecovery(): () => void {
  const handlePreloadError = (event: Event) => {
    event.preventDefault();
    const preloadEvent = event as VitePreloadErrorEvent;
    const error = preloadEvent.payload ?? new Error("ChunkLoadError");
    tryRecoverFromStaleChunk(error);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (tryRecoverFromStaleChunk(event.reason)) event.preventDefault();
  };

  window.addEventListener("vite:preloadError", handlePreloadError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("vite:preloadError", handlePreloadError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}
