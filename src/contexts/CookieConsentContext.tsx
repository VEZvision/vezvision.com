import { useReducer, useEffect, ReactNode } from 'react';
import {
  CookieConsentState,
  CookieConsentActions,
  CookieConsentActionType,
  CookiePreferences,
  DEFAULT_COOKIE_PREFERENCES,
  COOKIE_CONSENT_VERSION
} from '../types/cookies';
import { generateConsentId, storageManager } from '../utils/storageManager';
import { clearCookiesByCategory } from '../utils/cookieUtils';
import { handleConsentChange } from '../lib/sentryConsent';
import { applyGoogleAnalyticsConsent } from '../lib/googleAnalyticsConsent';

// Stan początkowy
const initialState: CookieConsentState = {
  hasConsent: false,
  preferences: { ...DEFAULT_COOKIE_PREFERENCES },
  showBanner: false,
  showPreferences: false,
  showPrivacyCenter: false,
  lastUpdated: new Date().toISOString(),
  version: COOKIE_CONSENT_VERSION,
  consentId: ''
};

// Reducer do zarządzania stanem
function cookieConsentReducer(
  state: CookieConsentState,
  action: CookieConsentActionType
): CookieConsentState {
  switch (action.type) {
    case 'ACCEPT_ALL':
      return {
        ...state,
        hasConsent: true,
        preferences: {
          necessary: true,
          functional: true,
          analytics: true,
          marketing: true
        },
        showBanner: false,
        lastUpdated: new Date().toISOString()
      };

    case 'REJECT_OPTIONAL':
      return {
        ...state,
        hasConsent: true,
        preferences: {
          necessary: true,
          functional: false,
          analytics: false,
          marketing: false
        },
        showBanner: false,
        lastUpdated: new Date().toISOString()
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        hasConsent: true,
        preferences: {
          ...action.payload,
          necessary: true
        },
        showBanner: false,
        showPreferences: false,
        lastUpdated: new Date().toISOString()
      };

    case 'SHOW_BANNER':
      return {
        ...state,
        showBanner: true
      };

    case 'HIDE_BANNER':
      return {
        ...state,
        showBanner: false
      };

    case 'SHOW_PREFERENCES':
      return {
        ...state,
        showPreferences: true
      };

    case 'HIDE_PREFERENCES':
      return {
        ...state,
        showPreferences: false
      };

    case 'SHOW_PRIVACY_CENTER':
      return {
        ...state,
        showPrivacyCenter: true
      };

    case 'HIDE_PRIVACY_CENTER':
      return {
        ...state,
        showPrivacyCenter: false
      };

    case 'RESET_CONSENT':
      return {
        ...initialState,
        showBanner: true,
        consentId: generateConsentId()
      };

    case 'LOAD_CONSENT':
      return {
        ...state,
        hasConsent: true,
        preferences: action.payload.preferences,
        consentId: action.payload.consentId,
        lastUpdated: action.payload.timestamp,
        version: action.payload.version,
        showBanner: false
      };

    default:
      return state;
  }
}

import { CookieConsentContext } from './CookieConsentContextDefinition';

// Provider Props
interface CookieConsentProviderProps {
  children: ReactNode;
}

// Provider Component
export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [state, dispatch] = useReducer(cookieConsentReducer, initialState);

  // Ładowanie zgody przy starcie aplikacji
  useEffect(() => {
    const loadStoredConsent = () => {
      try {
        const storedConsent = storageManager.loadConsent();

        if (storedConsent) {
          // Sprawdź czy wersja się zgadza
          if (storedConsent.version !== COOKIE_CONSENT_VERSION) {
            dispatch({ type: 'SHOW_BANNER' });
            return;
          }

          // Załaduj zapisaną zgodę
          dispatch({ type: 'LOAD_CONSENT', payload: storedConsent });

          // Zastosuj preferencje cookies
          applyCookiePreferences(storedConsent.preferences);
        } else {
          // Brak zapisanej zgody - pokaż banner
          dispatch({ type: 'SHOW_BANNER' });
        }
      } catch {
        // W przypadku błędu, pokazujemy banner
        dispatch({ type: 'SHOW_BANNER' });
      }
    };

    loadStoredConsent();
  }, []);

  const applyCookiePreferences = (preferences: CookiePreferences) => {
    try {
      if (!preferences.functional) {
        clearCookiesByCategory('functional');
      }
      if (!preferences.analytics) {
        clearCookiesByCategory('analytics');
      }
      if (!preferences.marketing) {
        clearCookiesByCategory('marketing');
      }

      void handleConsentChange(preferences);
      applyGoogleAnalyticsConsent(preferences.analytics);

      window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
        detail: preferences
      }));
    } catch {
      // fail silently
    }
  };

  // Funkcja do zapisywania zgody
  const saveConsent = (preferences: CookiePreferences, action: 'accept_all' | 'reject_optional' | 'update_preferences') => {
    try {
      const consentData = storageManager.createDefaultConsent();
      consentData.preferences = preferences;
      consentData.hasShownBanner = true;
      consentData.consentId = state.consentId || consentData.consentId;

      storageManager.updatePreferences(preferences, action);
      applyCookiePreferences(preferences);
    } catch {
      // Błąd podczas zapisywania zgody - ignorujemy
    }
  };

  // Actions
  const actions: CookieConsentActions = {
    acceptAll: () => {
      const preferences: CookiePreferences = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true
      };

      dispatch({ type: 'ACCEPT_ALL' });
      saveConsent(preferences, 'accept_all');
    },

    rejectOptional: () => {
      const preferences: CookiePreferences = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false
      };

      dispatch({ type: 'REJECT_OPTIONAL' });
      saveConsent(preferences, 'reject_optional');
    },

    updatePreferences: (preferences: CookiePreferences) => {
      const finalPreferences = {
        ...preferences,
        necessary: true // zawsze true
      };

      dispatch({ type: 'UPDATE_PREFERENCES', payload: finalPreferences });
      saveConsent(finalPreferences, 'update_preferences');
    },

    showPreferencesModal: () => {
      dispatch({ type: 'SHOW_PREFERENCES' });
    },

    hidePreferencesModal: () => {
      dispatch({ type: 'HIDE_PREFERENCES' });
    },

    showPrivacyCenterModal: () => {
      dispatch({ type: 'SHOW_PRIVACY_CENTER' });
    },

    hidePrivacyCenterModal: () => {
      dispatch({ type: 'HIDE_PRIVACY_CENTER' });
    },

    resetConsent: () => {
      try {
        storageManager.clearConsent();
        // Usuń wszystkie opcjonalne cookies
        clearCookiesByCategory('functional');
        clearCookiesByCategory('analytics');
        clearCookiesByCategory('marketing');

        dispatch({ type: 'RESET_CONSENT' });
      } catch {
        // Błąd podczas resetowania zgody - ignorujemy
      }
    }
  };

  return (
    <CookieConsentContext.Provider value={{ state, actions }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
