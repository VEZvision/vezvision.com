import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AppErrorBoundary } from "./components/layout/AppErrorBoundary";
import { initGoogleAnalyticsConsentDefaults } from "./lib/googleAnalyticsConsent";
import { initSentryIfConsented } from "./lib/sentryConsent";
import { initWebVitalsReporting } from "./lib/webVitals";
import { queryClient } from "./lib/queryClient";
import { unregisterLegacyServiceWorkers } from "./utils/serviceWorkerCleanup";
import {
  detectInitialLanguage,
  prefetchLocale,
} from "./data/translations/loadLocale";
import "./index.css";
import "./styles/reveal.css";
import "./styles/scroll-performance.css";
import "./styles/animations.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void unregisterLegacyServiceWorkers();
  });
}

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

initGoogleAnalyticsConsentDefaults();
initWebVitalsReporting();

const initialLanguage = detectInitialLanguage();
prefetchLocale(initialLanguage);
prefetchLocale(initialLanguage === "pl" ? "en" : "pl");

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found");
}

const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);

function removePrerenderedHelmetTags(): void {
  document
    .querySelectorAll(
      [
        "head title",
        'head meta[name="description"]',
        'head meta[name="robots"]',
        'head meta[name="twitter:card"]',
        'head meta[name="twitter:site"]',
        'head meta[name="twitter:creator"]',
        'head meta[name="twitter:title"]',
        'head meta[name="twitter:description"]',
        'head meta[name="twitter:image"]',
        'head meta[property^="og:"]',
        'head link[rel="canonical"]',
        'head link[rel="alternate"][hreflang]',
        'head script[type="application/ld+json"]',
      ].join(","),
    )
    .forEach((element) => element.remove());
}

if (rootElement.hasChildNodes()) {
  removePrerenderedHelmetTags();
  rootElement.replaceChildren();
}

createRoot(rootElement).render(app);

// Sentry loads only when analytics consent is already granted.
if (typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(
    () => {
      void initSentryIfConsented();
    },
    { timeout: 3000 },
  );
} else {
  globalThis.setTimeout(() => {
    void initSentryIfConsented();
  }, 1);
}
