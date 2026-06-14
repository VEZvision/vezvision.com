import styles from './BlogCardLarge.module.scss';
import placeholderImg from '@/assets/image-1.png';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

interface BlogCardLargeProps {
  article: {
    category: string;
    date: string;
    title: string;
    description: string;
    imageUrl: string;
    readMoreText?: string;
    href?: string;
  };
  className?: string;
}

function BlogCardLarge({ article, className = '' }: BlogCardLargeProps) { const sampleDate = '12.10.2025';
const targetDate = (article && article.date) ? article.date : sampleDate;

return (
  <article
    className={`${styles.cardLarge} ${className}`}
  >
    <div className={styles.content}>
      <div className={styles.meta}>
        <span className={styles.category}>{article.category}</span>
        <span className={styles.date}>
          <span className={styles.bracket}>[</span>
          <span className={styles.dateText}>{targetDate}</span>
          <span className={styles.bracket}>]</span>
        </span>
      </div>
      <h2 className={styles.title}>{article.title}</h2>
      <div className={styles.description}>
        <p>{article.description}</p>
      </div>
      <div className={styles.readMoreContainer}>
        <a href={article.href} className={styles.readMore}>
          {article.readMoreText || 'Read more'}
        </a>
      </div>
    </div>
    <div className={styles.imageContainer}>
      <ResponsiveImage
        src={article.imageUrl}
        alt={article.title}
        className={styles.image}
        width={492}
        height={350}
        referrerPolicy="no-referrer"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
      />
    </div>
  </article>
); };

export default BlogCardLarge;
