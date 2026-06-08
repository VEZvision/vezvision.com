import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from 'sonner';
import { memo, lazy, Suspense, useState, useEffect } from "react";
import RouteErrorBoundary from "@/components/layout/RouteErrorBoundary";
import { SmoothScrollProvider } from '@/contexts/SmoothScrollContext';
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import CookieBanner from "@/components/cookies/CookieBanner";
import PublicChrome from "@/components/layout/PublicChrome";
import AppBootShell from "@/components/layout/AppBootShell";
import Home from "@/pages/Home";

// Home is eager — default route; other pages stay lazy.
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
const CookiePreferences = lazy(() => import("@/components/cookies/CookiePreferences"));
const PrivacyCenter = lazy(() => import("@/components/cookies/PrivacyCenter"));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const E2eErrorTrigger = lazy(() => import('@/pages/E2eErrorTrigger'));

const enableE2eRoutes = import.meta.env.VITE_ENABLE_E2E_ROUTES === 'true';
import { useSettings } from '@/hooks/useSettings';
import CodeInjector from '@/components/system/CodeInjector';
import { useScrollToTopOnRouteChange } from '@/hooks/useScrollToTopOnRouteChange';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { readPublicSettingsCache } from '@/lib/publicSettingsCache';
import {
  fetchMaintenanceAccess,
  fetchMaintenanceEnabledFromDb,
  isSiteAccessible,
} from '@/services/maintenanceAccess';

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = memo(() => {
  useScrollToTopOnRouteChange();

  return (
    <PublicChrome>
      {/*
        Page transition — opacity only.
        Avoid filter:blur() here: it forces GPU compositing for the *entire*
        subtree on every frame, which causes serious jank on mobile devices.
      */}
      <main style={{ minHeight: '100vh' }}>
        <Suspense fallback={<AppBootShell />}>
          <Outlet />
        </Suspense>
      </main>
    </PublicChrome>
  );
});

Layout.displayName = 'Layout';

// ─── Router ───────────────────────────────────────────────────────────────────
const publicRoutes = [
  { index: true, element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'services', element: <Services /> },
  { path: 'portfolio', element: <Portfolio /> },
  { path: 'portfolio/:slug', element: <ProjectDetails /> },
  { path: 'blog', element: <Blog /> },
  { path: 'blog/:slug', element: <BlogArticle /> },
  { path: 'newsletter', element: <Newsletter /> },
  { path: 'products', element: <Products /> },
  { path: 'contact', element: <Contact /> },
  { path: 'cookie-policy', element: <CookiePolicy /> },
  { path: 'privacy-policy', element: <PrivacyPolicy /> },
  { path: 'terms', element: <Terms /> },
  { path: 'unsubscribe', element: <Unsubscribe /> },
  { path: '404', element: <NotFound /> },
  { path: '*', element: <NotFound /> },
  ...(enableE2eRoutes ? [{ path: '__e2e__/error', element: <E2eErrorTrigger /> }] : []),
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [...publicRoutes],
  },
]);

type MaintenanceAccessState = 'loading' | 'allowed' | 'blocked';

const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { maintenance, loading: settingsLoading } = useSettings();
  const cachedMaintenance = readPublicSettingsCache()?.settings.maintenance;
  const maintenanceEnabled =
    maintenance?.enabled === true ||
    (settingsLoading && cachedMaintenance?.enabled === true);
  const [access, setAccess] = useState<MaintenanceAccessState>(() =>
    maintenanceEnabled ? 'loading' : 'allowed',
  );
  const maintenanceSettingsKey = JSON.stringify({
    enabled: maintenance?.enabled ?? false,
    allowedIps: maintenance?.allowedIps ?? [],
  });

  useEffect(() => {
    if (!maintenance?.enabled) {
      setAccess('allowed');
      return;
    }

    if (settingsLoading) return;

    let cancelled = false;

    const resolveAccess = async () => {
      setAccess('loading');
      const snapshot = await fetchMaintenanceAccess();
      if (cancelled) return;

      const cmsMaintenanceEnabled = snapshot.unavailable
        ? await fetchMaintenanceEnabledFromDb()
        : true;

      if (cancelled) return;

      setAccess(isSiteAccessible(snapshot, cmsMaintenanceEnabled) ? 'allowed' : 'blocked');
    };

    void resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [maintenanceSettingsKey, settingsLoading, maintenance?.enabled]);

  if (maintenanceEnabled && access === 'loading') {
    return <AppBootShell />;
  }

  if (access === 'blocked') {
    return (
      <Suspense fallback={<AppBootShell />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return <>{children}</>;
};

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

CookieModalsGate.displayName = 'CookieModalsGate';

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <SmoothScrollProvider>
          <Toaster richColors closeButton position="top-right" />
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
    </LanguageProvider>
  );
}
