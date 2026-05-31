import styles from './ProcessSection.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { Layers, Sparkles, Upload, Headphones } from 'lucide-react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';

// Import images
import analysisImage from '@/assets/process/analysis-image.png';
import implementationImage from '@/assets/process/implementation-image.png';
import supportImage from '@/assets/process/support-image.png';

const ProcessSection: React.FC = () => {
    const { t } = useLanguageContext();

    return (
        <section id="process" className={styles.section} aria-labelledby="process-heading">
            <SectionReveal amount={0.1}>
            <div className={styles.container}>
                <SectionHeader
                    badgeText={t('process.badge')}
                    badgeIcon={<Layers className="w-3.5 h-3.5" />}
                    title={
                        <>
                            {t('process.title.line1')} <span className="font-playfair italic">{t('process.title.line2.italic')}</span>
                        </>
                    }
                    subtitle={t('process.subtitle')}
                    id="process-heading"
                />

                <StaggerReveal className={styles.bentoGrid} amount={0.1}>
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
                                <img
                                    src={analysisImage}
                                    alt={t('process.analysis.title')}
                                    className={styles.cardImage}
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
                                <img
                                    src={implementationImage}
                                    alt={t('process.implementation.title')}
                                    className={styles.cardImage}
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
                                <img
                                    src={supportImage}
                                    alt={t('process.support.title')}
                                    className={styles.cardImage}
                                />
                            </div>
                        </div>
                        </StaggerItem>
                    </div>
                </StaggerReveal>
            </div>
            </SectionReveal>
        </section>
    );
};

export default ProcessSection;
