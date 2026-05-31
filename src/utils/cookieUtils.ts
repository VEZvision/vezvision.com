import { CookieCategory, CookieInfo, CookieUtils, CookiePreferences } from '../types/cookies';
import { COOKIE_DEFINITIONS, getCookieDefinition } from '../data/cookieDefinitions';

const NECESSARY_CATEGORIES: CookieCategory[] = ['necessary'];

// Known cookie prefixes by category (for cookies not in COOKIE_DEFINITIONS)
const CATEGORY_PATTERNS: Record<CookieCategory, RegExp[]> = {
  necessary: [/^vezvision_/, /^sb-/],
  functional: [],
  analytics: [/^sentry_/, /^_sentry/],
  marketing: [/_fbp$/, /^_ga/, /^_gid/, /^_gat/],
};

export function isCategoryAllowed(category: CookieCategory, preferences: CookiePreferences): boolean {
  if (NECESSARY_CATEGORIES.includes(category)) return true;
  return preferences[category] === true;
}

// Implementacja utilities do zarządzania cookies w przeglądarce
export class CookieUtilsImpl implements CookieUtils {
  
  setCookie(name: string, value: string, days: number): void {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${
        window.location.protocol === 'https:' ? '; Secure' : ''
      }`;
      
      document.cookie = cookieString;
    } catch {
      // fail silently
    }
  }

  getCookie(name: string): string | null {
    try {
      const nameEQ = `${name}=`;
      const cookies = document.cookie.split(';');
      
      for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(nameEQ)) {
          return decodeURIComponent(trimmedCookie.substring(nameEQ.length));
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  deleteCookie(name: string): void {
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch {
      // Silent fail for cookie deletion errors
    }
  }

  clearCookiesByCategory(category: CookieCategory): void {
    try {
      const definedCookies = COOKIE_DEFINITIONS
        .filter(def => def.category === category)
        .map(def => def.name);
      
      definedCookies.forEach(name => this.deleteCookie(name));

      // Also delete cookies matching known category patterns (e.g. Sentry, GA)
      const patterns = CATEGORY_PATTERNS[category] || [];
      if (patterns.length > 0) {
        const allCookies = document.cookie.split(';');
        for (const cookie of allCookies) {
          const name = cookie.trim().split('=')[0];
          if (name && patterns.some(pattern => pattern.test(name))) {
            this.deleteCookie(name);
          }
        }
      }
    } catch {
      // fail silently
    }
  }

  getAllCookies(): CookieInfo[] {
    try {
      const cookies: CookieInfo[] = [];
      const cookieStrings = document.cookie.split(';');
      
      for (const cookieString of cookieStrings) {
        const [name, value] = cookieString.trim().split('=');
        if (name && value) {
          const definition = getCookieDefinition(name);
          
          cookies.push({
            name: name.trim(),
            value: decodeURIComponent(value),
            category: definition?.category || 'necessary',
            purpose: definition?.purpose || 'Nieznany cel',
            expiry: definition?.expiry || 'Nieznany',
            domain: definition?.domain || window.location.hostname,
            provider: definition?.provider || 'Nieznany',
            isFirstParty: definition?.isFirstParty ?? true
          });
        }
      }
      
      return cookies;
    } catch {
      return [];
    }
  }

  clearAllOptionalCookies(): void {
    try {
      const optionalCookies = COOKIE_DEFINITIONS
        .filter(def => def.category !== 'necessary')
        .map(def => def.name);
      
      optionalCookies.forEach(name => this.deleteCookie(name));
    } catch {
      // Silent fail for optional cookies clearing
    }
  }

  clearAllCookies(): void {
    try {
      const allCookies = COOKIE_DEFINITIONS.map(def => def.name);
      allCookies.forEach(name => this.deleteCookie(name));
    } catch {
      // Silent fail for all cookies clearing
    }
  }

  getCookiesSize(): number {
    try {
      return new Blob([document.cookie]).size;
    } catch {
      return 0;
    }
  }

  cookieExists(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  getCookiesByCategory(category: CookieCategory): CookieInfo[] {
    return this.getAllCookies().filter(cookie => cookie.category === category);
  }

  areCookiesEnabled(): boolean {
    try {
      const testCookie = 'test_cookie_enabled';
      this.setCookie(testCookie, 'test', 1);
      const enabled = this.getCookie(testCookie) === 'test';
      this.deleteCookie(testCookie);
      return enabled;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const cookieUtils = new CookieUtilsImpl();

// Funkcje pomocnicze dla łatwiejszego użycia
export const setCookie = (name: string, value: string, days: number = 365) => {
  cookieUtils.setCookie(name, value, days);
};

export const getCookie = (name: string): string | null => {
  return cookieUtils.getCookie(name);
};

export const deleteCookie = (name: string): void => {
  cookieUtils.deleteCookie(name);
};

export const clearCookiesByCategory = (category: CookieCategory): void => {
  cookieUtils.clearCookiesByCategory(category);
};

export const getAllCookies = (): CookieInfo[] => {
  return cookieUtils.getAllCookies();
};

export const areCookiesEnabled = (): boolean => {
  return cookieUtils.areCookiesEnabled();
};
