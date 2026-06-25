import { useState, useEffect } from "react";
import BlogCardLarge from "./BlogCardLarge";
import BlogCard from "./BlogCard";
import styles from "./BlogArticles.module.scss";
import { useBlog } from "@/hooks/useBlog";
import type { BlogPostWithDetails } from "@/hooks/useBlog";
import { useLanguageContext } from "@/hooks/useLanguage";
import SectionHeader from "@/components/ui/SectionHeader";
import { Newspaper } from "lucide-react";
import {
  SectionReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/ui/SectionReveal";
import { safeJsonLd } from "@/utils/safeJsonLd";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { useSettings } from "@/hooks/useSettings";
import { Helmet } from "react-helmet-async";
import {
  joinUrlPath,
  safeAbsoluteHttpUrl,
  safeImageUrl,
} from "@/utils/safeHref";
import { hasBlogPostTranslation } from "@/utils/blogTranslation";
import { stripHtmlForJsonLd } from "@/utils/stripHtmlForJsonLd";

interface Article {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  href?: string;
}

interface BlogArticlesWithDataProps {
  limit?: number;
}

const BlogArticlesWithData = ({ limit }: BlogArticlesWithDataProps) => {
  const { posts, loading, error, getPostTranslation } = useBlog();
  const { language, t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  const { seo } = useSettings();
  const siteBaseUrl =
    safeAbsoluteHttpUrl(seo?.siteUrl) ||
    import.meta.env.VITE_SITE_URL ||
    "https://vezvision.com";
  const [featuredPost, setFeaturedPost] = useState<BlogPostWithDetails | null>(
    null,
  );
  const [regularPosts, setRegularPosts] = useState<BlogPostWithDetails[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    // The user wants the newest post to be the "featured" (large tile) post
    // posts are already sorted by published_at desc from useBlog
    const newestPost = posts.length > 0 ? posts[0] : null;
    const otherPosts = posts.length > 1 ? posts.slice(1) : [];

    setFeaturedPost(newestPost);
    setRegularPosts(limit ? otherPosts.slice(0, limit) : otherPosts);
  }, [posts, limit]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateVisibleCount = (isMobile: boolean) => {
      if (isMobile) {
        setVisibleCount((prev) => (prev === 6 ? 3 : prev)); // Only reset if it was default desktop
      } else {
        setVisibleCount((prev) => (prev === 3 ? 6 : prev)); // Only reset if it was default mobile
      }
    };

    updateVisibleCount(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updateVisibleCount(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + (window.innerWidth < 768 ? 3 : 6));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === "pl" ? "pl-PL" : "en-US";
    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });
  };

  const convertPostToArticle = (post: BlogPostWithDetails): Article => {
    const translation = getPostTranslation(post, language as "pl" | "en");
    const primaryCategory =
      post.categories.length > 0 ? post.categories[0] : null;

    return {
      id: post.id,
      category: primaryCategory?.name.toUpperCase() || "BLOG",
      date: formatDate(post.published_at || post.created_at),
      title: translation?.title || "Brak tytułu",
      description:
        translation?.excerpt ||
        translation?.content?.substring(0, 150) + "..." ||
        "Brak opisu",
      imageUrl:
        safeImageUrl(post.featured_image) || "/Logo_vezvision_optimized.svg",
      href: toLocalizedPath(`blog/${post.slug}`),
    };
  };

  if (loading) {
    return (
      <section
        className={styles.blogArticles}
        aria-labelledby="blog-articles-heading"
      >
        <div className={styles.container}>
          <div className="text-center py-12">
            <h2 className={styles.sectionTitle}>{t("blog.list.empty")}</h2>
            <p className="text-gray-600 mt-4">{t("blog.list.empty_desc")}</p>
            <div
              className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mt-6"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={styles.blogArticles}
        aria-labelledby="blog-articles-heading"
      >
        <div className={styles.container}>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{t("blog.list.error")}</div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section
        className={styles.blogArticles}
        aria-labelledby="blog-articles-heading"
      >
        <div className={styles.container}>
          <div className="text-center py-12">
            <h2 className={styles.sectionTitle}>{t("blog.list.empty")}</h2>
            <p className="text-gray-600 mt-4">{t("blog.list.empty_desc")}</p>
          </div>
        </div>
      </section>
    );
  }

  const featuredArticle = featuredPost
    ? convertPostToArticle(featuredPost)
    : null;
  const visibleArticles = regularPosts
    .slice(0, visibleCount)
    .map(convertPostToArticle);
  const hasMore = regularPosts.length > visibleCount;

  // Split articles into rows of 3
  const articleRows: Article[][] = [];
  for (let i = 0; i < visibleArticles.length; i += 3) {
    articleRows.push(visibleArticles.slice(i, i + 3));
  }

  return (
    <section
      className={styles.blogArticles}
      aria-labelledby="blog-articles-heading"
    >
      <div className={styles.container}>
        <SectionReveal>
          <SectionHeader
            badgeText={t("blog.articles.badge")}
            badgeIcon={<Newspaper className="w-3.5 h-3.5" />}
            title={
              <>
                {t("blog.articles.title.line1")}{" "}
                <span className="font-sans font-semibold">
                  {t("blog.articles.title.line2.italic")}
                </span>
              </>
            }
            subtitle={t("blog.articles.subtitle")}
            className="mb-16"
          />
        </SectionReveal>

        {/* Featured article (large tile) */}
        {featuredArticle && (
          <SectionReveal delay={0.1}>
            <div className={styles.featuredSection}>
              <BlogCardLarge article={featuredArticle} />
            </div>
          </SectionReveal>
        )}

        {/* Regular articles grid */}
        <StaggerReveal className={styles.articlesGrid}>
          {articleRows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.articlesRow}>
              {row.map((article) => (
                <StaggerItem key={article.id}>
                  <BlogCard article={article} />
                </StaggerItem>
              ))}
            </div>
          ))}
        </StaggerReveal>

        {hasMore && (
          <SectionReveal delay={0.1}>
            <div className={styles.showMoreContainer}>
              <button
                type="button"
                onClick={handleShowMore}
                className={styles.showMoreButton}
              >
                {t("blog.list.show_more")}
              </button>
            </div>
          </SectionReveal>
        )}

        <Helmet>
          <script type="application/ld+json">
            {safeJsonLd({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "VezVision Blog",
              description:
                language === "pl"
                  ? "Inspiracje, porady i nowości ze świata IT, AI oraz marketingu"
                  : "Ideas, tips and updates on IT, AI and marketing",
              url: joinUrlPath(siteBaseUrl, toLocalizedPath("blog")),
              blogPost: posts
                .filter((post) =>
                  hasBlogPostTranslation(post, language as "pl" | "en"),
                )
                .map((post) => {
                  const translation = getPostTranslation(
                    post,
                    language as "pl" | "en",
                  );
                  const postPath = toLocalizedPath(`blog/${post.slug}`);
                  return {
                    "@type": "BlogPosting",
                    headline:
                      translation?.title ||
                      (language === "pl" ? "Brak tytułu" : "Untitled"),
                    description:
                      stripHtmlForJsonLd(
                        translation?.excerpt ||
                          translation?.content?.substring(0, 150) ||
                          "",
                      ) ||
                      (language === "pl" ? "Brak opisu" : "No description"),
                    url: joinUrlPath(siteBaseUrl, postPath),
                    image:
                      safeImageUrl(post.featured_image) ||
                      joinUrlPath(siteBaseUrl, "/Logo_vezvision_optimized.svg"),
                    ...(post.published_at
                      ? { datePublished: post.published_at }
                      : {}),
                    author: { "@type": "Organization", name: "VezVision" },
                    publisher: { "@type": "Organization", name: "VezVision" },
                  };
                }),
            })}
          </script>
        </Helmet>
      </div>
    </section>
  );
};

export default BlogArticlesWithData;
