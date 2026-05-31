import { COOKIE_CATEGORIES, COOKIE_DEFINITIONS } from '../../../data/cookieDefinitions';
import type { CookiePreferences } from '../../../types/cookies';

interface CookiesTabProps {
  t: (key: string) => string;
  preferences: CookiePreferences;
}

export function CookiesTab({ t, preferences }: CookiesTabProps) {
  return (
    <div id="panel-cookies" role="tabpanel" className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('privacy.cookies.details.title')}</h3>
        <p className="text-sm text-gray-600 mb-6">
          {t('privacy.cookies.details.description')}
        </p>
      </div>

      <div className="space-y-6">
        {COOKIE_CATEGORIES.map((category) => {
          const isEnabled = preferences[category.id];
          const categoryCookies = COOKIE_DEFINITIONS.filter(
            (cookie) => cookie.category === category.id
          );

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`px-4 py-3 flex items-center justify-between ${isEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{category.description}</p>
                </div>
                <div className={`ml-3 px-3 py-1 rounded-full text-sm font-medium shrink-0 ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {isEnabled ? t('privacy.overview.enabled') : t('privacy.overview.disabled')}
                </div>
              </div>

              {categoryCookies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-gray-200 bg-gray-50/50">
                        <th className="px-4 py-2 text-left font-medium text-gray-700">{t('privacy.cookies.table.name')}</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">{t('privacy.cookies.purpose')}</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">{t('privacy.cookies.provider')}</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">{t('privacy.cookies.validity')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryCookies.map((cookie) => (
                        <tr key={cookie.name} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-4 py-2 font-mono text-xs text-gray-900">{cookie.name}</td>
                          <td className="px-4 py-2 text-gray-600">{cookie.purpose}</td>
                          <td className="px-4 py-2 text-gray-600">{cookie.provider}</td>
                          <td className="px-4 py-2 text-gray-600">{cookie.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500 italic">
                  {t('privacy.cookies.empty')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
