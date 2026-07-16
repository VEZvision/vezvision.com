import { ArrowUpRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

import styles from "./Portfolio.module.css";

interface PortfolioEmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly compact?: boolean;
  readonly ctaTitle?: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
  readonly eyebrow?: string;
  readonly status?: string;
}

export default function PortfolioEmptyState({
  title,
  description,
  compact = false,
  ctaTitle,
  ctaLabel,
  ctaHref,
  eyebrow,
  status,
}: PortfolioEmptyStateProps) {
  if (compact) {
    return (
      <div className={`${styles.empty} ${styles.emptyCompact}`}>
        <FolderOpen className={styles.emptyIcon} aria-hidden="true" />
        <div className={styles.emptyCopy}>
          <h3 className={styles.emptyTitle}>{title}</h3>
          <p className={styles.emptyDesc}>{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      <div className={styles.emptyMeta}>
        <span className={styles.emptyIndex}>01</span>
        <span className={styles.emptyEyebrow}>{eyebrow}</span>
        <div className={styles.emptyStatus}>
          <span className={styles.emptyStatusDot} aria-hidden="true" />
          {status}
        </div>
      </div>
      <div className={styles.emptyCopy}>
        <h3 className={styles.emptyTitle}>{title}</h3>
        <p className={styles.emptyDesc}>{description}</p>
      </div>
      {ctaTitle && ctaLabel && ctaHref ? (
        <div className={styles.emptyCta}>
          <p className={styles.emptyCtaText}>{ctaTitle}</p>
          <Link className={styles.emptyCtaLink} to={ctaHref}>
            {ctaLabel}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
