const isDev = import.meta.env?.DEV ?? true

function formatMessage(context: string, detail?: unknown): string {
  if (detail === undefined) return context
  const detailString = typeof detail === 'string'
    ? detail
    : typeof detail === 'number' || typeof detail === 'boolean' || typeof detail === 'bigint'
      ? String(detail)
      : typeof detail === 'symbol'
        ? detail.toString()
        : typeof detail === 'object' && detail !== null
          ? JSON.stringify(detail)
          : '[unserializable detail]'
  return `${context}: ${detailString}`
}

async function captureWithSentry(context: string, error?: unknown): Promise<void> {
  if (isDev || !import.meta.env.VITE_SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/react')
    if (error instanceof Error) {
      Sentry.captureException(error, { tags: { context } })
    } else {
      Sentry.captureMessage(formatMessage(context, error), 'error')
    }
  } catch {
    void 0;
  }
}

export function logError(context: string, error?: unknown): void {
  console.error(`[ERROR] ${formatMessage(context, error)}`, error)
  void captureWithSentry(context, error)
}

export function logWarn(context: string, message?: unknown): void {
  if (isDev) {
    console.warn(`[WARN] ${formatMessage(context, message)}`)
  }
}

export function logInfo(context: string, message?: unknown): void {
  if (isDev) {
    console.info(`[INFO] ${formatMessage(context, message)}`)
  }
}
