import { memo, type ReactNode } from 'react';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  variant: 'large' | 'medium';
  icon: ReactNode;
  title: string;
  description: string;
  image?: string;
  imageSrcSet?: string;
  imageAvifSrcSet?: string;
  imageAlt?: string;
}

function FeatureCard({
  variant,
  icon,
  title,
  description,
  image,
  imageSrcSet,
  imageAvifSrcSet,
  imageAlt
}: FeatureCardProps) { return (
  <article className={`${styles.card} ${styles[variant]}`}>
    {image && (
      <div className={styles.imageContainer}>
        <ResponsiveImage
          src={image}
          srcSet={imageSrcSet}
          avifSrcSet={imageAvifSrcSet}
          sizes="(max-width: 1024px) 100vw, 50vw"
          alt={imageAlt || ''}
          className={styles.cardImage}
          draggable={false}
        />
        <div className={styles.imageOverlay} />
      </div>
    )}

    <div className={styles.content}>
      <div className={styles.iconContainer}>
        {icon}
      </div>

      <div className={styles.textContent}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  </article>
); };

const areEqual = (prev: FeatureCardProps, next: FeatureCardProps) => {
  return (
    prev.variant === next.variant &&
    prev.icon === next.icon &&
    prev.title === next.title &&
    prev.description === next.description &&
    prev.image === next.image &&
    prev.imageSrcSet === next.imageSrcSet &&
    prev.imageAlt === next.imageAlt
  );
};

export default memo(FeatureCard, areEqual);