import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import PublicChrome from "@/components/layout/PublicChrome";
import { useLanguageContext } from "@/hooks/useLanguage";
import { tryRecoverFromStaleChunk } from "@/utils/chunkRecovery";

function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { toLocalizedPath } = useLocalizedPath();
  const { t } = useLanguageContext();

  useEffect(() => {
    tryRecoverFromStaleChunk(error);
  }, [error]);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    const data = error.data as { message?: string } | null | undefined;
    errorMessage = error.statusText || data?.message || t("routeError.message");
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = t("routeError.unknown");
  }

  return (
    <PublicChrome>
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 bg-gray-50 rounded-3xl flex items-center justify-center">
              <AlertTriangle
                className="h-12 w-12 text-gray-900"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            {t("routeError.title")}
          </h1>

          <p className="text-gray-500 mb-8 leading-relaxed">
            {t("routeError.message")}
            {import.meta.env.DEV && (
              <>
                <br />
                <span className="text-xs mt-2 block opacity-70 font-mono bg-gray-50 py-1 px-2 rounded-sm inline-block">
                  {errorMessage}
                </span>
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate(toLocalizedPath())}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Home className="w-5 h-5 mr-2" />
              {t("routeError.home")}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-black transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {t("routeError.retry")}
            </button>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}

export default RouteErrorBoundary;
