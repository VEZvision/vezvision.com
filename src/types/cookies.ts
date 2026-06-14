// Typy i interfejsy dla systemu zgody na cookies zgodnego z GDPR/RODO

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export type ConsentAction = 'accept_all' | 'reject_optional' | 'update_preferences' | 'reset';

export interface CookiePreferences {
  necessary: boolean; // zawsze true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentState {
  hasConsent: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  showPreferences: boolean;
  showPrivacyCenter: boolean;
  lastUpdated: string;
  version: string;
  consentId: string;
}

export interface CookieConsentActions {
  acceptAll: () => void;
  rejectOptional: () => void;
  updatePreferences: (preferences: CookiePreferences) => void;
  showPreferencesModal: () => void;
  hidePreferencesModal: () => void;
  showPrivacyCenterModal: () => void;
  hidePrivacyCenterModal: () => void;
  resetConsent: () => void;
}

export interface CookieInfo {
  name: string;
  value: string;
  category: CookieCategory;
  purpose: string;
  expiry: string;
  domain: string;
  provider: string;
  isFirstParty: boolean;
}

export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  purpose: string;
  provider: string;
  expiry: string;
  domain: string;
  isFirstParty: boolean;
}

export interface CookieCategoryConfig {
  id: CookieCategory;
  name: string;
  description: string;
  isRequired: boolean;
  legalBasis: string;
  cookies: string[];
}

export interface CookieConsentStorage {
  version: string;
  consentId: string;
  timestamp: string;
  preferences: CookiePreferences;
  hasShownBanner: boolean;
  history: Array<{
    action: ConsentAction;
    timestamp: string;
    preferences: CookiePreferences;
  }>;
  metadata?: Record<string, never>;
}

export interface CookieUtils {
  setCookie: (name: string, value: string, days: number) => void;
  getCookie: (name: string) => string | null;
  deleteCookie: (name: string) => void;
  getAllCookies: () => CookieInfo[];
  clearCookiesByCategory: (category: CookieCategory) => void;
}

export interface StorageManager {
  saveConsent: (consent: CookieConsentStorage) => void;
  loadConsent: () => CookieConsentStorage | null;
  clearConsent: () => void;
}

export interface AnalyticsManager {
  initializeAnalytics: (preferences: CookiePreferences) => void;
  trackEvent: (event: string, data?: unknown) => void;
  updateConsentMode: (preferences: CookiePreferences) => void;
  disableAnalytics: () => void;
}

// Stałe konfiguracyjne
export const COOKIE_CONSENT_VERSION = '1.0.0';
export const COOKIE_CONSENT_KEY = 'vezvision_cookie_consent';
export const COOKIE_CONSENT_EXPIRY_DAYS = 365;

// Domyślne preferencje cookies
export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

// Akcje dla reducera
export type CookieConsentActionType =
  | { type: 'ACCEPT_ALL' }
  | { type: 'REJECT_OPTIONAL' }
  | { type: 'UPDATE_PREFERENCES'; payload: CookiePreferences }
  | { type: 'SHOW_BANNER' }
  | { type: 'HIDE_BANNER' }
  | { type: 'SHOW_PREFERENCES' }
  | { type: 'HIDE_PREFERENCES' }
  | { type: 'SHOW_PRIVACY_CENTER' }
  | { type: 'HIDE_PRIVACY_CENTER' }
  | { type: 'RESET_CONSENT' }
  | { type: 'LOAD_CONSENT'; payload: CookieConsentStorage };
