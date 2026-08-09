import { memo } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductsSection.module.css";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  BriefcaseBusiness,
  GraduationCap,
  Package,
  Sparkles,
} from "lucide-react";
import { useLanguageContext } from "@/hooks/useLanguage";
import {
  SectionReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/ui/SectionReveal";
import { useSettings } from "@/hooks/useSettings";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

const PRODUCT_CATEGORY_KEYS = [
  "products.category.creative",
  "products.category.educational",
  "products.category.business",
] as const;

const PRODUCT_ICONS = [Sparkles, GraduationCap, BriefcaseBusiness] as const;

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface ProductCardProps {
  index: number;
  social: ReturnType<typeof useSettings>["social"];
}

const ProductCard = memo(({ index, social }: ProductCardProps) => {
  const { t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  const cardIndex = `0${index + 1}`;
  const categoryKey = PRODUCT_CATEGORY_KEYS[index] ?? PRODUCT_CATEGORY_KEYS[0];
  const CardIcon = PRODUCT_ICONS[index] ?? Package;

  return (
    <article
      className={styles.productCard}
      aria-label={`${t(categoryKey)} - ${t("products.card.title")}`}
    >
      <div className={styles.cardTopRow}>
        <div className={styles.cardMeta}>
          <span className={styles.cardIndex}>{cardIndex}</span>
          <span className={styles.cardCategory}>{t(categoryKey)}</span>
        </div>
        <div className={styles.iconShell}>
          <CardIcon
            className={styles.cardMainIcon}
            aria-hidden="true"
            focusable="false"
          />
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.productEyebrow}>{t("products.coming.subtitle")}</p>
        <h3 className={styles.productTitle}>{t("products.card.title")}</h3>
        <p className={styles.productDesc}>{t("products.coming.desc")}</p>
      </div>

      <div className={styles.cardFooter}>
        {social && (
          <div className={styles.socialIcons}>
            {social.x && (
              <a
                href={social.x}
                className={styles.socialIcon}
                aria-label="X (Twitter)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <XIcon />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                className={styles.socialIcon}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                className={styles.socialIcon}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
              </a>
            )}
          </div>
        )}

        <Link
          to={toLocalizedPath("newsletter")}
          className={styles.comingSoonBadge}
        >
          <span>{t("products.coming.title")}</span>
        </Link>
      </div>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

const ProductsSection = memo(() => {
  const { t } = useLanguageContext();
  const { social } = useSettings();

  return (
    <section
      id="products"
      className={styles.section}
      aria-labelledby="products-heading"
    >
      <div className={styles.container}>
        <SectionReveal>
          <SectionHeader
            badgeText={t("products.badge")}
            badgeIcon={<Package className="w-3.5 h-3.5" />}
            title={t("products.title")}
            subtitle={t("products.subtitle")}
            id="products-heading"
          />
        </SectionReveal>

        <StaggerReveal className={styles.productsGrid}>
          <StaggerItem>
            <ProductCard index={0} social={social} />
          </StaggerItem>
          <StaggerItem>
            <ProductCard index={1} social={social} />
          </StaggerItem>
          <StaggerItem>
            <ProductCard index={2} social={social} />
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
});

ProductsSection.displayName = "ProductsSection";

export default ProductsSection;
