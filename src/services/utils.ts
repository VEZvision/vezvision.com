export const isAbortLikeError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('failed to fetch') || message.includes('abort')
}

export const isSupabaseNetworkLikeError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const e = error as { message?: string; code?: string }
  const msg = (e.message || '').toLowerCase()
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('connection') ||
    e.code === 'NETWORK_ERROR'
  )
}
