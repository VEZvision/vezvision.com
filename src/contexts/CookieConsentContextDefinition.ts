import { createContext } from "react";
import type {
  CookieConsentState,
  CookieConsentActions,
} from "../types/cookies";

export const CookieConsentContext = createContext<{
  state: CookieConsentState;
  actions: CookieConsentActions;
} | null>(null);
