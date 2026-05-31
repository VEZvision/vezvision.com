import ContactTile from './ContactTile';
import styles from './ContactSection.module.scss';
import { useLanguageContext } from '@/hooks/useLanguage';
import { Headset } from 'lucide-react';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';
import { useLocation } from 'react-router-dom';

import { useSettings } from '@/hooks/useSettings';
import { usePageSectionConfig } from '@/hooks/usePageSection';

const ContactSection: React.FC = () => {
  const { t } = useLanguageContext();
  const { contact, loading, error } = useSettings();
  const location = useLocation();
  const pageKey = location.pathname === '/about' ? 'about' : location.pathname === '/contact' ? 'contact' : 'home';
  const sectionConfig = usePageSectionConfig(pageKey, 'contact');
  const fallbackMeetingHref = typeof sectionConfig.meetingHref === 'string' ? sectionConfig.meetingHref : '/contact';

  const tiles = [
    {
      type: 'email' as const,
      title: t('contact.tile.email.title'),
      desc: t('contact.tile.email.desc'),
      actionLabel: t('contact.tile.email.action'),
      href: contact?.email ? `mailto:${contact.email}` : ''
    },
    {
      type: 'phone' as const,
      title: t('contact.tile.phone.title'),
      desc: contact?.phone || t('contact.tile.phone.desc'),
      actionLabel: contact?.phone || t('contact.tile.phone.action'),
      href: contact?.phone ? `tel:${contact.phone.replace(/\s+/g, '')}` : ''
    },
    {
      type: 'meeting' as const,
      title: t('contact.tile.meeting.title'),
      desc: t('contact.tile.meeting.desc'),
      actionLabel: t('contact.tile.meeting.action'),
      href: fallbackMeetingHref
    }
  ];

  return (
    <section className={styles['contact-section']} id="kontakt">
      <div className={styles['contact-section__container']}>
        <div className={styles['contact-section__divider']} />
        <SectionReveal>
          <div className={styles['contact-section__header']}>
            <div className={styles['contact-section__icon-wrapper']}>
              <Headset size={32} />
            </div>
            <h2 className={styles['contact-section__title']}>
              {t('contact.title')}
            </h2>
            <p className={styles['contact-section__subtitle']}>
              {t('contact.subtitle')}
            </p>
          </div>
        </SectionReveal>

        <StaggerReveal className={styles['contact-section__tiles']}>
          {tiles.map((tile) => (
            <StaggerItem key={tile.type}>
              <ContactTile
                type={tile.type}
                title={tile.title}
                desc={tile.desc}
                actionLabel={tile.actionLabel}
                href={tile.href}
                loading={loading || (!contact && !error)}
              />
            </StaggerItem>
          ))}
        </StaggerReveal>

        <SectionReveal delay={0.2}>
          <div className={styles['contact-section__footer']}>
            <p className={styles['contact-section__footer-text']}>
              {t('contact.footer')}
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default ContactSection;
