import { useState, useEffect } from "react";
import { X, Eye, Database, User, Shield } from "lucide-react";
import { useCookieConsent } from "../../hooks/useCookieConsent";
import { COOKIE_DEFINITIONS } from "../../data/cookieDefinitions";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useSettings } from "@/hooks/useSettings";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useModalTransition } from "@/hooks/useModalTransition";
import { toast } from "sonner";
import { OverviewTab, CookiesTab, DataTab, RightsTab } from "./privacy-tabs";

interface PrivacyCenterProps {
  className?: string;
}

interface DataExportItem {
  category: string;
  data: string;
  lastModified: string;
}

export function PrivacyCenter({ className = "" }: PrivacyCenterProps) {
  const { state, actions } = useCookieConsent();
  const { contact } = useSettings();
  const { t, language } = useLanguageContext();
  const { isVisible, isAnimating } = useModalTransition(
    state.showPrivacyCenter,
    {
      enterDelay: 50,
      exitDuration: 300,
    },
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "cookies" | "data" | "rights"
  >("overview");
  const [isExporting, setIsExporting] = useState(false);

  useBodyScrollLock(state.showPrivacyCenter);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.showPrivacyCenter) return;

      switch (event.key) {
        case "Escape":
          actions.hidePrivacyCenterModal();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
          if (event.ctrlKey || event.metaKey) {
            const tabs = ["overview", "cookies", "data", "rights"] as const;
            setActiveTab(tabs[parseInt(event.key) - 1]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.showPrivacyCenter, actions]);

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const exportData: DataExportItem[] = [
        {
          category: t("privacy.data.export.category.preferences"),
          data: JSON.stringify(state.preferences, null, 2),
          lastModified: state.lastUpdated,
        },
        {
          category: t("privacy.data.export.category.history"),
          data: `${t("privacy.data.consent.id")}: ${state.consentId}\n${t("privacy.data.consent.version")}: ${state.version}\n${t("privacy.data.consent.date")}: ${state.lastUpdated}`,
          lastModified: state.lastUpdated,
        },
      ];

      const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `privacy-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("privacy.data.export.error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = () => {
    if (confirm(t("privacy.data.delete.confirm"))) {
      actions.resetConsent();
      actions.hidePrivacyCenterModal();
    }
  };

  const getActiveCookies = () => {
    return COOKIE_DEFINITIONS.filter((cookie) => {
      if (cookie.category === "necessary") return true;
      return state.preferences[
        cookie.category as keyof typeof state.preferences
      ];
    });
  };

  const tabs = [
    { id: "overview" as const, label: t("privacy.center.overview"), icon: Eye },
    {
      id: "cookies" as const,
      label: t("privacy.center.cookies"),
      icon: Database,
    },
    { id: "data" as const, label: t("privacy.center.data"), icon: User },
    { id: "rights" as const, label: t("privacy.center.rights"), icon: Shield },
  ];
  const contactEmail = contact?.email || "";

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={actions.hidePrivacyCenterModal}
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl transition-all duration-300 ease-out ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          role="dialog"
          aria-labelledby="privacy-center-title"
          aria-describedby="privacy-center-description"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2
                id="privacy-center-title"
                className="text-2xl font-bold text-gray-900"
              >
                {t("privacy.center.title")}
              </h2>
              <p
                id="privacy-center-description"
                className="mt-1 text-sm text-gray-600"
              >
                {t("privacy.center.description")}
              </p>
            </div>
            <button
              type="button"
              onClick={actions.hidePrivacyCenterModal}
              className="p-2 text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
              aria-label={t("privacy.center.close")}
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div
                className="space-y-2"
                role="tablist"
                aria-orientation="vertical"
              >
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium">{tab.label}</span>
                      <kbd className="ml-auto px-1.5 py-0.5 text-xs font-mono bg-gray-200 border border-gray-300 rounded">
                        {index + 1}
                      </kbd>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {t("privacy.center.shortcuts")}
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{t("privacy.center.shortcuts.close")}</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-gray-200 border border-gray-300 rounded">
                      Esc
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("privacy.center.shortcuts.tabs")}</span>
                    <kbd className="px-1.5 py-0.5 font-mono bg-gray-200 border border-gray-300 rounded">
                      Ctrl+1-4
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "overview" && (
                <OverviewTab
                  t={t}
                  language={language}
                  state={state}
                  activeCookiesCount={getActiveCookies().length}
                  totalCookiesCount={COOKIE_DEFINITIONS.length}
                  onShowPreferences={actions.showPreferencesModal}
                />
              )}

              {activeTab === "cookies" && (
                <CookiesTab t={t} preferences={state.preferences} />
              )}

              {activeTab === "data" && (
                <DataTab
                  t={t}
                  language={language}
                  state={state}
                  isExporting={isExporting}
                  onExport={handleExportData}
                  onDelete={handleDeleteAllData}
                />
              )}

              {activeTab === "rights" && (
                <RightsTab t={t} contactEmail={contactEmail} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
