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
      void 0;
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
      void 0;
    }
  }

  clearCookiesByCategory(category: CookieCategory): void {
    try {
      const definedCookies = COOKIE_DEFINITIONS
        .filter(def => def.category === category)
        .map(def => def.name);
      
      definedCookies.forEach(name => this.deleteCookie(name));

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
      void 0;
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
            purpose: definition?.purpose || 'Unknown purpose',
            expiry: definition?.expiry || 'Unknown',
            domain: definition?.domain || window.location.hostname,
            provider: definition?.provider || 'Unknown',
            isFirstParty: definition?.isFirstParty ?? true
          });
        }
      }
      
      return cookies;
    } catch {
      return [];
    }
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

export const cookieUtils = new CookieUtilsImpl();

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

export const areCookiesEnabled = (): boolean => cookieUtils.areCookiesEnabled();
