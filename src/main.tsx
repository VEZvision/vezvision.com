import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AppErrorBoundary } from './components/layout/AppErrorBoundary'
import { initGoogleAnalyticsConsentDefaults } from './lib/googleAnalyticsConsent'
import { initSentryIfConsented } from './lib/sentryConsent'
import { queryClient } from './lib/queryClient'
import { getHelmetProviderContext } from './lib/helmetContext'
import { unregisterLegacyServiceWorkers } from './utils/serviceWorkerCleanup'
import {
  detectInitialLanguage,
  prefetchLocale,
} from './data/translations/loadLocale'
import './index.css'
import './styles/reveal.css'
import './styles/scroll-performance.css'
import './styles/animations.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void unregisterLegacyServiceWorkers()
  })
}

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

initGoogleAnalyticsConsentDefaults()

const initialLanguage = detectInitialLanguage()
prefetchLocale(initialLanguage)
prefetchLocale(initialLanguage === 'pl' ? 'en' : 'pl')

const helmetContext = getHelmetProviderContext(import.meta.env.VITE_CSP_NONCE || undefined)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext as React.ComponentProps<typeof HelmetProvider>['context']}>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// Sentry loads only when analytics consent is already granted.
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(() => { void initSentryIfConsented() }, { timeout: 3000 })
} else {
  globalThis.setTimeout(() => { void initSentryIfConsented() }, 1)
}
