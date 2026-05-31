import { useState } from 'react';
import styles from './NewsletterSection.module.css';
import { Mail } from 'lucide-react';
import { subscribeToNewsletter } from '../../services/newsletter';
import { logError } from '@/lib/logger';
import { toast } from 'sonner';
import SectionReveal from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';

const NewsletterSection: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { t, language } = useLanguageContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error(t('newsletter.error.empty'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error(t('newsletter.error.invalid'));
            return;
        }

        setLoading(true);

        try {
            const result = await subscribeToNewsletter(email, language, 'home');

            if (result.success) {
                toast.success(t('newsletter.success'));
                setEmail('');
            } else {
                const errorMessage = result.error || '';
                if (errorMessage.includes('unique constraint') || errorMessage.toLowerCase().includes('już zapisany')) {
                    toast.info(t('newsletter.duplicate'));
                } else {
                    toast.error(errorMessage || t('newsletter.error.general'));
                }
            }
        } catch (error) {
            logError('newsletterSection.subscribe', error);
            toast.error(t('newsletter.error.unexpected'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.newsletterSection}>
            <SectionReveal>
                <div className={styles.container}>
                    <div className={styles.iconWrapper}>
                        <Mail size={32} />
                    </div>

                    <h2 className={styles.title}>{t('newsletter.title')}</h2>
                    <p className={styles.description}>{t('newsletter.description')}</p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder={t('newsletter.placeholder')}
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? t('newsletter.submitting') : t('newsletter.submit')}
                        </button>
                    </form>

                    <p className={styles.disclaimer}>{t('newsletter.disclaimer')}</p>
                </div>
            </SectionReveal>
        </section>
    );
};

export default NewsletterSection;
