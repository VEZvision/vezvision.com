import styles from './AboutCards.module.css';
import { useLanguageContext } from '@/hooks/useLanguage';
import { StaggerItem, StaggerReveal } from '@/components/ui/SectionReveal';

const AboutCards: React.FC = () => {
    const { t } = useLanguageContext();

    const cards = [
        {
            title: t('about.cards.card1.title'),
            desc: t('about.cards.card1.desc'),
        },
        {
            title: t('about.cards.card2.title'),
            desc: t('about.cards.card2.desc'),
        },
        {
            title: t('about.cards.card3.title'),
            desc: t('about.cards.card3.desc'),
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <StaggerReveal className={styles.grid}>
                    {cards.map((card, index) => (
                        <StaggerItem
                            key={index}
                            className={styles.card}
                        >
                            <h3 className={styles.title}>{card.title}</h3>
                            <p className={styles.desc}>{card.desc}</p>
                        </StaggerItem>
                    ))}
                </StaggerReveal>
            </div>
        </section>
    );
};

export default AboutCards;
