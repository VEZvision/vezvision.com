import type { ReactNode } from "react";
import { useEffect } from "react";
import { LanguageContext, useLanguage } from "../hooks/useLanguage";
import AppBootShell from "@/components/layout/AppBootShell";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageHook = useLanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = languageHook.language;
    }
  }, [languageHook.language]);

  if (!languageHook.localeReady) {
    return <AppBootShell />;
  }

  return (
    <LanguageContext.Provider value={languageHook}>
      {children}
    </LanguageContext.Provider>
  );
}
