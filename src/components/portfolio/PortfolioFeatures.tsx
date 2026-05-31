import { motion } from 'framer-motion';
import {
    X,
    Clock,
    Check,
    RotateCcw,
    DollarSign,
    Mail,
    Star,
    Layers,
    FileUser,
    Sparkles,
    ArrowUpRight,
    Code,
    Search,
    MessageSquare,
    Zap,
    GitBranch,
    Database
} from 'lucide-react';
import styles from './PortfolioFeatures.module.css';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SectionReveal, StaggerItem, StaggerReveal } from '@/components/ui/SectionReveal';

const CODE_LINES = [
    { num: '1', content: <><span className={styles.keyword}>def</span> __init_(self,</> },
    { num: '', content: '    activation_limit):' },
    { num: '2', content: '        self.activation_limit =' },
    { num: '3', content: '    activation_limit' },
    { num: '4', content: <>        self.current_mode = <span className={styles.string}>"idle"</span></> },
    { num: '5', content: '' },
    { num: '', content: <><span className={styles.keyword}>def</span> evaluate_task(self, workload_value):</> },
    { num: '', content: <span style={{ opacity: 0.5 }}>        if workload_value &gt;</span> },
] as const;

const PortfolioFeatures = () => {
    const { language } = useLanguageContext();
    const isPl = language === 'pl';
    const reducedMotion = useReducedMotion();

    const pulseAnimation = {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Section Header */}
                <SectionReveal>
                    <header className={styles.header}>
                        <div className={styles.badge}>
                            <Sparkles size={14} />
                            {isPl ? 'Nasze Możliwości' : 'Our Capabilities'}
                        </div>
                        <h2 className={styles.sectionTitle}>
                            {isPl ? 'Co możemy dla Ciebie zrobić?' : 'What can we do for you?'}
                        </h2>
                         <p className={styles.sectionSubtitle}>
                             {isPl
                                 ? 'Rozwiązania IT dopasowane do tego, czego naprawdę potrzebuje Twoja firma.'
                                 : 'IT solutions built around what your company actually needs.'}
                         </p>
                    </header>
                </SectionReveal>

                <div className={styles.grid}>
                    {/* Top Row - 2 cards */}
                    <StaggerReveal className={styles.topRow}>
                        {/* Card 1: Checklist */}
                        <StaggerItem className={styles.card}>
                            <div className={styles.visualArea}>
                                <div className={styles.checklistContainer}>
                                    {[
                                        { icon: X, text: isPl ? 'Pełna kontrola' : 'Full control', done: true },
                                        { icon: Sparkles, text: isPl ? 'Bez zbędnych formalności' : 'No unnecessary formalities', done: false },
                                        { icon: Clock, text: isPl ? 'Więcej czasu na rozwój' : 'More time for growth', done: true },
                                        { icon: DollarSign, text: isPl ? 'Szybsze procesy' : 'Faster processes', done: false },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            className={styles.checklistItem}
                                            whileHover={reducedMotion ? undefined : { x: 4, transition: { duration: 0.2 } }}
                                        >
                                            <div className={styles.checklistLeft}>
                                                <item.icon className={styles.checklistIcon} />
                                                <span className={styles.checklistText}>{item.text}</span>
                                            </div>
                                            {item.done ? (
                                                <Check className={`${styles.checklistStatus} ${styles.checked}`} size={16} />
                                            ) : (
                                                <RotateCcw className={styles.checklistStatus} size={16} />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>
                                    {isPl ? 'Więcej czasu na rozwój.' : 'More time for growth.'}
                                </h3>
                                <p className={styles.description}>
                                    {isPl
                                        ? 'Automatyzacja procesów IT dla przedsiębiorstw nastawionych na efektywność.'
                                        : 'IT process automation for efficiency-focused enterprises.'}
                                </p>
                            </div>
                        </StaggerItem>

                        {/* Card 2: Floating Icons */}
                        <StaggerItem className={styles.card}>
                            <div className={styles.visualArea}>
                                <div className={styles.iconsContainer}>
                                    <motion.div
                                        className={styles.centerStar}
                                        animate={reducedMotion ? undefined : pulseAnimation}
                                    >
                                        <Star size={28} fill="currentColor" />
                                    </motion.div>
                                    {[Mail, MessageSquare, FileUser, Layers, Zap, Code, Sparkles, Database, GitBranch, Star, Search, ArrowUpRight].map((Icon, i) => (
                                        <motion.div
                                            key={i}
                                            className={styles.floatingIcon}
                                            animate={reducedMotion ? undefined : {
                                                y: [0, -6 - (i % 4) * 2, 0],
                                                rotate: [0, i % 2 === 0 ? 5 : -5, 0]
                                            }}
                                            transition={reducedMotion ? undefined : {
                                                duration: 2.5 + (i % 5) * 0.3,
                                                repeat: Infinity,
                                                ease: "easeInOut" as const,
                                                delay: i * 0.15
                                            }}
                                        >
                                            <Icon size={18} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>
                                    {isPl ? 'Zarządzanie bez stresu' : 'Stress-free management'}
                                </h3>
                                <p className={styles.description}>
                                    {isPl
                                        ? 'Zmieniamy sposób, w jaki Twój zespół pracuje z narzędziami IT. Pełna płynność pracy, zero chaosu.'
                                        : 'Transforming how your team works with IT tools. Full workflow fluidity, zero chaos.'}
                                </p>
                            </div>
                        </StaggerItem>
                    </StaggerReveal>

                    {/* Bottom Row - 3 cards */}
                    <StaggerReveal className={styles.bottomRow}>
                        {/* Card 3: AI Search */}
                        <StaggerItem className={styles.card}>
                            <div className={styles.visualArea}>
                                <div className={styles.searchContainer}>
                                    <div className={styles.searchBar}>
                                        <Search size={16} style={{ color: '#98a2b3' }} />
                                        <span className={styles.searchInput}>Research anything...</span>
                                        <motion.span
                                            className={styles.searchButton}
                                            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                                            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                                        >
                                            Research
                                        </motion.span>
                                    </div>
                                    <div className={styles.suggestions}>
                                        {[
                                            isPl ? 'Badanie konkurencji w Twojej branży' : 'Competition research in your industry',
                                            isPl ? 'Analiza UX oraz zachowań użytkowników' : 'UX and user behavior analysis',
                                            isPl ? 'Wskaźniki zwiększające konwersję...' : 'Conversion-boosting metrics...',
                                        ].map((text, i) => (
                                            <motion.div
                                                key={i}
                                                className={styles.suggestionItem}
                                                whileHover={reducedMotion ? undefined : { x: 4, backgroundColor: '#fafafa' }}
                                            >
                                                <div className={styles.suggestionLeft}>
                                                    <Sparkles className={styles.suggestionIcon} />
                                                    <span className={styles.suggestionText}>{text}</span>
                                                </div>
                                                <ArrowUpRight className={styles.suggestionArrow} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>
                                    {isPl ? 'Znajduj odpowiedzi zanim o nie zapytasz' : 'Find answers before you ask'}
                                </h3>
                                <p className={styles.description}>
                                    {isPl
                                        ? 'Twoja wiedza. Nasza technologia. Przewaga od pierwszego kliknięcia.'
                                        : 'Your knowledge. Our technology. Advantage from the first click.'}
                                </p>
                            </div>
                        </StaggerItem>

                        {/* Card 4: Code Editor */}
                        <StaggerItem className={styles.card}>
                            <div className={styles.visualArea}>
                                <div className={styles.codeContainer}>
                                    <div className={styles.codeHeader}>
                                        <div className={styles.codeDots}>
                                            <span className={`${styles.codeDot} ${styles.red}`}></span>
                                            <span className={`${styles.codeDot} ${styles.yellow}`}></span>
                                            <span className={`${styles.codeDot} ${styles.green}`}></span>
                                        </div>
                                        <div className={styles.codeTab}>
                                            <Code size={12} />
                                            <span>Code</span>
                                            <span style={{ marginLeft: 4, opacity: 0.5 }}>&lt;/&gt;</span>
                                        </div>
                                    </div>
                                    <div className={styles.codeBody}>
                                        {CODE_LINES.map((line, i) => (
                                            <div
                                                key={i}
                                                className={styles.codeLine}
                                                style={reducedMotion ? undefined : { animationDelay: `${i * 0.24}s` }}
                                            >
                                                <span className={styles.lineNumber}>{line.num}</span>
                                                <span
                                                    className={styles.lineContent}
                                                    style={reducedMotion ? undefined : { animationDelay: `${i * 0.24 + 0.08}s` }}
                                                >
                                                    {line.content}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>
                                    {isPl ? 'Kodujemy Twój sukces' : 'We code your success'}
                                </h3>
                                <p className={styles.description}>
                                    {isPl
                                        ? 'Wdrażamy unikalne skrypty i narzędzia IT, które automatyzują zadania w firmie'
                                        : 'We implement unique scripts and IT tools that automate tasks in your company'}
                                </p>
                            </div>
                        </StaggerItem>

                        {/* Card 5: Integrations - IMPROVED */}
                        <StaggerItem className={styles.card}>
                            <div className={styles.visualArea}>
                                <div className={styles.integrationsGrid}>
                                    {/* Row 1 */}
                                    <motion.div
                                        className={styles.integrationIcon}
                                        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                                        transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0 }}
                                    >
                                        <Layers size={24} />
                                    </motion.div>
                                    <motion.div
                                        className={`${styles.integrationIcon} ${styles.featured}`}
                                        animate={reducedMotion ? undefined : { scale: [1, 1.05, 1] }}
                                        transition={reducedMotion ? undefined : { duration: 2, repeat: Infinity }}
                                    >
                                        <Zap size={28} />
                                    </motion.div>
                                    <motion.div
                                        className={styles.integrationIcon}
                                        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                                        transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0.3 }}
                                    >
                                        <GitBranch size={24} />
                                    </motion.div>

                                    {/* Row 2 */}
                                    <motion.div
                                        className={styles.integrationIcon}
                                        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                                        transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0.5 }}
                                    >
                                        <Database size={24} />
                                    </motion.div>
                                    <motion.div
                                        className={styles.integrationIcon}
                                        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                                        transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0.7 }}
                                    >
                                        <MessageSquare size={24} />
                                    </motion.div>
                                    <motion.div
                                        className={styles.integrationIcon}
                                        animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                                        transition={reducedMotion ? undefined : { duration: 2.5, repeat: Infinity, delay: 0.9 }}
                                    >
                                        <Code size={24} />
                                    </motion.div>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>
                                    {isPl ? 'Łączymy ludzi i systemy' : 'Connecting people and systems'}
                                </h3>
                                <p className={styles.description}>
                                    {isPl
                                        ? 'Szybka współpraca, analiza wyników, wygodna wymiana danych.'
                                        : 'Fast collaboration, results analysis, convenient data exchange.'}
                                </p>
                            </div>
                        </StaggerItem>
                    </StaggerReveal>
                </div>
            </div>
        </section>
    );
};

export default PortfolioFeatures;
