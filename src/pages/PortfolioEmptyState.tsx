import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./Portfolio.module.css";

interface PortfolioEmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly compact?: boolean;
  readonly ctaTitle?: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
}

export default function PortfolioEmptyState({
  title,
  description,
  compact = false,
  ctaTitle,
  ctaLabel,
  ctaHref,
}: PortfolioEmptyStateProps) {
  return (
    <div className={styles.empty}>
      {compact ? (
        <FolderOpen className={styles.emptyIcon} />
      ) : (
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <FolderOpen className={styles.emptyIcon} />
        </div>
      )}
      <div className={styles.emptyCopy}>
        <h3 className={styles.emptyTitle}>{title}</h3>
        <p className={styles.emptyDesc}>{description}</p>
        {ctaTitle && ctaLabel && ctaHref ? (
          <div className={styles.emptyCta}>
            <p className={styles.emptyCtaText}>{ctaTitle}</p>
            <Link className={styles.emptyCtaLink} to={ctaHref}>
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
