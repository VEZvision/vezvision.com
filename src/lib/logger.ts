const isDev = import.meta.env?.DEV ?? true

export function logError(context: string, error?: unknown): void {
  if (isDev) {
    console.error(`[ERROR] ${context}:`, error)
  }
}

export function logWarn(context: string, message?: unknown): void {
  if (isDev) {
    console.warn(`[WARN] ${context}:`, message)
  }
}

export function logInfo(context: string, message?: unknown): void {
  if (isDev) {
    console.info(`[INFO] ${context}:`, message)
  }
}
