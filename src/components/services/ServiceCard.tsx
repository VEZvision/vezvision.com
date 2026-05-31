import styles from './ServiceCard.module.css';
import { Zap, LucideIcon, Globe, Smartphone, Database, ScanLine } from 'lucide-react';

interface ServiceCardProps {
    title: string;
    description: string;
    className?: string;
    icon?: string;
}

function isImageSource(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return (
        normalized.startsWith('http://') ||
        normalized.startsWith('https://') ||
        normalized.startsWith('/') ||
        normalized.startsWith('data:image/')
    );
}

const iconMap: Record<string, LucideIcon> = {
    Globe,
    Smartphone,
    Database,
    ScanLine,
};

function resolveLucideIcon(name: string): LucideIcon | null {
    const sanitized = name.replace(/[^a-z0-9]/gi, '').toLowerCase();

    if (iconMap[name]) return iconMap[name];

    const normalizedMatch = Object.keys(iconMap).find((key) => {
        return key.replace(/[^a-z0-9]/gi, '').toLowerCase() === sanitized;
    });

    const candidate = normalizedMatch ? iconMap[normalizedMatch] : undefined;

    if (isRenderableLucideIcon(candidate)) return candidate;
    return null;
}

function isRenderableLucideIcon(value: unknown): value is LucideIcon {
    if (typeof value === 'function') return true;
    return Boolean(value && typeof value === 'object' && ('$$typeof' in value || 'render' in value));
}

/**
 * ServiceCard Component - Premium v3
 * Displays a professional service card with an icon, title, and description.
 */
const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    description,
    className,
    icon
}) => {
    const normalizedIcon = icon?.trim() ?? '';
    const LucideResolvedIcon = normalizedIcon ? resolveLucideIcon(normalizedIcon) : null;
    const shouldRenderImage = normalizedIcon.length > 0 && isImageSource(normalizedIcon);

    return (
        <article
            className={`${styles.card} ${className || ''}`}
        >
            <div className={styles.header}>
                <div className={styles.iconBox}>
                    {LucideResolvedIcon ? (
                        <LucideResolvedIcon />
                    ) : shouldRenderImage ? (
                        <img src={normalizedIcon} alt="" aria-hidden="true" />
                    ) : normalizedIcon ? (
                        <span className={styles.iconText}>{normalizedIcon}</span>
                    ) : (
                        <Zap />
                    )}
                </div>
                <span className={styles.arrow} aria-hidden="true">↗</span>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.desc}>{description}</p>
            </div>
        </article>
    );
};

export default ServiceCard;
