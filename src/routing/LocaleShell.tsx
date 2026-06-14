import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { isSupportedLocale } from '@/routing/routes.config';
import { resolveLocaleRedirect } from '@/routing/locale';
import { detectInitialLanguage } from '@/data/translations/loadLocale';
import { useLanguageContext } from '@/hooks/useLanguage';

export function LocaleRedirect() {
  const location = useLocation();
  const preferred = detectInitialLanguage();
  const target = resolveLocaleRedirect(location.pathname, preferred);

  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
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
    return <Navigate to={resolveLocaleRedirect(location.pathname, detectInitialLanguage())} replace />;
  }

  return <Outlet />;
}
