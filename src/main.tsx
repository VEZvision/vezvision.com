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

// Reset reveal-state attributes from prerendered HTML so CSS rise-in animations re-fire on mount instead of staying "completed".
function resetPrerenderedRevealState(): void {
  document.querySelectorAll('[data-revealed="true"]').forEach((el) => {
    el.removeAttribute("data-revealed");
    el.setAttribute("data-reveal-pending", "true");
  });
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

function respectSaveDataBeforeHydration(): void {
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (!conn?.saveData) return;

  document
    .querySelectorAll('link[rel="preload"][as="video"]')
    .forEach((element) => element.remove());

  document.querySelectorAll("video").forEach((video) => {
    video.removeAttribute("autoplay");
    video.setAttribute("preload", "none");
    video.pause();
  });
}

async function bootstrap(root: HTMLElement): Promise<void> {
  respectSaveDataBeforeHydration();
  seedBootSettingsCache();
  const isPrerendered =
    document.documentElement.hasAttribute("data-vez-prerender");

  // Must run BEFORE any await: resets DOM attributes + signals React hydration
  // before browser paints, so no "opacity 1→0→1" flash on .vez-reveal elements
  // and no hydration mismatch patch from ViewportSectionGate placeholder swap.
  if (isPrerendered) {
    resetPrerenderedRevealState();
    window.__VEZ_HYDRATING_PRERENDER__ = true;
  }

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
      // Clear so client-side nav uses useState(false) initial (IO gating).
      window.__VEZ_HYDRATING_PRERENDER__ = false;
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
