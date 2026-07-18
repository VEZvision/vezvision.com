import { useState, useEffect } from "react";
import { X, Eye, Database, User, Shield, LockKeyhole } from "lucide-react";
import { useCookieConsent } from "../../hooks/useCookieConsent";
import { COOKIE_DEFINITIONS } from "../../data/cookieDefinitions";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useSettings } from "@/hooks/useSettings";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useModalTransition } from "@/hooks/useModalTransition";
import { toast } from "sonner";
import { OverviewTab, CookiesTab, DataTab, RightsTab } from "./privacy-tabs";
import styles from "./PrivacyCenter.module.css";

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
    <div className={`${styles.root} ${className}`}>
      <div
        className={`${styles.backdrop} ${
          isAnimating ? styles.backdropVisible : styles.backdropHidden
        }`}
        onClick={actions.hidePrivacyCenterModal}
        aria-hidden="true"
      />

      <div
        className={`${styles.dialog} ${
          isAnimating ? styles.dialogVisible : styles.dialogHidden
        }`}
        role="dialog"
        aria-labelledby="privacy-center-title"
        aria-describedby="privacy-center-description"
        aria-modal="true"
      >
        <aside className={styles.rail}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <LockKeyhole size={16} aria-hidden="true" />
            </span>
            <span>VEZvision Privacy</span>
          </div>
          <div
            className={styles.tabs}
            role="tablist"
            aria-orientation="vertical"
          >
            {tabs.map((tab) => {
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
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.railNote}>{t("privacy.center.rail.note")}</p>
        </aside>

        <section className={styles.main}>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{t("privacy.center.eyebrow")}</p>
              <h2 id="privacy-center-title" className={styles.title}>
                {t("privacy.center.title")}
              </h2>
              <p id="privacy-center-description" className={styles.description}>
                {t("privacy.center.description")}
              </p>
            </div>
            <button
              type="button"
              onClick={actions.hidePrivacyCenterModal}
              className={styles.close}
              aria-label={t("privacy.center.close")}
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className={styles.scroll}>
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
        </section>
      </div>
    </div>
  );
}
