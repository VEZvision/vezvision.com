type GtagCommand = 'js' | 'config' | 'consent'
type GtagValue = string | Date | Record<string, string>

declare global {
  interface Window {
    dataLayer?: GtagValue[][]
    gtag?: (command: GtagCommand, target: string | Date, config?: Record<string, string>) => void
    __vezvisionGaLoaded?: boolean
  }
}

const GA_ID = import.meta.env.VITE_GA_ID

function clearGoogleAnalyticsCookies(): void {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat')

  for (const name of cookieNames) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  }
}

export function applyGoogleAnalyticsConsent(analyticsAllowed: boolean): void {
  if (!GA_ID) return

  if (!analyticsAllowed) {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    clearGoogleAnalyticsCookies()
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || ((...args: GtagValue[]) => {
    window.dataLayer?.push(args)
  })

  window.gtag('consent', 'update', { analytics_storage: 'granted' })

  if (window.__vezvisionGaLoaded) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: 'true' })
  window.__vezvisionGaLoaded = true
}
