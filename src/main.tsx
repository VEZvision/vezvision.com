import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { initSentryIfConsented } from './lib/sentryConsent'
import './index.css'
import './styles/animations.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Lenis (and scrollToTopInstant) own all scroll-position decisions.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

// Sentry loads only when analytics consent is already granted.
// Consent changes during the session are handled inside the React tree
// via the CookieConsentContext → handleConsentChange.
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => { initSentryIfConsented() }, { timeout: 3000 })
} else {
  globalThis.setTimeout(() => { initSentryIfConsented() }, 1)
}
