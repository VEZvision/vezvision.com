import { Shield, Database, Settings } from "lucide-react";
import type { CookieConsentState } from "@/types/cookies";

interface OverviewTabProps {
  t: (key: string) => string;
  language: string;
  state: CookieConsentState;
  activeCookiesCount: number;
  totalCookiesCount: number;
  onShowPreferences: () => void;
}

export function OverviewTab({
  t,
  language,
  state,
  activeCookiesCount,
  totalCookiesCount,
  onShowPreferences,
}: OverviewTabProps) {
  return (
    <div id="panel-overview" role="tabpanel" className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("privacy.overview.status")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" aria-hidden="true" />
              <div>
                <h4 className="font-medium text-green-900">
                  {t("privacy.overview.consent.granted")}
                </h4>
                <p className="text-sm text-green-700">
                  {new Date(state.lastUpdated).toLocaleDateString(
                    language === "pl" ? "pl-PL" : "en-US",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" aria-hidden="true" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {t("privacy.overview.cookies.active")}
                </h4>
                <p className="text-sm text-blue-700">
                  {activeCookiesCount} {t("common.of")} {totalCookiesCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("privacy.overview.preferences")}
        </h3>
        <div className="space-y-3">
          {(["necessary", "functional", "analytics", "marketing"] as const).map(
            (categoryId) => {
              const isEnabled = state.preferences[categoryId];
              const categoryNames: Record<string, string> = {
                necessary: t("privacy.category.necessary") || "Niezbędne",
                functional: t("privacy.category.functional") || "Funkcjonalne",
                analytics: t("privacy.category.analytics") || "Analityczne",
                marketing: t("privacy.category.marketing") || "Marketingowe",
              };
              const categoryDescs: Record<string, string> = {
                necessary:
                  t("privacy.category.necessary.desc") ||
                  "Wymagane do działania strony.",
                functional:
                  t("privacy.category.functional.desc") ||
                  "Personalizacja i wygoda.",
                analytics:
                  t("privacy.category.analytics.desc") ||
                  "Anonimowe statystyki.",
                marketing:
                  t("privacy.category.marketing.desc") ||
                  "Reklamy dopasowane do Ciebie.",
              };
              return (
                <div
                  key={categoryId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {categoryNames[categoryId]}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {categoryDescs[categoryId]}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isEnabled
                      ? t("privacy.overview.enabled")
                      : t("privacy.overview.disabled")}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onShowPreferences}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          {t("privacy.overview.change")}
        </button>
      </div>
    </div>
  );
}
