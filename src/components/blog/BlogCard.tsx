import styles from "./BlogCard.module.scss";
import placeholderImg from "@/assets/image-1.png";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface BlogCardProps {
  article: {
    category: string;
    date: string;
    title: string;
    description: string;
    imageUrl: string;
    href?: string;
  };
  className?: string;
}

function BlogCard({ article, className = "" }: BlogCardProps) {
  const sampleDate = "12.10.2025";
  const targetDate = article && article.date ? article.date : sampleDate;

  return (
    <article className={`${styles.card} ${className}`}>
      <a href={article.href} className={styles.cardLink}>
        <div className={styles.cardContainer}>
          <div className={styles.imageContainer}>
            <ResponsiveImage
              src={article.imageUrl}
              alt={article.title}
              className={styles.image}
              width={316}
              height={191}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = placeholderImg;
              }}
            />
          </div>
          <div className={styles.meta}>
            <span className={styles.category}>{article.category}</span>
            <span className={styles.date}>
              <span className={styles.bracket}>[</span>
              <span className={styles.dateText}>{targetDate}</span>
              <span className={styles.bracket}>]</span>
            </span>
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{article.title}</h3>
            <p className={styles.description}>{article.description}</p>
          </div>
        </div>
      </a>
    </article>
  );
}

export default BlogCard;
