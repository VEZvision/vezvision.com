import { useEffect, useState } from 'react';
import { logError } from '@/lib/logger';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import '../styles/GridBackground.css';
import logo from '@/assets/blog/logo.svg';
import { useBlog, BlogPostWithDetails } from '@/hooks/useBlog';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import DOMPurify from 'dompurify';

import { ArrowLeft, Clock, Calendar, Mail, Tag } from 'lucide-react';

const BlogArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostTranslation, getRecentPosts, incrementViewCount, fetchPostBySlug } = useBlog();
  const { language, t } = useLanguageContext();
  const { seo } = useSettings();
  const [post, setPost] = useState<BlogPostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const fetchedPost = await fetchPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          void incrementViewCount(fetchedPost.slug);
        } else {
          setError('Artykuł nie został znaleziony');
        }
      } catch {
        setError('Wystąpił błąd podczas ładowania artykułu');
        logError('blogArticle.load');
      } finally {
        setLoading(false);
      }
    };

    void loadPost();
  }, [slug, fetchPostBySlug, incrementViewCount]);

  if (loading) {
    return (
      <div className="min-h-[60vh] pt-32 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] pt-32 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-md">
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12">
            <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-[#f5f5f5] flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{error || t('blog.article.not_found')}</h2>
            <p className="text-gray-500 mb-6">{t('blog.article.not_found_desc')}</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5f5f5] text-gray-900 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16} />
              {t('blog.article.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const translation = getPostTranslation(post, language as 'pl' | 'en');
  const recentPosts = getRecentPosts(4).filter(p => p.id !== post.id);

  // Fallback values
  const title = translation?.title || 'Brak tytułu';
  const content = translation?.content || 'Brak treści';
  const excerpt = translation?.excerpt || '';
  const category = post.categories[0]?.name || 'Blog';
  const categoryColor = post.categories[0]?.color || '#3B82F6';

  const date = new Date(post.published_at || post.created_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const fullTitle = seo?.siteTitle ? `${title} | ${seo.siteTitle}` : title;
  const canonicalUrl = seo?.siteUrl ? `${seo.siteUrl.replace(/\/$/, '')}/blog/${post.slug}` : `/blog/${post.slug}`;
  const ogImage = post.featured_image || (seo?.siteUrl ? `${seo.siteUrl.replace(/\/$/, '')}/favicon.svg` : '/favicon.svg');

  return (
    <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8" aria-labelledby="blog-article-title">
      <Helmet>
        <title>{fullTitle}</title>
        {excerpt && <meta name="description" content={excerpt} />}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={excerpt || seo?.siteDescription || ''} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="grid-background fixed inset-0 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-12">
        <article>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-all shadow-sm mb-8 font-medium text-sm"
          >
             <ArrowLeft size={16} />
            {t('blog.article.back')}
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
              <img src={logo} alt="VezVision" className="w-10 h-10 rounded-full bg-gray-100 p-1" />
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">VezVision Team</span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
                  <Calendar size={14} /> {date}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
                   <Clock size={14} /> {post.reading_time} min {t('blog.article.reading_time')}
                </span>
              </div>
            </div>
          </header>

          <figure className="relative rounded-2xl overflow-hidden shadow-lg bg-white aspect-video mb-10 group">
            <img
              src={post.featured_image || logo}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = logo; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </figure>

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />

            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('blog.article.cta_title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('blog.article.cta_desc')}
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-[#f5f5f5] text-gray-900 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  {t('blog.article.cta_button')}
                  <ArrowLeft className="rotate-180" size={18} />
                </Link>
              </div>
            </div>


          </div>
        </article>

        <aside className="relative lg:block">
          <div className="sticky top-32 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-500" />
                {t('blog.article.recent')}
              </h3>
              <div className="space-y-4">
                {recentPosts.map(p => {
                  const pTrans = getPostTranslation(p, language as 'pl' | 'en');
                  return (
                    <Link
                      key={p.id}
                      to={`/blog/${p.slug}`}
                      className="group flex gap-3 text-left hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden relative shadow-sm">
                        <img
                          src={p.featured_image || logo}
                          alt={pTrans?.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = logo; }}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-sm font-medium text-gray-900 leading-snug box-border max-h-10 overflow-hidden line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {pTrans?.title || 'Brak tytułu'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {new Date(p.published_at || p.created_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US')}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-blue-500" />
                  {t('newsletter.title')}
              </h3>
              <p className="text-sm leading-6 text-gray-500 mb-5">
                {t('newsletter.description')}
              </p>
              <Link to="/newsletter" className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                {t('newsletter.submit')}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BlogArticle;
