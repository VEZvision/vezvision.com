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
  ensureLocaleLoaded,
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

const scheduleIdleWork = (work: () => void, timeout = 3000): void => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(work, { timeout });
    return;
  }

  globalThis.setTimeout(work, 1);
};

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

function seedBootSettingsCache(): void {
  const bootEl = document.getElementById("vez-boot-settings");
  if (!bootEl?.textContent) return;

  try {
    window.localStorage.setItem("vez-public-settings-v1", bootEl.textContent);
  } catch {
    /* private mode / quota */
  } finally {
    bootEl.remove();
  }
}

async function bootstrap(root: HTMLElement): Promise<void> {
  seedBootSettingsCache();
  const isPrerendered =
    document.documentElement.hasAttribute("data-vez-prerender");

  const initialLanguage = detectInitialLanguage();
  prefetchLocale(initialLanguage);

  removePrerenderedHelmetTags();
  document.documentElement.removeAttribute("data-vez-prerender");

  const mountApp = (): void => {
    if (!isPrerendered && root.hasChildNodes()) {
      root.replaceChildren();
    }

    createRoot(root).render(app);

    scheduleIdleWork(() => {
      void initWebVitalsReporting();
      prefetchLocale(initialLanguage === "pl" ? "en" : "pl");
    });

    scheduleIdleWork(() => {
      void initSentryIfConsented();
    });
  };

  if (isPrerendered) {
    // Keep static hero markup visible for LCP; mount React once locale is ready.
    void ensureLocaleLoaded(initialLanguage).then(mountApp);
    return;
  }

  await ensureLocaleLoaded(initialLanguage);
  mountApp();
}

void bootstrap(rootElement);
