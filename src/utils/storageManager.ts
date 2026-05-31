import { CookieConsentStorage, StorageManager, CookiePreferences, ConsentAction } from '../types/cookies';
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, DEFAULT_COOKIE_PREFERENCES } from '../types/cookies';

export function generateConsentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `consent_${crypto.randomUUID()}`;
  }

  const randomValues = new Uint32Array(2);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(randomValues);
  } else {
    randomValues[0] = Date.now();
    randomValues[1] = performance.now();
  }

  return `consent_${Date.now()}_${Array.from(randomValues, value => value.toString(36)).join('')}`;
}

// Implementacja zarządzania localStorage dla zgody na cookies
export class StorageManagerImpl implements StorageManager {
  
  /**
   * Zapisuje zgodę użytkownika w localStorage
   */
  saveConsent(consent: CookieConsentStorage): void {
    try {
      const consentData = {
        ...consent,
        timestamp: new Date().toISOString(),
        version: COOKIE_CONSENT_VERSION
      };
      
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
      

    } catch {
      // Fallback - próbujemy zapisać w cookie jeśli localStorage nie działa
      this.saveFallbackConsent(consent);
    }
  }

  /**
   * Ładuje zgodę użytkownika z localStorage
   */
  loadConsent(): CookieConsentStorage | null {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        return null;
      }

      const consent: CookieConsentStorage = JSON.parse(stored);
      
      // Sprawdzamy czy wersja się zgadza
      if (consent.version !== COOKIE_CONSENT_VERSION) {
        return this.migrateConsentData(consent);
      }

      // Walidujemy strukturę danych
      if (!this.isValidConsentData(consent)) {
        this.clearConsent();
        return null;
      }

      return consent;
    } catch {
      // Próbujemy załadować z fallback cookie
      return this.loadFallbackConsent();
    }
  }

  /**
   * Usuwa zgodę użytkownika z localStorage
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      // Usuń też fallback cookie
      document.cookie = `${COOKIE_CONSENT_KEY}_fallback=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch {
      // Błąd podczas czyszczenia - ignorujemy
    }
  }

  /**
   * Migruje zgodę z poprzedniej wersji
   */
  migrateConsent(): void {
    try {
      const oldConsent = this.loadConsent();
      if (!oldConsent) return;

      // Logika migracji w zależności od wersji
      const migratedConsent = this.performMigration(oldConsent);
      
      if (migratedConsent) {
        this.saveConsent(migratedConsent);
        // Cookie consent migrated successfully
      }
    } catch {
      // W przypadku błędu migracji, czyścimy dane
      this.clearConsent();
    }
  }

  /**
   * Tworzy nową zgodę z domyślnymi wartościami
   */
  createDefaultConsent(): CookieConsentStorage {
    return {
      version: COOKIE_CONSENT_VERSION,
      consentId: this.generateConsentId(),
      timestamp: new Date().toISOString(),
      preferences: { ...DEFAULT_COOKIE_PREFERENCES },
      hasShownBanner: false,
      history: [],
      metadata: {}
    };
  }

  /**
   * Aktualizuje preferencje w istniejącej zgodzie
   */
  updatePreferences(preferences: CookiePreferences, action: ConsentAction): void {
    try {
      let consent = this.loadConsent();
      
      if (!consent) {
        consent = this.createDefaultConsent();
      }

      // Dodaj wpis do historii
      consent.history.push({
        action,
        timestamp: new Date().toISOString(),
        preferences: { ...preferences }
      });

      // Aktualizuj preferencje
      consent.preferences = { ...preferences };
      consent.timestamp = new Date().toISOString();

      this.saveConsent(consent);
    } catch {
      // Błąd podczas aktualizacji preferencji - ignorujemy
    }
  }

  /**
   * Sprawdza czy użytkownik już widział banner
   */
  hasShownBanner(): boolean {
    const consent = this.loadConsent();
    return consent?.hasShownBanner || false;
  }

  /**
   * Oznacza banner jako wyświetlony
   */
  markBannerAsShown(): void {
    try {
      let consent = this.loadConsent();
      
      if (!consent) {
        consent = this.createDefaultConsent();
      }

      consent.hasShownBanner = true;
      this.saveConsent(consent);
    } catch {
      // Błąd podczas oznaczania bannera - ignorujemy
    }
  }

  // Metody prywatne

  private generateConsentId(): string {
    return generateConsentId();
  }

  private isValidConsentData(consent: unknown): consent is CookieConsentStorage {
    if (!consent || typeof consent !== 'object' || consent === null) {
      return false;
    }
    
    const obj = consent as Record<string, unknown>;
    const preferences = obj.preferences;
    if (!preferences || typeof preferences !== 'object') {
      return false;
    }

    const prefs = preferences as Record<string, unknown>;
    
    return (
      typeof obj.version === 'string' &&
      typeof obj.consentId === 'string' &&
      typeof obj.timestamp === 'string' &&
      typeof prefs.necessary === 'boolean' &&
      typeof prefs.functional === 'boolean' &&
      typeof prefs.analytics === 'boolean' &&
      typeof prefs.marketing === 'boolean' &&
      Array.isArray(obj.history)
    );
  }

  private migrateConsentData(oldConsent: unknown): CookieConsentStorage | null {
    try {
      // Tworzymy nową zgodę z zachowaniem starych preferencji jeśli możliwe
      const newConsent = this.createDefaultConsent();
      
      if (oldConsent && typeof oldConsent === 'object' && oldConsent !== null) {
        const obj = oldConsent as Record<string, unknown>;
        
        if (obj.preferences && typeof obj.preferences === 'object' && obj.preferences !== null) {
          const prefs = obj.preferences as Record<string, unknown>;
          newConsent.preferences = {
            necessary: true, // zawsze true
            functional: Boolean(prefs.functional) || false,
            analytics: Boolean(prefs.analytics) || false,
            marketing: Boolean(prefs.marketing) || false
          };
        }

        if (typeof obj.hasShownBanner === 'boolean') {
          newConsent.hasShownBanner = obj.hasShownBanner;
        }
      }

      // Dodaj wpis do historii o migracji
      newConsent.history.push({
        action: 'update_preferences',
        timestamp: new Date().toISOString(),
        preferences: newConsent.preferences
      });

      return newConsent;
    } catch {
      return null;
    }
  }

  private performMigration(consent: CookieConsentStorage): CookieConsentStorage | null {
    // Tutaj można dodać specyficzną logikę migracji dla różnych wersji
    return this.migrateConsentData(consent);
  }

  // Fallback methods dla przypadków gdy localStorage nie działa

  private saveFallbackConsent(consent: CookieConsentStorage): void {
    try {
      const fallbackData = JSON.stringify({
        preferences: consent.preferences,
        hasShownBanner: consent.hasShownBanner,
        timestamp: consent.timestamp
      });
      
      document.cookie = `${COOKIE_CONSENT_KEY}_fallback=${encodeURIComponent(fallbackData)}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; SameSite=Lax`;
    } catch {
      // Błąd podczas zapisywania fallback - ignorujemy
    }
  }

  private loadFallbackConsent(): CookieConsentStorage | null {
    try {
      const cookies = document.cookie.split(';');
      const fallbackCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${COOKIE_CONSENT_KEY}_fallback=`)
      );

      if (!fallbackCookie) return null;

      const fallbackData = JSON.parse(
        decodeURIComponent(fallbackCookie.split('=')[1])
      );

      // Tworzymy pełną strukturę z fallback danych
      const consent = this.createDefaultConsent();
      consent.preferences = fallbackData.preferences || DEFAULT_COOKIE_PREFERENCES;
      consent.hasShownBanner = fallbackData.hasShownBanner || false;
      
      return consent;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const storageManager = new StorageManagerImpl();
