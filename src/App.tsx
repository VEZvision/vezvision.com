import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import {
  memo,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import RouteErrorBoundary from "@/components/layout/RouteErrorBoundary";
import { SmoothScrollProvider } from "@/contexts/SmoothScrollContext";
import { ReducedMotionProvider } from "@/contexts/ReducedMotionContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import PublicChrome from "@/components/layout/PublicChrome";
import AppBootShell from "@/components/layout/AppBootShell";
const Home = lazy(() => import("@/pages/Home"));
import { LocaleGate, LocaleRedirect } from "@/routing/LocaleShell";
import { APP_ROUTES } from "@/routing/routes.config";

const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const Newsletter = lazy(() => import("@/pages/Newsletter"));
const Products = lazy(() => import("@/pages/Products"));
const ProjectDetails = lazy(() => import("@/pages/ProjectDetails"));
const Contact = lazy(() => import("@/pages/Contact"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const CookiePreferences = lazy(() =>
  import("@/components/cookies/CookiePreferences").then((m) => ({
    default: m.CookiePreferences,
  })),
);
const PrivacyCenter = lazy(() =>
  import("@/components/cookies/PrivacyCenter").then((m) => ({
    default: m.PrivacyCenter,
  })),
);
const LazyToaster = lazy(() =>
  import("sonner").then((m) => ({ default: m.Toaster })),
);
import { MaintenanceGuard } from "@/components/layout/MaintenanceGuard";
import CodeInjector from "@/components/system/CodeInjector";
import { useScrollToTopOnRouteChange } from "@/hooks/useScrollToTopOnRouteChange";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const enableE2eRoutes = import.meta.env.VITE_ENABLE_E2E_ROUTES === "true";

const e2eRouteChildren = (() => {
  if (!enableE2eRoutes) return [];

  const E2eErrorTrigger = lazy(() => import("@/pages/E2eErrorTrigger"));
  return [{ path: "__e2e__/error", element: <E2eErrorTrigger /> }];
})();

const routeElements: Record<string, ReactNode> = {
  "": <Home />,
  about: <About />,
  services: <Services />,
  portfolio: <Portfolio />,
  "portfolio/:slug": <ProjectDetails />,
  blog: <Blog />,
  "blog/:slug": <BlogArticle />,
  newsletter: <Newsletter />,
  products: <Products />,
  contact: <Contact />,
  "cookie-policy": <CookiePolicy />,
  "privacy-policy": <PrivacyPolicy />,
  terms: <Terms />,
  unsubscribe: <Unsubscribe />,
  "404": <NotFound />,
};

const localizedChildren = APP_ROUTES.map((route) => ({
  path: route.path,
  element: routeElements[route.path] ?? <NotFound />,
}));

const Layout = memo(() => {
  useScrollToTopOnRouteChange();

  return (
    <PublicChrome>
      <main id="main-content" style={{ minHeight: "100vh" }} role="main">
        <Suspense fallback={<AppBootShell />}>
          <Outlet />
        </Suspense>
      </main>
    </PublicChrome>
  );
});

Layout.displayName = "Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LocaleRedirect />,
  },
  {
    path: "/:lang",
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <LocaleGate />,
        children: [
          ...localizedChildren,
          { path: "*", element: <NotFound /> },
          ...e2eRouteChildren,
        ],
      },
    ],
  },
  {
    path: "*",
    element: <LocaleRedirect />,
  },
]);

const CookieModalsGate = memo(() => {
  const { state } = useCookieConsent();

  if (!state.showPreferences && !state.showPrivacyCenter) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {state.showPreferences && <CookiePreferences />}
      {state.showPrivacyCenter && <PrivacyCenter />}
    </Suspense>
  );
});

CookieModalsGate.displayName = "CookieModalsGate";

const ToasterGate = memo(() => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.__VEZ_PRERENDER__) {
      return;
    }

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => setReady(true), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(() => setReady(true), 1);
    return () => window.clearTimeout(timer);
  }, []);

  if (window.__VEZ_PRERENDER__ || !ready) return null;

  return (
    <Suspense fallback={null}>
      <LazyToaster richColors closeButton position="top-right" />
    </Suspense>
  );
});

ToasterGate.displayName = "ToasterGate";

export default function App() {
  return (
    <LanguageProvider>
      <ReducedMotionProvider>
        <SettingsProvider>
          <SmoothScrollProvider>
            <ToasterGate />
            <CookieConsentProvider>
              <MaintenanceGuard>
                <CodeInjector />
                <RouterProvider router={router} />
              </MaintenanceGuard>

              <CookieBanner />
              <CookieModalsGate />
            </CookieConsentProvider>
          </SmoothScrollProvider>
        </SettingsProvider>
      </ReducedMotionProvider>
    </LanguageProvider>
  );
}
