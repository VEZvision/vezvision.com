import { useCallback, useEffect, useState } from 'react';
import DynamicPageSeo from '@/components/seo/DynamicPageSeo';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sanitizeCmsHtml } from '@/utils/sanitizeCmsHtml';
import {
    ArrowLeft,
    ExternalLink,
    Calendar,
    User,
    Code2,
    CheckCircle2,
    Maximize2,
    X,
    GitBranch,
    Layers
} from 'lucide-react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useProject } from '@/hooks/usePortfolio';
import { useProjectTranslation } from '@/hooks/useProjectTranslation';
import { getProjectImageUrl } from '@/services/portfolio';
import { useSettings } from '@/hooks/useSettings';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { safeAbsoluteHttpUrl, safeExternalHref, safeImageUrl } from '@/utils/safeHref';
import { getAvailablePortfolioLocales } from '@/utils/portfolioTranslation';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { LoadingScreen } from '@/components/loading';
import { SectionReveal } from '@/components/ui/SectionReveal';
import styles from './ProjectDetails.module.css';

export default function ProjectDetails() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language, t: tl } = useLanguageContext();
    const { project, loading } = useProject(slug || null);
    const { seo } = useSettings();
    const { toLocalizedPath } = useLocalizedPath();
    const reducedMotion = useReducedMotion();
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [lightboxVisible, setLightboxVisible] = useState(false);
    const t = useProjectTranslation(project ?? null, language);

    useBodyScrollLock(Boolean(lightboxImage));

    const openLightbox = (imageUrl: string) => {
        setLightboxImage(imageUrl);
    };

    const closeLightbox = useCallback(() => {
        setLightboxVisible(false);
        window.setTimeout(() => setLightboxImage(null), reducedMotion ? 0 : 200);
    }, [reducedMotion]);

    useEffect(() => {
        if (!lightboxImage) return;

        if (reducedMotion) {
            setLightboxVisible(true);
            return;
        }

        const frame = window.requestAnimationFrame(() => setLightboxVisible(true));
        return () => window.cancelAnimationFrame(frame);
    }, [lightboxImage, reducedMotion]);

    useEffect(() => {
        if (!lightboxImage) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [lightboxImage, closeLightbox]);

    if (loading) return <LoadingScreen />;

    if (!project && !loading) {
        return (
            <>
            <DynamicPageSeo
                title={tl('portfolio.detail.not_found')}
                description={tl('portfolio.detail.not_found_desc')}
                canonicalUrl={typeof window !== 'undefined' ? window.location.href : ''}
                robots="noindex,nofollow"
                language={language}
                siteUrl={safeAbsoluteHttpUrl(seo?.siteUrl) ?? undefined}
                breadcrumbItems={[{ name: language === 'pl' ? 'Portfolio' : 'Portfolio', path: 'portfolio' }]}
            />
            <div className={styles.notFoundContainer}>
                <div className={styles.notFoundCard}>
                    <div className={styles.notFoundIcon}>
                        <Code2 size={32} />
                    </div>
                    <h2 className={styles.notFoundTitle}>
                        {tl('portfolio.detail.not_found')}
                    </h2>
                    <p className={styles.notFoundDesc}>
                        {tl('portfolio.detail.not_found_desc')}
                    </p>
                    <button type="button" onClick={() => navigate(toLocalizedPath('portfolio'))} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        {tl('portfolio.detail.back')}
                    </button>
                </div>
            </div>
            </>
        );
    }

    if (!project) return null;

    const projectTitle = t('title', project.slug);
    const fullTitle = seo?.siteTitle ? `${projectTitle} | ${seo.siteTitle}` : projectTitle;
    const canonicalPath = toLocalizedPath(`portfolio/${project.slug}`);
    const canonicalUrl = safeAbsoluteHttpUrl(seo?.siteUrl)
        ? `${safeAbsoluteHttpUrl(seo?.siteUrl)}${canonicalPath}`
        : canonicalPath;
    const ogDescription = project.translations?.[language]?.short_description || seo?.siteDescription || '';
    const ogImage = project.cover_path
        ? getProjectImageUrl(project.cover_path)
        : safeImageUrl(seo?.siteUrl ? `${seo.siteUrl.replace(/\/$/, '')}/favicon.svg` : '/favicon.svg') || '/favicon.svg';
    const availableLocales = getAvailablePortfolioLocales(project);
    const demoUrl = safeExternalHref(project.demo_url);
    const githubUrl = safeExternalHref(project.github_url);
    const motionClass = reducedMotion ? '' : styles.motionEnter;

    const siteName = seo?.ogSiteName || seo?.siteTitle || 'VezVision';

    return (
        <div className={styles.page}>
            <DynamicPageSeo
                title={fullTitle}
                description={ogDescription}
                canonicalUrl={canonicalUrl}
                ogImage={safeImageUrl(ogImage) || ogImage}
                ogType="article"
                language={language}
                siteUrl={safeAbsoluteHttpUrl(seo?.siteUrl) ?? undefined}
                localizedPathSuffix={`portfolio/${project.slug}`}
                availableLocales={availableLocales}
                breadcrumbItems={[
                    { name: language === 'pl' ? 'Portfolio' : 'Portfolio', path: 'portfolio' },
                    { name: projectTitle, path: `portfolio/${project.slug}` },
                ]}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'CreativeWork',
                    name: projectTitle,
                    description: ogDescription,
                    image: ogImage,
                    url: canonicalUrl,
                    creator: { '@type': 'Organization', name: siteName },
                }}
            />
            <div className={styles.container}>
                <div className={`${styles.nav} ${styles.navEnter} ${motionClass}`}>
                    <Link to={toLocalizedPath('portfolio')} className={styles.backLink}>
                        <ArrowLeft size={18} />
                        <span>{tl('nav.portfolio')}</span>
                    </Link>
                </div>

                <header className={`${styles.hero} ${styles.heroEnter} ${motionClass}`}>
                    <div className={styles.heroContent}>
                        <div className={styles.categoryBadge}>
                            <Layers size={14} />
                            <span>{project.category?.replace('-', ' ')}</span>
                        </div>
                        <h1 className={styles.title}>{t('title', project.slug)}</h1>
                        <p className={styles.subtitle}>{t('short_description', '')}</p>

                        <div className={styles.actions}>
                            {project.show_demo_url !== false && demoUrl && (
                                <a href={demoUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                                    {tl('portfolio.detail.view_live')}
                                    <ExternalLink size={16} />
                                </a>
                            )}
                            {githubUrl && (
                                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                                    <GitBranch size={16} />
                                    Source Code
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                {project.show_cover_image !== false && project.cover_path && (
                    <div className={`${styles.coverCard} ${styles.coverEnter} ${motionClass}`}>
                        <div className={styles.coverImageWrapper}>
                            <img
                                src={getProjectImageUrl(project.cover_path)}
                                alt={t('title', 'Project Cover')}
                                className={styles.coverImage}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.grid}>
                    <div className={styles.mainColumn}>
                        <SectionReveal className={styles.card}>
                            <h2 className={styles.cardTitle}>
                                {tl('portfolio.detail.about')}
                            </h2>
                            <div
                                className={styles.prose}
                                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(t('description', '')) }}
                            />
                        </SectionReveal>

                        <div className={styles.twoColumns}>
                            {project.show_challenge !== false && (
                                <SectionReveal className={styles.card} delay={0.05}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.iconBox} ${styles.amber}`}>
                                            <div className={styles.dot} />
                                        </div>
                                        <h3 className={styles.cardSubtitle}>
                                            {tl('portfolio.detail.challenge')}
                                        </h3>
                                    </div>
                                    <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(t('challenge', '...')) }} />
                                </SectionReveal>
                            )}

                            {project.show_solution !== false && (
                                <SectionReveal className={styles.card} delay={0.1}>
                                    <div className={styles.cardHeader}>
                                        <div className={`${styles.iconBox} ${styles.emerald}`}>
                                            <div className={styles.dot} />
                                        </div>
                                        <h3 className={styles.cardSubtitle}>
                                            {tl('portfolio.detail.solution')}
                                        </h3>
                                    </div>
                                    <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(t('solution', '...')) }} />
                                </SectionReveal>
                            )}
                        </div>

                        {project.images && project.images.length > 0 && (
                            <SectionReveal className={styles.gallerySection}>
                                <h2 className={styles.sectionTitle}>
                                    {tl('portfolio.detail.gallery')}
                                </h2>
                                <div className={styles.galleryGrid}>
                                    {project.images.map((img) => (
                                        <button
                                            type="button"
                                            key={img.id}
                                            className={styles.galleryItem}
                                            onClick={() => openLightbox(getProjectImageUrl(img.path))}
                                            aria-label={`${tl('portfolio.detail.gallery')} - ${projectTitle}`}
                                        >
                                            <div className={styles.galleryItemInner}>
                                                <img src={getProjectImageUrl(img.path)} alt={`${projectTitle} - ${tl('portfolio.detail.gallery')}`} loading="lazy" decoding="async" />
                                            </div>
                                            <div className={styles.galleryOverlay}>
                                                <Maximize2 size={20} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </SectionReveal>
                        )}
                    </div>

                    <aside className={styles.sidebar}>
                        <SectionReveal className={styles.card}>
                            <div className={styles.metaItem}>
                                <div className={styles.metaIcon}><User size={18} /></div>
                                <div>
                                    <span className={styles.metaLabel}>{tl('portfolio.detail.client')}</span>
                                    <span className={styles.metaValue}>{project.client_name || tl('portfolio.detail.confidential')}</span>
                                </div>
                            </div>

                            <div className={styles.metaItem}>
                                <div className={styles.metaIcon}><Calendar size={18} /></div>
                                <div>
                                    <span className={styles.metaLabel}>{tl('portfolio.detail.date')}</span>
                                    <span className={styles.metaValue}>
                                        {new Date(project.updated_at).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { year: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>
                        </SectionReveal>

                        <SectionReveal className={styles.card} delay={0.1}>
                            <div className={styles.scopeHeader}>
                                <CheckCircle2 size={18} className={styles.scopeIcon} />
                                <span>{tl('portfolio.detail.scope')}</span>
                            </div>
                            <ul className={styles.scopeList}>
                                {project.scope && Array.isArray(project.scope) && project.scope.length > 0 ? (
project.scope.map((item: string) => (
<li key={item}>{item}</li>
                                    ))
                                ) : (
                                    <li className={styles.noScope}>
                                        {tl('portfolio.detail.scope_empty')}
                                    </li>
                                )}
                            </ul>
                        </SectionReveal>
                    </aside>
                </div>
            </div>

            {lightboxImage && (
                <div
                    className={`${styles.lightbox} ${lightboxVisible ? styles.lightboxVisible : ''}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={tl('portfolio.detail.fullview_alt')}
                >
                    <button
                        type="button"
                        className={styles.lightboxBackdrop}
                        onClick={closeLightbox}
                        aria-label={tl('portfolio.detail.fullview_alt')}
                    />
                    <div
                        className={`${styles.lightboxContent} ${lightboxVisible ? styles.lightboxContentVisible : ''}`}
                    >
                        <button type="button" onClick={closeLightbox} className={styles.lightboxClose}>
                            <X size={24} />
                        </button>
                        <img src={lightboxImage} alt={`${projectTitle} - ${tl('portfolio.detail.fullview_alt')}`} />
                    </div>
                </div>
            )}
        </div>
    );
}
