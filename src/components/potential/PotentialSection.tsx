import styles from './PotentialSection.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { Sparkles, Users } from 'lucide-react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';
import logoIcon from '@/assets/services/logo-icon.svg';
import IdeaIconCluster from '@/components/potential/IdeaIconCluster';

const BarChartIcon = () => (
    <div className={styles.customBarIcon} aria-hidden>
        <div className={styles.barColumn}>
            <div className={styles.barMiddle} style={{ height: '12px' }} />
        </div>
        <div className={styles.barColumn}>
            <div className={styles.barMiddle} style={{ height: '18px' }} />
        </div>
        <div className={styles.barColumn}>
            <div className={styles.barFull} />
        </div>
    </div>
);

const PotentialSection: React.FC = () => {
    const { t } = useLanguageContext();
    return (
        <section id="potential" className={`${styles.section} ${styles.decorativeZone} vez-decorative-motion`} aria-labelledby="potential-heading">
            <div className={styles.container}>
                <SectionReveal amount={0.1}>
                <SectionHeader
                    badgeText={t('potential.badge')}
                    badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
                    title={
                        <>
                            {t('potential.title.line1')} <span className="font-playfair italic">{t('potential.title.line2.italic')}</span>
                        </>
                    }
                    subtitle={t('potential.subtitle')}
                    id="potential-heading"
                />
                </SectionReveal>

                <StaggerReveal className={styles.bentoGrid} amount={0.12}>
                    {/* Row 1 */}
                    <div className={styles.bentoRow}>
                        {/* Card 1: Technologia */}
                        <StaggerItem>
                        <div className={`${styles.card} ${styles.cardSmall}`}>
                            <div className={styles.graphicArea}>
                                <div className={styles.techBridge}>
                                    <div className={styles.techOrb}>
                                        <BarChartIcon />
                                    </div>
                                    <div className={styles.techPath} aria-hidden>
                                        <span className={styles.techPathLine} />
                                        <span className={styles.techPathDot} />
                                    </div>
                                    <div className={styles.techOrb}>
                                        <img
                                            src={logoIcon}
                                            alt=""
                                            className={styles.techLogo}
                                            width={36}
                                            height={36}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{t('potential.card1.title')}</h3>
                                <p className={styles.cardDesc}>{t('potential.card1.desc')}</p>
                            </div>
                        </div>
                        </StaggerItem>

                        {/* Card 2: Siła synergii */}
                        <StaggerItem>
                        <div className={`${styles.card} ${styles.cardLarge}`}>
                            <div className={styles.graphicArea}>
                                <div className={styles.interactionMockup}>
                                    <div className={styles.mockupHeader}>
                                        <div className={styles.searchBarPill}>
                                            <div className={styles.statusCircle} />
                                            <span className={styles.blinkingCursor} />
                                        </div>
                                        <div className={styles.sendPillButton}>
                                            {t('potential.card2.button')}
                                        </div>
                                    </div>
                                    <div className={styles.suggestionList}>
                                        <p className={styles.suggestionItem}>{t('potential.card2.line1')}</p>
                                        <p className={styles.suggestionItem}>{t('potential.card2.line2')}</p>
                                        <p className={styles.suggestionItem}>{t('potential.card2.line3')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{t('potential.card2.title')}</h3>
                                <p className={styles.cardDesc}>{t('potential.card2.desc')}</p>
                            </div>
                        </div>
                        </StaggerItem>
                    </div>

                    {/* Row 2 */}
                    <div className={styles.bentoRow}>
                        {/* Card 3: Wspólnie przekraczamy */}
                        <StaggerItem>
                        <div className={`${styles.card} ${styles.cardLarge}`}>
                            <div className={styles.graphicArea}>
                                <div className={styles.pillLayout}>
                                    <div className={styles.floatingTagPill}>
                                        <span>{t('potential.card3.tag1')}</span>
                                        <div className={styles.smallAvatar}>
                                            <Users className="w-3.5 h-3.5 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className={styles.centerGhostPill}>
                                        {t('potential.card3.inspiration')}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{t('potential.card3.title')}</h3>
                                <p className={styles.cardDesc}>{t('potential.card3.desc')}</p>
                            </div>
                        </div>
                        </StaggerItem>

                        {/* Card 4: Od pomysłu do efektu */}
                        <StaggerItem>
                        <div className={`${styles.card} ${styles.cardSmall}`}>
                            <div className={styles.graphicArea}>
                                <IdeaIconCluster />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{t('potential.card4.title')}</h3>
                                <p className={styles.cardDesc}>{t('potential.card4.desc')}</p>
                            </div>
                        </div>
                        </StaggerItem>
                    </div>
                </StaggerReveal>
            </div>
        </section>
    );
};

export default PotentialSection;
