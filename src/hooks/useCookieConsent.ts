import { useContext } from 'react';
import { CookieConsentContext } from '../contexts/CookieConsentContextDefinition';
import { CookiePreferences } from '../types/cookies';

// Hook do używania contextu
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }

  return context;
}

// Hook do sprawdzania czy kategoria cookies jest dozwolona
export function useCookieCategory(category: keyof CookiePreferences): boolean {
  const { state } = useCookieConsent();
  return state.preferences[category];
}

// Hook do sprawdzania czy użytkownik wyraził zgodę
export function useHasConsent(): boolean {
  const { state } = useCookieConsent();
  return state.hasConsent;
}