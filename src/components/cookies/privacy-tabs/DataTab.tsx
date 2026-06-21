import { Download, Trash2 } from "lucide-react";
import type { CookieConsentState } from "@/types/cookies";

interface DataTabProps {
  t: (key: string) => string;
  language: string;
  state: CookieConsentState;
  isExporting: boolean;
  onExport: () => void;
  onDelete: () => void;
}

export function DataTab({
  t,
  language,
  state,
  isExporting,
  onExport,
  onDelete,
}: DataTabProps) {
  return (
    <div id="panel-data" role="tabpanel" className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("privacy.data.management")}
        </h3>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download
                className="w-6 h-6 text-blue-600 mt-1"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">
                  {t("privacy.data.export.title")}
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  {t("privacy.data.export.description")}
                </p>
                <button
                  onClick={onExport}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {isExporting
                    ? t("privacy.data.export.loading")
                    : t("privacy.data.export.button")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2
                className="w-6 h-6 text-red-600 mt-1"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">
                  {t("privacy.data.delete.title")}
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  {t("privacy.data.delete.description")}
                </p>
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  {t("privacy.data.delete.button")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              {t("privacy.data.consent.info")}
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{t("privacy.data.consent.id")}:</span>
                <span className="font-mono text-xs">{state.consentId}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("privacy.data.consent.version")}:</span>
                <span>{state.version}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("privacy.data.consent.updated")}:</span>
                <span>
                  {new Date(state.lastUpdated).toLocaleString(
                    language === "pl" ? "pl-PL" : "en-US",
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
