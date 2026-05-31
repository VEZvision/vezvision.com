import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from 'sonner';
import { useEffect, memo, lazy, Suspense } from "react";
import Navbar from "@/components/navbar/Navbar";
import RouteErrorBoundary from "@/components/layout/RouteErrorBoundary";
import {
  initSmoothScrolling,
  destroySmoothScrolling,
} from "@/utils/smoothScrolling";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import CookieBanner from "@/components/cookies/CookieBanner";
import { LoadingScreen } from "@/components/loading";
import SEO from "@/components/seo/SEO";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
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
import { useSettings } from '@/hooks/useSettings';
import CodeInjector from '@/components/system/CodeInjector';
import { useScrollToTopOnRouteChange } from '@/hooks/useScrollToTopOnRouteChange';
import { useCookieConsent } from '@/hooks/useCookieConsent';

// Simple fallback shown while lazy chunks load
const PageLoader = memo(() => (
  <LoadingScreen
    message="Loading page..."
    showProgress={false}
  />
));
PageLoader.displayName = 'PageLoader';


// ─── Layout ───────────────────────────────────────────────────────────────────
// Mounted once for every public route. Initialises Lenis smooth scrolling and
// handles a lightweight opacity fade on route changes.
const Layout = memo(() => {
  useScrollToTopOnRouteChange();

  // ── Initialise / destroy Lenis ──
  useEffect(() => {
    initSmoothScrolling();
    return () => {
      destroySmoothScrolling();
    };
  }, []);

  return (
    <>
      <SEO />
      <Navbar />
      {/*
        Page transition — opacity only.
        Avoid filter:blur() here: it forces GPU compositing for the *entire*
        subtree on every frame, which causes serious jank on mobile devices.
      */}
      <div style={{ minHeight: '100vh' }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
});

Layout.displayName = 'Layout';

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
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
    ],
  },
]);

const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { maintenance, loading: settingsLoading } = useSettings();
  if (settingsLoading) {
    return <PageLoader />;
  }

  if (!maintenance?.enabled) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <MaintenancePage />
    </Suspense>
  );
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
        <Toaster richColors closeButton position="top-right" />
        <CookieConsentProvider>
          <MaintenanceGuard>
            <CodeInjector />
              <RouterProvider router={router} />
          </MaintenanceGuard>

          <CookieBanner />
          <CookieModalsGate />
        </CookieConsentProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}
