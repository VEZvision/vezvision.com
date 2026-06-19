import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { unsubscribeByToken } from "@/services/newsletter";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import logoNavbar from "@/assets/logo-navbar.svg";
import PageSeo from "@/components/seo/PageSeo";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();

  const [status, setStatus] = useState<
    "idle" | "confirming" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      // Instead of auto-unsubscribing, we set status to confirming
      setStatus("confirming");
    }
  }, [token]);

  const handleTokenUnsubscribe = async () => {
    if (!token) return;
    setStatus("loading");

    const result = await unsubscribeByToken(token);

    if (result.success) {
      setStatus("success");
      setMessage(`${result.email} ${t("unsubscribe.success")}`);
    } else {
      setStatus("error");
      setMessage(result.error || t("unsubscribe.error_generic"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <PageSeo pageKey="unsubscribe" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8 flex justify-center">
          <img src={logoNavbar} alt="VezVision" className="h-12" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("unsubscribe.title")}
        </h1>

        {status === "loading" && (
          <div className="py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">{t("unsubscribe.processing")}</p>
          </div>
        )}

        {status === "confirming" && (
          <div className="py-4">
            <p className="text-gray-600 mb-8">
              {t("unsubscribe.confirm_question")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTokenUnsubscribe}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {t("unsubscribe.confirm_yes")}
              </button>
              <Link
                to={toLocalizedPath()}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t("unsubscribe.confirm_no")}
              </Link>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link
              to={toLocalizedPath()}
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t("unsubscribe.back_home")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 mb-8">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-gray-500 hover:text-black underline"
            >
              {t("unsubscribe.retry")}
            </button>
          </div>
        )}

        {status === "idle" && !token && (
          <div className="text-center">
            <p className="text-gray-600 mb-6">{t("unsubscribe.no_token")}</p>
            <Link
              to={toLocalizedPath()}
              className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t("unsubscribe.back_home")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
