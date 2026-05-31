import { useState, type ChangeEvent, type FormEvent } from 'react';
import styles from './ContactFormSection.module.scss';
import { LanguageContextType } from '@/hooks/useLanguage';
import SectionHeader from '@/components/ui/SectionHeader';
import { Mail, Loader2, Send } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useLanguageContext } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { logError } from '@/lib/logger';
import { submitContactForm, type ContactSubmissionPayload } from '@/services/contact';
import {
  formatTelHref,
  normalizeContactEmail,
  normalizeContactPhone,
} from '@/utils/contactValidation';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

interface Props { t: LanguageContextType['t'] }

function normalizeAddress(value: string | null | undefined): string | null {
  const address = value?.trim();
  if (!address || address.length > 300 || /[<>]/.test(address)) return null;
  return address;
}

const ContactFormSection = ({ t }: Props) => {
  const { contact, loading, error } = useSettings();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguageContext();
  const displayEmail = contact?.email?.trim() || 'contact@vezvision.com';
  const displayPhone = contact?.phone?.trim() || (language === 'pl' ? 'Umów rozmowę mailowo' : 'Book a call by email');
  const displayAddress = contact?.address?.trim() || (language === 'pl' ? 'Spotkania online i zdalnie' : 'Online and remote meetings');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('contact.form.error.fullName');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.error.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.error.email.invalid');
    }

    if (formData.phone.trim()) {
      const phoneResult = normalizeContactPhone(formData.phone);
      if (phoneResult.invalid || !phoneResult.phone) {
        newErrors.phone = t('contact.form.error.phone');
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.error.subject');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.error.message');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.form.error.messageTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      const phoneResult = normalizeContactPhone(formData.phone);
      const payload: ContactSubmissionPayload = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: phoneResult.phone,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        language,
      };
      try {
        await submitContactForm(payload);

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });

        toast.success(t('contact.form.success'));

      } catch (err) {
        logError('contactForm.submit', err);
        const msg = err instanceof Error ? err.message : t('common.error');
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEmailClick = () => {
    const email = normalizeContactEmail(displayEmail);
    if (email) window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = () => {
    const phoneResult = normalizeContactPhone(contact?.phone);
    if (phoneResult.phone) window.location.href = formatTelHref(phoneResult.phone);
  };

  const handleAddressClick = () => {
    const address = normalizeAddress(contact?.address);
    if (address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="contact-form-section"
      className={styles.sectionContactContainer}
    >
      <div>
        <SectionHeader
          badgeText={t('contact.form.badge')}
          badgeIcon={<Mail className="w-3.5 h-3.5" />}
          title={
            <>
              {t('contact.form.title.line1')} <span className="font-playfair italic font-medium">{t('contact.form.title.line2.italic')}</span>
            </>
          }
          subtitle={t('contact.form.subtitle')}
          className="mb-16"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.contacts}>
          <button type="button" className={styles.contactCard} onClick={handleEmailClick}>
            <div className={styles.iconContainer}>
              <div className={styles.iconEmail} />
            </div>
            <p className={styles.contactText}>
              {t('contact.form.email.prompt.line1')}
              <br />
              {t('contact.form.email.prompt.line2')}
            </p>
            <div className={styles.link}>
              {loading || (!contact && !error) ? (
                <span className="inline-block w-40 h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className={styles.contactInfo}>{displayEmail}</span>
              )}
            </div>
          </button>

          <button type="button" className={styles.contactCard} onClick={handlePhoneClick}>
            <div className={styles.iconContainer}>
              <div className={styles.iconPhone} />
            </div>
            <p className={styles.contactText}>
              {t('contact.form.phone.prompt.line1')}
              <br />
              {t('contact.form.phone.prompt.line2')}
            </p>
            <div className={styles.link}>
              {loading || (!contact && !error) ? (
                <span className="inline-block w-32 h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className={styles.contactInfo}>{displayPhone}</span>
              )}
            </div>
          </button>

          <button type="button" className={styles.contactCard} onClick={handleAddressClick}>
            <div className={styles.iconContainer}>
              <div className={styles.iconAddress} />
            </div>
            <p className={styles.contactText}>
              {t('contact.tile.address.title')}
              <br />
              {t('contact.tile.address.desc')}
            </p>
            <div className={styles.link}>
              {loading || (!contact && !error) ? (
                <span className="inline-block w-48 h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className={styles.contactInfo}>{displayAddress}</span>
              )}
            </div>
          </button>
        </div>

        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.label.fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`${styles.fieldInput} ${errors.fullName ? styles.error : ''}`}
              placeholder={t('contact.form.placeholder.fullName')}
            />
            {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.label.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.fieldInput} ${errors.email ? styles.error : ''}`}
              placeholder={t('contact.form.placeholder.email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.label.phoneOptional')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`${styles.fieldInput} ${errors.phone ? styles.error : ''}`}
              placeholder={contact?.phone || ''}
            />
            {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.label.subject')}</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`${styles.fieldInput} ${errors.subject ? styles.error : ''}`}
              placeholder={t('contact.form.placeholder.subject')}
            />
            {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.label.message')}</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`${styles.fieldTextarea} ${errors.message ? styles.error : ''}`}
              placeholder={t('contact.form.placeholder.message')}
              rows={4}
            />
            {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
          </div>

          <div className={`${styles.formField} !mb-6`}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                {t('contact.form.consent')} <a href="/privacy-policy" className="underline hover:text-black">{t('footer.legal.privacy')}</a>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
            disabled={isSubmitting}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                  <span>{t('common.saving') || 'Wysyłanie...'}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t('contact.form.submit')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
