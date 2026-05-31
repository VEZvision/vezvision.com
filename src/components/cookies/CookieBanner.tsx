import { useEffect, useState, memo, useCallback } from 'react';
import { X, Settings, Shield, Info } from 'lucide-react';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { useLanguageContext } from '../../hooks/useLanguage';

interface CookieBannerProps {
  className?: string;
}

export const CookieBanner = memo(({ className = '' }: CookieBannerProps) => {
  const { state, actions } = useCookieConsent();
  const { t } = useLanguageContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoized handlers
  const handleShowPreferences = useCallback(() => {
    actions.showPreferencesModal();
  }, [actions]);

  const handleRejectOptional = useCallback(() => {
    actions.rejectOptional();
  }, [actions]);

  const handleAcceptAll = useCallback(() => {
    actions.acceptAll();
  }, [actions]);

  // Animacja pojawiania się bannera
  useEffect(() => {
    if (state.showBanner) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [state.showBanner]);

  // Obsługa klawiatury
  useEffect(() => {
    if (!state.showBanner) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          actions.rejectOptional();
          break;
        case 'Enter':
          if (event.ctrlKey || event.metaKey) {
            actions.acceptAll();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.showBanner, actions]);

  if (!isVisible || state.showPreferences) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ease-out ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } ${className}`}
      role="banner"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
            
            {/* Główna zawartość */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="w-6 h-6 text-black" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 
                    id="cookie-banner-title"
                    className="text-lg font-semibold text-black mb-2"
                  >
                    {t('cookie.banner.title')}
                  </h2>
                  
                  <p 
                    id="cookie-banner-description"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {t('cookie.banner.description')}
                  </p>
                  
                  {/* Dodatkowe informacje na desktop */}
                  <div className="hidden sm:flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-black" aria-hidden="true" />
                      <span>{t('cookie.banner.gdpr')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-black" aria-hidden="true" />
                      <span>{t('cookie.banner.secure')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 lg:flex-shrink-0 lg:ml-6">
              
              {/* Przycisk ustawień */}
              <button
                onClick={handleShowPreferences}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-black bg-white border border-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors duration-200"
                aria-label={t('cookie.banner.settings')}
                type="button"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('cookie.banner.customize')}</span>
                <span className="sm:hidden">{t('cookie.banner.settings')}</span>
              </button>

              {/* Przycisk odrzuć opcjonalne */}
              <button
                onClick={handleRejectOptional}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors duration-200"
                aria-label={t('cookie.banner.necessary')}
                type="button"
              >
                {t('cookie.banner.necessary')}
              </button>

              {/* Przycisk akceptuj wszystkie */}
              <button
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-colors duration-200"
                aria-label={t('cookie.banner.accept')}
                type="button"
              >
                {t('cookie.banner.accept')}
              </button>
            </div>
          </div>

          {/* Informacje o skrótach klawiszowych - tylko na desktop */}
          <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Esc</kbd>
                <span>{t('cookie.banner.shortcuts.necessary')}</span>
              </span>
              <span className="mx-3">•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Enter</kbd>
                <span>{t('cookie.banner.shortcuts.accept')}</span>
              </span>
            </div>
            
            <button
              onClick={handleRejectOptional}
              className="p-1 text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 rounded transition-colors duration-200"
              aria-label={t('cookie.banner.close')}
              type="button"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CookieBanner.displayName = 'CookieBanner';

export default CookieBanner;