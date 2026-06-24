import "../styles/GridBackground.css";
import { useHeroContactAction } from "@/hooks/useHeroContactAction";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { StaticPage } from "@/pagekit";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import ProductsCatalogSection from "@/components/products/ProductsCatalogSection";

function ProductsHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const handleContactClick = useHeroContactAction();

  return (
    <VideoHeroSection
      badge={t("products.badge")}
      title={<span className="block">{t("products.page.hero.title")}</span>}
      subtitle={t("products.page.hero.subtitle")}
      buttonText={t("blog.hero.cta.text")}
      onButtonClick={handleContactClick}
      socialLinks={buildHeroSocialLinks(social)}
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-white px-4 pt-[120px] pb-[80px]"
      contentClassName="max-w-[1024px]"
    />
  );
}

export default function Products() {
  return (
    <StaticPage
      seoKey="products"
      shell={{
        className: "min-h-screen flex flex-col",
        style: { backgroundColor: "transparent" },
      }}
      sections={[
        { key: "hero", Component: ProductsHero, eager: true },
        { key: "catalog", Component: ProductsCatalogSection, eager: true },
      ]}
    />
  );
}
