import styles from './SectionHeader.module.css';
import SectionBadge from './SectionBadge';

interface SectionHeaderProps {
    badgeText?: string;
    badgeIcon?: React.ReactNode;
    title: string | React.ReactNode;
    subtitle: string;
    className?: string;
    id?: string;
}

function SectionHeader({
    badgeText,
    badgeIcon,
    title,
    subtitle,
    className = '',
    id
}: SectionHeaderProps) { return (
    <header className={`${styles.header} ${className}`}>
        {badgeText && (
            <div className={styles.badgeWrapper}>
                <SectionBadge text={badgeText} icon={badgeIcon} />
            </div>
        )}
        <h2 id={id} className={styles.title}>
            {title}
        </h2>
        <p className={styles.subtitle}>
            {subtitle}
        </p>
    </header>
); };

export default SectionHeader;
