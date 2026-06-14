import { useEffect, useState } from 'react'

/**
 * Respects the Save-Data client hint — when the user has enabled data-saving mode,
 * the app should skip auto-playing video, use lower-quality images, and defer
 * non-critical network requests. Designed for the `Sec-CH-Save-Data` header
 * (Chrome/Edge) or the legacy `saveData` property on navigator.connection.
 */
export function usePrefersReducedData(): boolean {
  const [saveData, setSaveData] = useState(() => {
    if (typeof window === 'undefined') return false
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    return conn?.saveData === true
  })

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; addEventListener?: (type: string, cb: () => void) => void; removeEventListener?: (type: string, cb: () => void) => void } }).connection
    if (!conn) return

    const handler = () => setSaveData(Boolean(conn.saveData))
    conn.addEventListener?.('change', handler)
    return () => { conn.removeEventListener?.('change', handler) }
  }, [])

  return saveData
}
