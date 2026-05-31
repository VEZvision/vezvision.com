import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { initSentryIfConsented } from './lib/sentryConsent'
import { queryClient } from './lib/queryClient'
import { unregisterLegacyServiceWorkers } from './utils/serviceWorkerCleanup'
import './index.css'
import './styles/animations.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void unregisterLegacyServiceWorkers()
  })
}

// Lenis (and scrollToTopInstant) own all scroll-position decisions.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// Sentry loads only when analytics consent is already granted.
// Consent changes during the session are handled inside the React tree
// via the CookieConsentContext → handleConsentChange.
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => { void initSentryIfConsented() }, { timeout: 3000 })
} else {
  globalThis.setTimeout(() => { void initSentryIfConsented() }, 1)
}
