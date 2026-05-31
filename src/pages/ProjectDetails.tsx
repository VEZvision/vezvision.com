import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
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
import { useLanguage } from '@/hooks/useLanguage';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useProject } from '@/hooks/usePortfolio';
import { getProjectImageUrl } from '@/services/portfolio';
import { useSettings } from '@/hooks/useSettings';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LoadingScreen } from '@/components/loading';
import styles from './ProjectDetails.module.css';

export default function ProjectDetails() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { t: tl } = useLanguageContext();
    const { project, loading } = useProject(slug || null);
    const { seo } = useSettings();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const isTouch = useReducedMotion();

    const t = (key: string, defaultText: string): string => {
        if (!project || !project.translations) return defaultText;
        const translation = project.translations[language];
        if (!translation) return defaultText;
        const value = translation[key as keyof typeof translation];
        if (Array.isArray(value)) {
            const joinedValue = value.join(', ');
            return joinedValue || defaultText;
        }
        // Return defaultText if value is undefined, null, or empty string
        return value && value.trim() !== '' ? value : defaultText;
    };

    const fadeInUp = isTouch
        ? { hidden: {}, visible: {} }
        : {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
        };

    const viewportProps = isTouch ? {} : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

    if (loading) return <LoadingScreen />;

    if (!project && !loading) {
        return (
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
                    <button type="button" onClick={() => navigate('/portfolio')} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        {tl('portfolio.detail.back')}
                    </button>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const projectTitle = t('title', project.slug);
    const fullTitle = seo?.siteTitle ? `${projectTitle} | ${seo.siteTitle}` : projectTitle;
    const canonicalUrl = seo?.siteUrl ? `${seo.siteUrl.replace(/\/$/, '')}/portfolio/${project.slug}` : `/portfolio/${project.slug}`;
    const ogDescription = project.translations?.[language]?.short_description || seo?.siteDescription || '';
    const ogImage = project.cover_path ? getProjectImageUrl(project.cover_path) : (seo?.siteUrl ? `${seo.siteUrl.replace(/\/$/, '')}/favicon.svg` : '/favicon.svg');

    return (
        <div className={styles.page}>
            <Helmet>
                <title>{fullTitle}</title>
                {ogDescription && <meta name="description" content={ogDescription} />}
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>
            <div className={styles.container}>
                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.nav}
                >
                    <Link to="/portfolio" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        <span>Portfolio</span>
                    </Link>
                    <span className={styles.navDivider}>/</span>
                    <span className={styles.navCurrent}>{t('title', project.slug)}</span>
                </motion.div>

                {/* Hero */}
                <motion.header
                    className={styles.hero}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <div className={styles.heroContent}>
                        <div className={styles.categoryBadge}>
                            <Layers size={14} />
                            <span>{project.category?.replace('-', ' ')}</span>
                        </div>
                        <h1 className={styles.title}>{t('title', project.slug)}</h1>
                        <p className={styles.subtitle}>{t('short_description', '')}</p>

                        <div className={styles.actions}>
                            {project.show_demo_url !== false && project.demo_url && (
                                <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                                    {tl('portfolio.detail.view_live')}
                                    <ExternalLink size={16} />
                                </a>
                            )}
                            {project.github_url && (
                                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                                    <GitBranch size={16} />
                                    Source Code
                                </a>
                            )}
                        </div>
                    </div>
                </motion.header>

                {/* Cover Image - Card Style */}
                {project.show_cover_image !== false && project.cover_path && (
                    <motion.div
                        className={styles.coverCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={styles.coverImageWrapper}>
                            <img
                                src={getProjectImageUrl(project.cover_path)}
                                alt={t('title', 'Project Cover')}
                                className={styles.coverImage}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Main Grid */}
                <div className={styles.grid}>
                    {/* Left Column - Content */}
                    <div className={styles.mainColumn}>
                        {/* Description Card */}
                        <motion.section
                            className={styles.card}
                            {...viewportProps}
                            variants={fadeInUp}
                        >
                            <h2 className={styles.cardTitle}>
                                {tl('portfolio.detail.about')}
                            </h2>
                            <div
                                className={styles.prose}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('description', '')) }}
                            />
                        </motion.section>

                        {/* Challenge & Solution */}
                        <div className={styles.twoColumns}>
                            {project.show_challenge !== false && (
                            <motion.section
                                className={styles.card}
                                {...viewportProps}
                                variants={fadeInUp}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={`${styles.iconBox} ${styles.amber}`}>
                                        <div className={styles.dot} />
                                    </div>
                                    <h3 className={styles.cardSubtitle}>
                                        {tl('portfolio.detail.challenge')}
                                    </h3>
                                </div>
                                <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('challenge', '...')) }} />
                            </motion.section>
                            )}

                            {project.show_solution !== false && (
                            <motion.section
                                className={styles.card}
                                {...viewportProps}
                                variants={fadeInUp}
                                transition={{ delay: 0.1 }}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={`${styles.iconBox} ${styles.emerald}`}>
                                        <div className={styles.dot} />
                                    </div>
                                    <h3 className={styles.cardSubtitle}>
                                        {tl('portfolio.detail.solution')}
                                    </h3>
                                </div>
                                <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('solution', '...')) }} />
                            </motion.section>
                            )}
                        </div>

                        {/* Gallery */}
                        {project.images && project.images.length > 0 && (
                            <motion.section
                                className={styles.gallerySection}
                                {...viewportProps}
                                variants={fadeInUp}
                            >
                                <h2 className={styles.sectionTitle}>
                                    {tl('portfolio.detail.gallery')}
                                </h2>
                                <div className={styles.galleryGrid}>
                                    {project.images.map((img) => (
                                        <div
                                            key={img.id}
                                            className={styles.galleryItem}
                                            onClick={() => setSelectedImage(getProjectImageUrl(img.path))}
                                        >
                                            <div className={styles.galleryItemInner}>
                                                <img src={getProjectImageUrl(img.path)} alt={`${projectTitle} - ${tl('portfolio.detail.gallery')}`} loading="lazy" decoding="async" />
                                            </div>
                                            <div className={styles.galleryOverlay}>
                                                <Maximize2 size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className={styles.sidebar}>
                        {/* Meta Card */}
                        <motion.div
                            className={styles.card}
                            {...viewportProps}
                            variants={fadeInUp}
                        >
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

                        </motion.div>

                        {/* Scope Card */}
                        <motion.div
                            className={styles.card}
                            {...viewportProps}
                            variants={fadeInUp}
                            transition={{ delay: 0.1 }}
                        >
                            <div className={styles.scopeHeader}>
                                <CheckCircle2 size={18} className={styles.scopeIcon} />
                                <span>{tl('portfolio.detail.scope')}</span>
                            </div>
                            <ul className={styles.scopeList}>
                                {project.scope && Array.isArray(project.scope) && project.scope.length > 0 ? (
                                    project.scope.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))
                                ) : (
                                        <li className={styles.noScope}>
                                            {tl('portfolio.detail.scope_empty')}
                                        </li>
                                )}
                            </ul>
                        </motion.div>
                    </aside>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.lightbox}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className={styles.lightboxContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button type="button" onClick={() => setSelectedImage(null)} className={styles.lightboxClose}>
                                <X size={24} />
                            </button>
                            <img src={selectedImage} alt={`${projectTitle} - ${tl('portfolio.detail.fullview_alt')}`} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
