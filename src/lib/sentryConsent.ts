import type { CookiePreferences } from '../types/cookies';
import { COOKIE_CONSENT_KEY } from '../types/cookies';

// Sentry loads only when analytics consent is granted.
// When revoked, Sentry closes. Re-granting re-initialises.
// Dynamic import keeps Sentry out of the main bundle.

let sentryInitialized = false;

export function hasAnalyticsConsentFromStorage(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.preferences?.analytics === true;
  } catch {
    return false;
  }
}

async function initSentry(): Promise<void> {
  if (sentryInitialized) return;
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.2,
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/pcxcqbpygyidkusetghk\.supabase\.co/,
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    sentryInitialized = true;
  } catch {
    // fail silently
  }
}

async function closeSentry(): Promise<void> {
  if (!sentryInitialized) return;

  try {
    const Sentry = await import('@sentry/react');
    await Sentry.close();
    sentryInitialized = false;
  } catch {
    // fail silently
  }
}

export async function handleConsentChange(preferences: CookiePreferences): Promise<void> {
  if (preferences.analytics) {
    await initSentry();
  } else {
    await closeSentry();
  }
}

export async function initSentryIfConsented(): Promise<void> {
  if (hasAnalyticsConsentFromStorage()) {
    await initSentry();
  }
}