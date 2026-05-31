import { useCallback } from 'react';
import styles from './BlogCardLarge.module.scss';
import placeholderImg from '@/assets/image-1.png';
import { useNavigate } from 'react-router-dom';

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

const BlogCardLarge: React.FC<BlogCardLargeProps> = ({ article, className = '' }) => {
  const sampleDate = '12.10.2025';
  const targetDate = (article && article.date) ? article.date : sampleDate;

  const navigate = useNavigate();
  const navigateToArticle = useCallback(() => {
    if (article?.href) {
      navigate(article.href);
    }
  }, [navigate, article?.href]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToArticle();
    }
  }, [navigateToArticle]);

  return (
    <article
      className={`${styles.cardLarge} ${className}`}
      role="link"
      tabIndex={0}
      onClick={navigateToArticle}
      onKeyDown={onKeyDown}
      style={{ cursor: article?.href ? 'pointer' : 'default' }}
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
        <img
          src={article.imageUrl}
          alt={article.title}
          className={styles.image}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
        />
      </div>
    </article>
  );
};

export default BlogCardLarge;
