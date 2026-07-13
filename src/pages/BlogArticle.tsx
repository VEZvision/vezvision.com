import { lazy, Suspense, useEffect } from "react";
import DynamicPageSeo from "@/components/seo/DynamicPageSeo";
import { useParams, Link } from "react-router-dom";
import "../styles/GridBackground.css";
import logo from "@brand/icon-dark.svg";
import {
  getBlogPostTranslation,
  useBlogPostDetail,
  useBlogRecentPosts,
} from "@/hooks/useBlog";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { sanitizeCmsHtml } from "@/utils/sanitizeCmsHtml";
import {
  joinUrlPath,
  safeAbsoluteHttpUrl,
  safeImageUrl,
} from "@/utils/safeHref";
import { stripHtmlForJsonLd } from "@/utils/stripHtmlForJsonLd";

import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

const BlogArticleSidebar = lazy(
  () => import("@/components/blog/BlogArticleSidebar"),
);

function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const {
    post,
    isLoading,
    isError,
    isNotFound,
    incrementViewCount,
    getAvailableBlogLocales,
  } = useBlogPostDetail(slug);
  const { posts: recentPosts, getPostTranslation } = useBlogRecentPosts(
    4,
    post?.id,
  );
  const { language, t } = useLanguageContext();
  const { seo } = useSettings();
  const { toLocalizedPath } = useLocalizedPath();

  useEffect(() => {
    if (post?.slug) {
      void incrementViewCount(post.slug);
    }
  }, [post?.slug, incrementViewCount]);

  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl) || undefined;
  const notFoundTitle = seo?.siteTitle
    ? `${t("blog.article.not_found")} | ${seo.siteTitle}`
    : t("blog.article.not_found");

  if (isLoading) {
    return (
      <div
        className="min-h-[60vh] pt-32 flex justify-center items-center"
        aria-busy="true"
      >
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          role="status"
          aria-label={t("common.loading")}
        />
      </div>
    );
  }

  if (isError || isNotFound || !post) {
    const errorDescription = isError
      ? t("blog.article.load_error_desc")
      : t("blog.article.not_found_desc");

    return (
      <div className="min-h-[60vh] pt-32 flex items-center justify-center px-4">
        <DynamicPageSeo
          title={notFoundTitle}
          description={errorDescription}
          canonicalUrl={
            siteUrl
              ? joinUrlPath(siteUrl, toLocalizedPath(`blog/${slug ?? ""}`))
              : toLocalizedPath(`blog/${slug ?? ""}`)
          }
          robots="noindex,nofollow"
          language={language}
          ogType="website"
          siteUrl={siteUrl}
          breadcrumbItems={[{ name: "Blog", path: "blog" }]}
        />
        <div className="text-center w-full max-w-md">
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12">
            <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-[#f5f5f5] flex items-center justify-center">
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isError
                ? t("blog.article.load_error")
                : t("blog.article.not_found")}
            </h2>
            <p className="text-gray-500 mb-6">{errorDescription}</p>
            <Link
              to={toLocalizedPath("blog")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5f5f5] text-gray-900 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16} />
              {t("blog.article.back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const translation = getBlogPostTranslation(post, language);
  const title = translation?.title || t("blog.list.empty");
  const content = translation?.content || "";
  const excerpt = translation?.excerpt || "";
  const category = post.categories[0]?.name || "Blog";
  const categoryColor = post.categories[0]?.color || "#3B82F6";

  const date = new Date(
    post.published_at || post.created_at,
  ).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fullTitle = seo?.siteTitle ? `${title} | ${seo.siteTitle}` : title;
  const canonicalPath = toLocalizedPath(`blog/${post.slug}`);
  const canonicalUrl = siteUrl
    ? joinUrlPath(siteUrl, canonicalPath)
    : canonicalPath;
  const ogImage =
    safeImageUrl(post.featured_image) ||
    (siteUrl ? joinUrlPath(siteUrl, "/og-image.png") : "/og-image.png");
  const siteName = seo?.ogSiteName || seo?.siteTitle || "VEZvision";
  const articleDescription = stripHtmlForJsonLd(
    excerpt || seo?.siteDescription || "",
  );
  const featuredImageSrc = safeImageUrl(post.featured_image) || logo;

  return (
    <section
      className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8"
      aria-labelledby="blog-article-title"
    >
      <Link
        to={toLocalizedPath("blog")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {t("blog.article.back")}
      </Link>
      <DynamicPageSeo
        title={fullTitle}
        description={articleDescription}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        ogType="article"
        language={language}
        siteUrl={siteUrl}
        localizedPathSuffix={`blog/${post.slug}`}
        availableLocales={getAvailableBlogLocales}
        breadcrumbItems={[
          { name: "Blog", path: "blog" },
          { name: title, path: `blog/${post.slug}` },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: articleDescription,
          image: ogImage,
          datePublished: post.published_at || post.created_at,
          url: canonicalUrl,
          dateModified: post.updated_at || post.published_at || post.created_at,
          author: {
            "@type": "Organization",
            name: siteName,
            "@id": siteUrl ? joinUrlPath(siteUrl, "/#organization") : undefined,
          },
          publisher: {
            "@type": "Organization",
            name: siteName,
            "@id": siteUrl ? joinUrlPath(siteUrl, "/#organization") : undefined,
          },
          articleSection: category,
          keywords: translation?.seo_keywords?.join(", ") || undefined,
        }}
        articlePublishedTime={post.published_at || post.created_at}
        articleModifiedTime={
          post.updated_at || post.published_at || post.created_at
        }
        articleAuthor={siteName}
        articleSection={category}
        articleTags={translation?.seo_keywords}
      />
      <div className="grid-background fixed inset-0 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-12">
        <article>
          <Link
            to={toLocalizedPath("blog")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-all shadow-xs mb-8 font-medium text-sm"
          >
            <ArrowLeft size={16} />
            {t("blog.article.back")}
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {category}
              </span>
            </div>

            <h1
              id="blog-article-title"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6"
            >
              {title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
              {excerpt}
            </p>

            <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
              <img
                src={logo}
                alt="VEZvision"
                width="40"
                height="40"
                className="w-10 h-10 rounded-full bg-gray-100 p-1"
              />
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">
                  VEZvision Team
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
                  <Calendar size={14} /> {date}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
                  <Clock size={14} /> {post.reading_time} min{" "}
                  {t("blog.article.reading_time")}
                </span>
              </div>
            </div>
          </header>

          <figure className="relative rounded-2xl overflow-hidden shadow-lg bg-white aspect-video mb-10 group">
            <ResponsiveImage
              src={featuredImageSrc}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              width="1200"
              height="675"
              lazy={false}
              fetchPriority="high"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = logo;
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </figure>

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline prose-img:rounded-xl prose-img:shadow-md">
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }}
            />

            <div className="mt-12 p-8 rounded-2xl bg-linear-to-br from-indigo-50 via-white to-blue-50 border border-blue-100 shadow-xs relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t("blog.article.cta_title")}
                  </h3>
                  <p className="text-gray-600">{t("blog.article.cta_desc")}</p>
                </div>
                <Link
                  to={toLocalizedPath("contact")}
                  className="inline-flex items-center gap-2 bg-[#f5f5f5] text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  {t("blog.article.cta_button")}
                  <ArrowLeft className="rotate-180" size={18} />
                </Link>
              </div>
            </div>
          </div>
        </article>

        <Suspense fallback={null}>
          <BlogArticleSidebar
            recentPosts={recentPosts}
            getPostTranslation={getPostTranslation}
          />
        </Suspense>
      </div>
    </section>
  );
}

export default BlogArticle;
