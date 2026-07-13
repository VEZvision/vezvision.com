import type { ReactNode } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import SEO from "@/components/seo/SEO";
import { GlobalJsonLd } from "@/components/seo/GlobalJsonLd";
import SettingsDegradedBanner from "@/components/layout/SettingsDegradedBanner";
import { useLanguageContext } from "@/hooks/useLanguage";

interface PublicChromeProps {
  children: ReactNode;
}

/** Shared shell for all public routes (nav, SEO, footer). */
export default function PublicChrome({ children }: PublicChromeProps) {
  const { t } = useLanguageContext();

  return (
    <>
      <SEO />
      <GlobalJsonLd />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("common.a11y.skip_to_main")}
      </a>
      <SettingsDegradedBanner />
      <div data-lenis-events>
        <Navbar />
        {children}
        <Footer />
      </div>
    </>
  );
}
