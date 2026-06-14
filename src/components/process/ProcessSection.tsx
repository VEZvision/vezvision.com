import styles from './ProcessSection.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Layers, Sparkles, Upload, Headphones } from 'lucide-react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';

// Import images
import analysisImage from '@/assets/process/analysis-image.png';
import analysisImageSrcset from '@/assets/process/analysis-image.png?w=400;800&format=webp&as=srcset';
import analysisImageAvifSrcset from '@/assets/process/analysis-image.png?w=400;800&format=avif&as=srcset';
import implementationImage from '@/assets/process/implementation-image.png';
import implementationImageSrcset from '@/assets/process/implementation-image.png?w=400;800&format=webp&as=srcset';
import implementationImageAvifSrcset from '@/assets/process/implementation-image.png?w=400;800&format=avif&as=srcset';
import supportImage from '@/assets/process/support-image.png';
import supportImageSrcset from '@/assets/process/support-image.png?w=400;800&format=webp&as=srcset';
import supportImageAvifSrcset from '@/assets/process/support-image.png?w=400;800&format=avif&as=srcset';

function ProcessSection() { const { t } = useLanguageContext();

return (
    <section id="process" className={styles.section} aria-labelledby="process-heading">
        <div className={styles.container}>
            <SectionReveal>
            <SectionHeader
                badgeText={t('process.badge')}
                badgeIcon={<Layers className="w-3.5 h-3.5" />}
                title={
                    <>
                        {t('process.title.line1')} <span className="font-sans">{t('process.title.line2.italic')}</span>
                    </>
                }
                subtitle={t('process.subtitle')}
                id="process-heading"
            />
            </SectionReveal>

            <StaggerReveal className={styles.bentoGrid}>
                {/* Left Column - Tall Card 1 */}
                <div className={styles.leftColumn}>
                    <StaggerItem>
                    <div className={`${styles.card} ${styles.cardTall}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox}>
                                <Sparkles className="w-5 h-5" />
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{t('process.analysis.title')}</h3>
                            <p className={styles.cardDesc}>{t('process.analysis.desc')}</p>
                        </div>
                        <div className={styles.stepNumber}>
                            <span className={styles.number}>01</span>
                            <div className={styles.dots}>
                                <span className={styles.dotActive}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                        </div>
                        <div className={styles.imageArea}>
                            <ResponsiveImage
                                src={analysisImage}
                                srcSet={analysisImageSrcset}
                                avifSrcSet={analysisImageAvifSrcset}
                                alt={t('process.analysis.title')}
                                className={styles.cardImage}
                                sizes="(max-width: 1024px) 100vw, 400px"
                            />
                        </div>
                    </div>
                    </StaggerItem>
                </div>

                {/* Right Column - Two stacked cards */}
                <div className={styles.rightColumn}>
                    {/* Card 2 */}
                    <StaggerItem>
                    <div className={`${styles.card} ${styles.cardMedium}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox}>
                                <Upload className="w-5 h-5" />
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{t('process.implementation.title')}</h3>
                            <p className={styles.cardDesc}>{t('process.implementation.desc')}</p>
                        </div>
                        <div className={styles.stepNumber}>
                            <span className={styles.number}>02</span>
                            <div className={styles.dots}>
                                <span className={styles.dot}></span>
                                <span className={styles.dotActive}></span>
                                <span className={styles.dot}></span>
                            </div>
                        </div>
                        <div className={styles.imageArea}>
                            <ResponsiveImage
                                src={implementationImage}
                                srcSet={implementationImageSrcset}
                                avifSrcSet={implementationImageAvifSrcset}
                                alt={t('process.implementation.title')}
                                className={styles.cardImage}
                                sizes="(max-width: 1024px) 100vw, 400px"
                            />
                        </div>
                    </div>
                    </StaggerItem>

                    {/* Card 3 */}
                    <StaggerItem>
                    <div className={`${styles.card} ${styles.cardMedium}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox}>
                                <Headphones className="w-5 h-5" />
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{t('process.support.title')}</h3>
                            <p className={styles.cardDesc}>{t('process.support.desc')}</p>
                        </div>
                        <div className={styles.stepNumber}>
                            <span className={styles.number}>03</span>
                            <div className={styles.dots}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dotActive}></span>
                            </div>
                        </div>
                        <div className={styles.imageArea}>
                            <ResponsiveImage
                                src={supportImage}
                                srcSet={supportImageSrcset}
                                avifSrcSet={supportImageAvifSrcset}
                                alt={t('process.support.title')}
                                className={styles.cardImage}
                                sizes="(max-width: 1024px) 100vw, 400px"
                            />
                        </div>
                    </div>
                    </StaggerItem>
                </div>
            </StaggerReveal>
        </div>
    </section>
); };

export default ProcessSection;
