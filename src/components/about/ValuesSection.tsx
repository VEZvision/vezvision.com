import styles from './ValuesSection.module.css';
import { useLanguageContext } from '@/hooks/useLanguage';
import SectionHeader from '@/components/ui/SectionHeader';
import { LayoutGrid, Command, TrendingUp, CheckCircle, Heart } from 'lucide-react';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';
import valuesImg1 from '@/assets/values/values-card-1.png';
import valuesImg2 from '@/assets/values/values-card-2.png';

const ValuesSection: React.FC = () => {
    const { t } = useLanguageContext();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionReveal>
                    <SectionHeader
                        badgeText={t('about.values.badge')}
                        badgeIcon={<Heart className="w-3.5 h-3.5" />}
                        title={
                            <>
                                {t('about.values.title.line1')} <span className="font-playfair italic">{t('about.values.title.line2.italic')}</span>
                            </>
                        }
                        subtitle={t('about.values.subtitle')}
                        id="values-heading"
                    />
                </SectionReveal>

                <StaggerReveal className={styles.bentoGrid}>
                    {/* === ROW 1 === */}
                    {/* Card 1: Wide (Image left + Text right) */}
                    <StaggerItem className={`${styles.card} ${styles.cardWide}`}>
                        <div className={styles.imageSide}>
                            <div className={styles.imageBox}>
                                <img src={valuesImg1} alt="" className={styles.cardImage} loading="lazy" decoding="async" />
                            </div>
                        </div>
                        <div className={styles.contentSide}>
                            <div className={styles.iconBox}>
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <h3 className={styles.cardTitle}>{t('about.values.card1.title')}</h3>
                            <p className={styles.cardDesc}>{t('about.values.card1.desc')}</p>
                        </div>
                    </StaggerItem>

                    {/* Card 2: Standard text card */}
                    <StaggerItem className={`${styles.card} ${styles.cardStandard}`}>
                        <div className={styles.iconBox}>
                            <Command className="w-5 h-5" />
                        </div>
                        <h3 className={styles.cardTitle}>{t('about.values.card2.title')}</h3>
                        <p className={styles.cardDesc}>{t('about.values.card2.desc')}</p>
                    </StaggerItem>

                    {/* === ROW 2 === */}
                    {/* Card 3: Standard text card */}
                    <StaggerItem className={`${styles.card} ${styles.cardStandard}`}>
                        <div className={styles.iconBox}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className={styles.cardTitle}>{t('about.values.card3.title')}</h3>
                        <p className={styles.cardDesc}>{t('about.values.card3.desc')}</p>
                    </StaggerItem>

                    {/* Card 4: Wide (Image left + Text right) */}
                    <StaggerItem className={`${styles.card} ${styles.cardWide}`}>
                        <div className={styles.imageSide}>
                            <div className={styles.imageBox}>
                                <img src={valuesImg2} alt="" className={styles.cardImage} loading="lazy" decoding="async" />
                            </div>
                        </div>
                        <div className={styles.contentSide}>
                            <div className={styles.iconBox}>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h3 className={styles.cardTitle}>{t('about.values.card4.title')}</h3>
                            <p className={styles.cardDesc}>{t('about.values.card4.desc')}</p>
                        </div>
                    </StaggerItem>
                </StaggerReveal>
            </div>
        </section>
    );
};

export default ValuesSection;
