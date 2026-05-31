import { memo } from 'react';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  variant: 'large' | 'medium';
  icon: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  variant,
  icon,
  title,
  description,
  image,
  imageAlt
}) => {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {image && (
        <div className={styles.imageContainer}>
          <img
            src={image}
            alt={imageAlt || ''}
            className={styles.cardImage}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className={styles.imageOverlay} />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <img src={icon} alt="" className={styles.icon} loading="lazy" decoding="async" draggable={false} aria-hidden="true" />
        </div>

        <div className={styles.textContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </article>
  );
};

const areEqual = (prev: FeatureCardProps, next: FeatureCardProps) => {
  return (
    prev.variant === next.variant &&
    prev.icon === next.icon &&
    prev.title === next.title &&
    prev.description === next.description &&
    prev.image === next.image &&
    prev.imageAlt === next.imageAlt
  );
};

export default memo(FeatureCard, areEqual);