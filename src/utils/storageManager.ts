import type {
  CookieConsentStorage,
  StorageManager,
  CookiePreferences,
  ConsentAction,
} from "../types/cookies";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  DEFAULT_COOKIE_PREFERENCES,
} from "../types/cookies";

export function generateConsentId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `consent_${crypto.randomUUID()}`;
  }

  const randomValues = new Uint32Array(2);
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    crypto.getRandomValues(randomValues);
  } else {
    randomValues[0] = Date.now();
    randomValues[1] = performance.now();
  }

  return `consent_${Date.now()}_${Array.from(randomValues, (value) => value.toString(36)).join("")}`;
}

export class StorageManagerImpl implements StorageManager {
  saveConsent(consent: CookieConsentStorage): void {
    try {
      const consentData = {
        ...consent,
        timestamp: new Date().toISOString(),
        version: COOKIE_CONSENT_VERSION,
      };

      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    } catch {
      this.saveFallbackConsent(consent);
    }
  }

  loadConsent(): CookieConsentStorage | null {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        return null;
      }

      const consent = JSON.parse(stored) as CookieConsentStorage;

      if (consent.version !== COOKIE_CONSENT_VERSION) {
        return this.migrateConsentData(consent);
      }

      if (!this.isValidConsentData(consent)) {
        this.clearConsent();
        return null;
      }

      return consent;
    } catch {
      return this.loadFallbackConsent();
    }
  }

  clearConsent(): void {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      document.cookie = `${COOKIE_CONSENT_KEY}_fallback=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch {
      /* localStorage remove failed — non-critical */
    }
  }

  createDefaultConsent(): CookieConsentStorage {
    return {
      version: COOKIE_CONSENT_VERSION,
      consentId: this.generateConsentId(),
      timestamp: new Date().toISOString(),
      preferences: { ...DEFAULT_COOKIE_PREFERENCES },
      hasShownBanner: false,
      history: [],
      metadata: {},
    };
  }

  updatePreferences(
    preferences: CookiePreferences,
    action: ConsentAction,
  ): void {
    try {
      let consent = this.loadConsent();

      if (!consent) {
        consent = this.createDefaultConsent();
      }

      consent.history.push({
        action,
        timestamp: new Date().toISOString(),
        preferences: { ...preferences },
      });

      consent.preferences = { ...preferences };
      consent.timestamp = new Date().toISOString();

      this.saveConsent(consent);
    } catch {
      /* localStorage quota/private mode — non-critical */
    }
  }

  hasShownBanner(): boolean {
    const consent = this.loadConsent();
    return consent?.hasShownBanner || false;
  }

  markBannerAsShown(): void {
    try {
      let consent = this.loadConsent();

      if (!consent) {
        consent = this.createDefaultConsent();
      }

      consent.hasShownBanner = true;
      this.saveConsent(consent);
    } catch {
      /* localStorage quota/private mode — non-critical */
    }
  }

  private generateConsentId(): string {
    return generateConsentId();
  }

  private isValidConsentData(
    consent: unknown,
  ): consent is CookieConsentStorage {
    if (!consent || typeof consent !== "object" || consent === null) {
      return false;
    }

    const obj = consent as Record<string, unknown>;
    const preferences = obj.preferences;
    if (!preferences || typeof preferences !== "object") {
      return false;
    }

    const prefs = preferences as Record<string, unknown>;

    return (
      typeof obj.version === "string" &&
      typeof obj.consentId === "string" &&
      typeof obj.timestamp === "string" &&
      typeof prefs.necessary === "boolean" &&
      typeof prefs.functional === "boolean" &&
      typeof prefs.analytics === "boolean" &&
      typeof prefs.marketing === "boolean" &&
      Array.isArray(obj.history)
    );
  }

  private migrateConsentData(oldConsent: unknown): CookieConsentStorage | null {
    try {
      const newConsent = this.createDefaultConsent();

      if (oldConsent && typeof oldConsent === "object" && oldConsent !== null) {
        const obj = oldConsent as Record<string, unknown>;

        if (
          obj.preferences &&
          typeof obj.preferences === "object" &&
          obj.preferences !== null
        ) {
          const prefs = obj.preferences as Record<string, unknown>;
          newConsent.preferences = {
            necessary: true,
            functional: Boolean(prefs.functional) || false,
            analytics: Boolean(prefs.analytics) || false,
            marketing: Boolean(prefs.marketing) || false,
          };
        }

        if (typeof obj.hasShownBanner === "boolean") {
          newConsent.hasShownBanner = obj.hasShownBanner;
        }
      }

      newConsent.history.push({
        action: "update_preferences",
        timestamp: new Date().toISOString(),
        preferences: newConsent.preferences,
      });

      return newConsent;
    } catch {
      return null;
    }
  }

  private saveFallbackConsent(consent: CookieConsentStorage): void {
    try {
      const fallbackData = JSON.stringify({
        preferences: consent.preferences,
        hasShownBanner: consent.hasShownBanner,
        timestamp: consent.timestamp,
      });

      document.cookie = `${COOKIE_CONSENT_KEY}_fallback=${encodeURIComponent(fallbackData)}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; SameSite=Lax`;
    } catch {
      /* cookie fallback write failed — non-critical */
    }
  }

  private loadFallbackConsent(): CookieConsentStorage | null {
    try {
      const cookies = document.cookie.split(";");
      const fallbackCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${COOKIE_CONSENT_KEY}_fallback=`),
      );

      if (!fallbackCookie) return null;

      const fallbackData = JSON.parse(
        decodeURIComponent(fallbackCookie.split("=")[1]),
      ) as
        | { preferences?: CookiePreferences; hasShownBanner?: boolean }
        | undefined;

      const consent = this.createDefaultConsent();
      consent.preferences =
        fallbackData?.preferences || DEFAULT_COOKIE_PREFERENCES;
      consent.hasShownBanner = fallbackData?.hasShownBanner || false;

      return consent;
    } catch {
      return null;
    }
  }
}

export const storageManager = new StorageManagerImpl();
