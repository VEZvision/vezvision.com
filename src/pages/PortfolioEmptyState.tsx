import { FolderOpen } from "lucide-react";

import styles from "./Portfolio.module.css";

interface PortfolioEmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly compact?: boolean;
}

export default function PortfolioEmptyState({
  title,
  description,
  compact = false,
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
      </div>
    </div>
  );
}
