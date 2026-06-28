import { useState, useEffect, useCallback } from "react";
import { X, Shield, BarChart3, Target, Cog, Info, Check } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useModalTransition } from "@/hooks/useModalTransition";
import type { CookiePreferences as CookiePreferencesType } from "@/types/cookies";
import { COOKIE_CATEGORIES } from "@/data/cookieDefinitions";

interface CookiePreferencesProps {
  className?: string;
}

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-describedby"?: string;
}

function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled = false,
  "aria-describedby": ariaDescribedBy,
}: ToggleSwitchProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
        disabled
          ? "bg-gray-200 cursor-not-allowed"
          : checked
            ? "bg-black hover:bg-gray-800"
            : "bg-gray-300 hover:bg-gray-400"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {disabled && (
        <Check
          className="absolute inset-0 m-auto w-3 h-3 text-gray-500"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function CookiePreferences({ className = "" }: CookiePreferencesProps) {
  const { state, actions } = useCookieConsent();
  const { t } = useLanguageContext();
  const [localPreferences, setLocalPreferences] =
    useState<CookiePreferencesType>(state.preferences);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { isVisible, isAnimating } = useModalTransition(state.showPreferences, {
    enterDelay: 50,
    exitDuration: 300,
  });

  // Lock body scroll when modal is open
  useBodyScrollLock(state.showPreferences);

  // Synchronizuj lokalne preferencje ze stanem
  useEffect(() => {
    setLocalPreferences(state.preferences);
  }, [state.preferences]);

  // Obsługa klawiatury
  const handleSavePreferences = useCallback(() => {
    actions.updatePreferences(localPreferences);
  }, [actions, localPreferences]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.showPreferences) return;

      if (event.key === "Escape") {
        actions.hidePreferencesModal();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        handleSavePreferences();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.showPreferences, actions, handleSavePreferences]);

  const handlePreferenceChange = (
    category: keyof CookiePreferencesType,
    value: boolean,
  ) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferencesType = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setLocalPreferences(allAccepted);
    actions.updatePreferences(allAccepted);
  };

  const handleRejectOptional = () => {
    const onlyNecessary: CookiePreferencesType = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setLocalPreferences(onlyNecessary);
    actions.updatePreferences(onlyNecessary);
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "necessary":
        return Shield;
      case "functional":
        return Cog;
      case "analytics":
        return BarChart3;
      case "marketing":
        return Target;
      default:
        return Info;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "necessary":
        return "text-black bg-gray-100";
      case "functional":
        return "text-black bg-gray-100";
      case "analytics":
        return "text-black bg-gray-100";
      case "marketing":
        return "text-black bg-gray-100";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[10001] ${className}`}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        } z-[10000]`}
        onClick={actions.hidePreferencesModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10002]">
        <div
          className={`relative w-full max-w-4xl max-h-[95vh] bg-white rounded-xl shadow-2xl transition-all duration-300 ease-out flex flex-col ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          role="dialog"
          aria-labelledby="preferences-title"
          aria-describedby="preferences-description"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2
                id="preferences-title"
                className="text-2xl font-bold text-black"
              >
                {t("cookie.preferences.title")}
              </h2>
              <p
                id="preferences-description"
                className="mt-1 text-sm text-gray-600"
              >
                {t("cookie.preferences.description")}
              </p>
            </div>
            <button
              onClick={actions.hidePreferencesModal}
              className="p-2 text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
              aria-label={t("cookie.preferences.close")}
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div
            className="flex-1 overflow-y-auto overscroll-y-contain p-6 space-y-6 min-h-0"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {/* Informacja ogólna */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info
                  className="w-5 h-5 text-black mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="text-sm text-gray-800">
                  <p className="font-medium mb-1 text-black">
                    {t("cookie.preferences.info.title")}
                  </p>
                  <p>{t("cookie.preferences.info.description")}</p>
                </div>
              </div>
            </div>

            {/* Kategorie cookies */}
            <div className="space-y-4">
              {COOKIE_CATEGORIES.map((category) => {
                const Icon = getCategoryIcon(category.id);
                const isExpanded = expandedCategory === category.id;
                const isNecessary = category.id === "necessary";

                return (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${getCategoryColor(category.id)}`}
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-black">
                                {category.name}
                              </h3>
                              {isNecessary && (
                                <span className="px-2 py-1 text-xs font-medium text-black bg-gray-200 rounded-full border border-gray-300">
                                  {t("cookie.preferences.required")}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-600"
                              id={`desc-${category.id}`}
                            >
                              {category.description}
                            </p>
                            {category.legalBasis && (
                              <p className="text-xs text-gray-500 mt-1">
                                {t("cookie.preferences.legalBasis")}:{" "}
                                {category.legalBasis}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            id={`toggle-${category.id}`}
                            checked={
                              localPreferences[
                                category.id as keyof CookiePreferencesType
                              ]
                            }
                            onChange={(checked) =>
                              handlePreferenceChange(
                                category.id as keyof CookiePreferencesType,
                                checked,
                              )
                            }
                            disabled={isNecessary}
                            aria-describedby={`desc-${category.id}`}
                          />

                          <button
                            onClick={() =>
                              setExpandedCategory(
                                isExpanded ? null : category.id,
                              )
                            }
                            className="p-1 text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded transition-colors duration-200"
                            aria-label={`${isExpanded ? t("cookie.preferences.collapse") : t("cookie.preferences.expand")} ${category.name}`}
                            aria-expanded={isExpanded}
                          >
                            <Info className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details - NO COOKIE LIST SECTION */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="space-y-3 text-sm text-gray-600">
                          <p>
                            {isNecessary
                              ? t("cookie.preferences.alwaysActive")
                              : t("cookie.preferences.optional")}
                            .
                          </p>
                          {/* Additional details can be added here if needed */}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                {t("cookie.preferences.footer.info")}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleRejectOptional}
                  className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 whitespace-nowrap"
                >
                  {t("cookie.banner.necessary")}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 whitespace-nowrap"
                >
                  {t("cookie.banner.accept")}
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 whitespace-nowrap"
                >
                  {t("cookie.preferences.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
