import { motion } from 'framer-motion';
import styles from './PotentialSection.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { Sparkles, Users } from 'lucide-react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';
import logoNavbar from '@/assets/logo-navbar.svg';

// Bar Chart Icon - matching the reference (blue bars)
const BarChartIcon = () => (
    <div className={styles.customBarIcon}>
        <div className={styles.barColumn}>
            <div className={styles.barMiddle} style={{ height: '10px' }} />
        </div>
        <div className={styles.barColumn}>
            <div className={styles.barMiddle} style={{ height: '16px' }} />
        </div>
        <div className={styles.barColumn}>
            <div className={styles.barFull} />
        </div>
    </div>
);

const PotentialSection: React.FC = () => {
    const { t } = useLanguageContext();

    return (
        <section id="potential" className={styles.section} aria-labelledby="potential-heading">
            <SectionReveal amount={0.1}>
            <div className={styles.container}>
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

                <StaggerReveal className={styles.bentoGrid} amount={0.1}>
                    {/* Row 1 */}
                    <div className={styles.bentoRow}>
                        {/* Card 1: Technologia */}
                        <StaggerItem>
                        <div className={`${styles.card} ${styles.cardSmall}`}>
                            <div className={styles.graphicArea}>
                                <div className={styles.connectionGraphic}>
                                    <div className={styles.neumorphPlate}>
                                        <BarChartIcon />
                                    </div>
                                    <div className={styles.dashedConnector} />
                                    <div className={styles.neumorphCircle}>
                                        <img src={logoNavbar} alt="VezVision" className="w-10 h-10 object-contain" />
                                    </div>
                                    <div className={`${styles.smallBubble} ${styles.bubble1}`} />
                                    <div className={`${styles.smallBubble} ${styles.bubble2}`} />
                                    <div className={`${styles.smallBubble} ${styles.bubble3}`} />
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
                                            <motion.div
                                                className={styles.blinkingCursor}
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
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
                                    <motion.div
                                        className={styles.floatingTagPill}
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <span>{t('potential.card3.tag1')}</span>
                                        <div className={styles.smallAvatar}>
                                            <Users className="w-3.5 h-3.5 text-gray-600" />
                                        </div>
                                    </motion.div>
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
                                <div className={styles.iconCluster}>
                                    <div className={styles.centralLogoPlate}>
                                        <img src={logoNavbar} alt="VezVision" className="w-10 h-10 object-contain" />
                                    </div>
                                    {/* ChatGPT spiral - top left */}
                                    <motion.div className={`${styles.appCircle} ${styles.appGPT}`} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                        </svg>
                                    </motion.div>
                                    {/* GitHub cat - far right */}
                                    <motion.div className={`${styles.appCircle} ${styles.appDiscord}`} animate={{ x: [0, 2, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
                                        </svg>
                                    </motion.div>
                                    {/* Discord robot - mid left */}
                                    <motion.div className={`${styles.appCircle} ${styles.appDrive}`} animate={{ x: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="4" y="8" width="16" height="10" rx="2" />
                                            <circle cx="9" cy="13" r="1.5" fill="currentColor" />
                                            <circle cx="15" cy="13" r="1.5" fill="currentColor" />
                                            <path d="M8 6l-2-2M16 6l2-2" />
                                        </svg>
                                    </motion.div>
                                    {/* Framer - bottom center */}
                                    <motion.div className={`${styles.appCircle} ${styles.appMore}`} animate={{ y: [0, 2, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" />
                                            <line x1="12" y1="22" x2="12" y2="8" />
                                            <line x1="2" y1="8" x2="12" y2="12" />
                                            <line x1="22" y1="8" x2="12" y2="12" />
                                        </svg>
                                    </motion.div>
                                </div>
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
            </SectionReveal>
        </section>
    );
};

export default PotentialSection;
