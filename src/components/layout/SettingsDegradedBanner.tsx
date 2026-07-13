import { useSettings } from "@/hooks/useSettings";
import { useLanguageContext } from "@/hooks/useLanguage";

export default function SettingsDegradedBanner() {
  const { degraded, loading, refreshSettings } = useSettings();
  const { t } = useLanguageContext();

  if (loading || !degraded) {
    return null;
  }

  return (
    <div
      role="status"
      className="relative z-60 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      <span>{t("common.settings.degraded")}</span>{" "}
      <button
        type="button"
        onClick={() => void refreshSettings()}
        className="font-semibold underline underline-offset-2 hover:text-amber-900"
      >
        {t("common.settings.retry")}
      </button>
    </div>
  );
}
