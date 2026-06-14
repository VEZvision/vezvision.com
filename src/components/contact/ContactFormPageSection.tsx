import ContactFormSection from '@/components/contact/ContactFormSection';
import { useLanguageContext } from '@/hooks/useLanguage';

/** CMS `form` section on the contact page — resolves `t` from context. */
export default function ContactFormPageSection() {
  const { t } = useLanguageContext();
  return <ContactFormSection t={t} />;
}
