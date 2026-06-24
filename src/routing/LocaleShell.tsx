import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { isSupportedLocale } from "@/routing/routes.config";
import { resolveLocaleRedirect } from "@/routing/locale";
import { useLanguageContext } from "@/hooks/useLanguage";

export function LocaleRedirect() {
  const location = useLocation();
  const target = resolveLocaleRedirect(location.pathname);

  return (
    <Navigate to={`${target}${location.search}${location.hash}`} replace />
  );
}

export function LocaleGate() {
  const { lang } = useParams();
  const location = useLocation();
  const { setLanguage } = useLanguageContext();

  useEffect(() => {
    if (isSupportedLocale(lang)) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  if (!isSupportedLocale(lang)) {
    return <Navigate to={resolveLocaleRedirect(location.pathname)} replace />;
  }

  return <Outlet />;
}
