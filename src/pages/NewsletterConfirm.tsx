import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmNewsletterByToken } from "@/services/newsletter";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";
import { useLanguageContext } from "@/hooks/useLanguage";
import PageSeo from "@/components/seo/PageSeo";

export default function NewsletterConfirm() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { toLocalizedPath } = useLocalizedPath();
  const { t } = useLanguageContext();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const confirm = async () => {
    if (!token) return setStatus("error");
    setStatus("loading");
    const result = await confirmNewsletterByToken(token);
    setStatus(result.success ? "success" : "error");
  };

  return (
    <>
      <PageSeo pageKey="newsletter-confirm" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <img src={logoNavbar} alt="VEZvision" width="838" height="153" className="h-12 w-auto mx-auto mb-8" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("newsletter.confirm.title")}</h1>
          {status === "success" ? (
            <><p className="text-gray-600 mb-8">{t("newsletter.confirm.success")}</p><Link to={toLocalizedPath()} className="inline-block px-6 py-3 bg-black text-white rounded-lg">{t("unsubscribe.back_home")}</Link></>
          ) : status === "error" || !token ? (
            <p className="text-red-600">{t("newsletter.confirm.error")}</p>
          ) : (
            <><p className="text-gray-600 mb-8">{t("newsletter.confirm.description")}</p><button onClick={confirm} disabled={status === "loading"} className="w-full px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50">{status === "loading" ? t("newsletter.confirm.loading") : t("newsletter.confirm.button")}</button></>
          )}
        </div>
      </div>
    </>
  );
}
