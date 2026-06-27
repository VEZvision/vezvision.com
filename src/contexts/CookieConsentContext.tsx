import type { ReactNode } from "react";
import { useReducer, useEffect, useMemo, useCallback } from "react";
import type {
  CookieConsentState,
  CookieConsentActions,
  CookieConsentActionType,
  CookiePreferences,
} from "../types/cookies";
import {
  DEFAULT_COOKIE_PREFERENCES,
  COOKIE_CONSENT_VERSION,
} from "../types/cookies";
import { generateConsentId, storageManager } from "../utils/storageManager";
import { clearCookiesByCategory } from "../utils/cookieUtils";
import { handleConsentChange } from "../lib/sentryConsent";
import { applyGoogleAnalyticsConsent } from "../lib/googleAnalyticsConsent";

const initialState: CookieConsentState = {
  hasConsent: false,
  preferences: { ...DEFAULT_COOKIE_PREFERENCES },
  showBanner: false,
  showPreferences: false,
  showPrivacyCenter: false,
  lastUpdated: new Date().toISOString(),
  version: COOKIE_CONSENT_VERSION,
  consentId: "",
};

function createInitialCookieConsentState(): CookieConsentState {
  try {
    const storedConsent = storageManager.loadConsent();

    if (storedConsent) {
      if (storedConsent.version !== COOKIE_CONSENT_VERSION) {
        return {
          ...initialState,
          showBanner: true,
          consentId: generateConsentId(),
        };
      }

      return {
        ...initialState,
        hasConsent: true,
        preferences: storedConsent.preferences,
        consentId: storedConsent.consentId,
        lastUpdated: storedConsent.timestamp,
        version: storedConsent.version,
        showBanner: false,
      };
    }
  } catch {
    /* fall through to first-visit banner */
  }

  return {
    ...initialState,
    showBanner: true,
    consentId: generateConsentId(),
  };
}

function cookieConsentReducer(
  state: CookieConsentState,
  action: CookieConsentActionType,
): CookieConsentState {
  switch (action.type) {
    case "ACCEPT_ALL":
      return {
        ...state,
        hasConsent: true,
        preferences: {
          necessary: true,
          functional: true,
          analytics: true,
          marketing: true,
        },
        showBanner: false,
        lastUpdated: new Date().toISOString(),
      };

    case "REJECT_OPTIONAL":
      return {
        ...state,
        hasConsent: true,
        preferences: {
          necessary: true,
          functional: false,
          analytics: false,
          marketing: false,
        },
        showBanner: false,
        lastUpdated: new Date().toISOString(),
      };

    case "UPDATE_PREFERENCES":
      return {
        ...state,
        hasConsent: true,
        preferences: {
          ...action.payload,
          necessary: true,
        },
        showBanner: false,
        showPreferences: false,
        lastUpdated: new Date().toISOString(),
      };

    case "SHOW_BANNER":
      return {
        ...state,
        showBanner: true,
      };

    case "HIDE_BANNER":
      return {
        ...state,
        showBanner: false,
      };

    case "SHOW_PREFERENCES":
      return {
        ...state,
        showPreferences: true,
      };

    case "HIDE_PREFERENCES":
      return {
        ...state,
        showPreferences: false,
      };

    case "SHOW_PRIVACY_CENTER":
      return {
        ...state,
        showPrivacyCenter: true,
      };

    case "HIDE_PRIVACY_CENTER":
      return {
        ...state,
        showPrivacyCenter: false,
      };

    case "RESET_CONSENT":
      return {
        ...initialState,
        showBanner: true,
        consentId: generateConsentId(),
      };

    case "LOAD_CONSENT":
      return {
        ...state,
        hasConsent: true,
        preferences: action.payload.preferences,
        consentId: action.payload.consentId,
        lastUpdated: action.payload.timestamp,
        version: action.payload.version,
        showBanner: false,
      };

    default:
      return state;
  }
}

import { CookieConsentContext } from "./CookieConsentContextDefinition";

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
  const [state, dispatch] = useReducer(
    cookieConsentReducer,
    undefined,
    createInitialCookieConsentState,
  );

  const applyCookiePreferences = useCallback(
    (preferences: CookiePreferences) => {
      try {
        if (!preferences.functional) {
          clearCookiesByCategory("functional");
        }
        if (!preferences.analytics) {
          clearCookiesByCategory("analytics");
        }
        if (!preferences.marketing) {
          clearCookiesByCategory("marketing");
        }

        void handleConsentChange(preferences);
        applyGoogleAnalyticsConsent(preferences.analytics);

        window.dispatchEvent(
          new CustomEvent("cookiePreferencesChanged", {
            detail: preferences,
          }),
        );
      } catch {
        /* cookie cleanup non-critical */
      }
    },
    [],
  );

  const saveConsent = useCallback(
    (
      preferences: CookiePreferences,
      action: "accept_all" | "reject_optional" | "update_preferences",
    ) => {
      try {
        const consentData = storageManager.createDefaultConsent();
        consentData.preferences = preferences;
        consentData.hasShownBanner = true;
        consentData.consentId = state.consentId || consentData.consentId;

        storageManager.updatePreferences(preferences, action);
        applyCookiePreferences(preferences);
      } catch {
        /* consent persistence non-critical */
      }
    },
    [state.consentId, applyCookiePreferences],
  );

  const actions: CookieConsentActions = useMemo(
    () => ({
      acceptAll: () => {
        const preferences: CookiePreferences = {
          necessary: true,
          functional: true,
          analytics: true,
          marketing: true,
        };

        dispatch({ type: "ACCEPT_ALL" });
        saveConsent(preferences, "accept_all");
      },

      rejectOptional: () => {
        const preferences: CookiePreferences = {
          necessary: true,
          functional: false,
          analytics: false,
          marketing: false,
        };

        dispatch({ type: "REJECT_OPTIONAL" });
        saveConsent(preferences, "reject_optional");
      },

      updatePreferences: (preferences: CookiePreferences) => {
        const finalPreferences = {
          ...preferences,
          necessary: true,
        };

        dispatch({ type: "UPDATE_PREFERENCES", payload: finalPreferences });
        saveConsent(finalPreferences, "update_preferences");
      },

      showPreferencesModal: () => {
        dispatch({ type: "SHOW_PREFERENCES" });
      },

      hidePreferencesModal: () => {
        dispatch({ type: "HIDE_PREFERENCES" });
      },

      showPrivacyCenterModal: () => {
        dispatch({ type: "SHOW_PRIVACY_CENTER" });
      },

      hidePrivacyCenterModal: () => {
        dispatch({ type: "HIDE_PRIVACY_CENTER" });
      },

      resetConsent: () => {
        try {
          storageManager.clearConsent();
          clearCookiesByCategory("functional");
          clearCookiesByCategory("analytics");
          clearCookiesByCategory("marketing");

          dispatch({ type: "RESET_CONSENT" });
        } catch {
          /* consent reset non-critical */
        }
      },
    }),
    [saveConsent],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  useEffect(() => {
    if (!state.hasConsent) return;
    applyCookiePreferences(state.preferences);
  }, [applyCookiePreferences, state.hasConsent, state.preferences]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}
