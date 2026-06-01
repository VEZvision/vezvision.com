import '../styles/GridBackground.css';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, GraduationCap, Briefcase, Cpu } from 'lucide-react';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import SectionHeader from '@/components/ui/SectionHeader';
import { useLanguageContext } from '@/hooks/useLanguage';
import { subscribeToNewsletter } from '@/services/newsletter';
import { toast } from 'sonner';
import PageSeo from '@/components/seo/PageSeo';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';

const Products = () => {
  const { t, language } = useLanguageContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error(t('products.newsletter.error.email'));
      return;
    }

    setIsSubmitting(true);
    const result = await subscribeToNewsletter(email, language, 'products');
    setIsSubmitting(false);

    if (result.success) {
      toast.success(t('products.newsletter.success'));
      setEmail('');
    } else {
      toast.error(result.error || t('products.newsletter.error.generic'));
    }
  };

    return (
    <div style={{ backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageSeo pageKey="products" />

      <div className="grid-background"></div>
      <VideoHeroSection
        badge={t('products.badge')}
        title={<span className="block">{t('products.page.hero.title')}</span>}
        subtitle={t('products.page.hero.subtitle')}
        buttonText={t('blog.hero.cta.text')}
        onButtonClick={() => {
          if (typeof document === 'undefined') return;
          const contactSection = document.getElementById('kontakt') ?? document.getElementById('contact-form-section');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            void navigate('/contact#kontakt');
          }
        }}
        className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-white px-4 pt-[120px] pb-[80px]"
        contentClassName="max-w-[1024px]"
      />

      <div className="flex-grow px-4 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <SectionReveal>
              <SectionHeader
                badgeText={t('products.badge')}
                title={
                  <>
                    {t('products.title.line1')} <span className="font-playfair italic font-normal">{t('products.title.line2.italic')}</span>
                  </>
                }
                subtitle={t('products.subtitle')}
                className="mb-16"
              />
            </SectionReveal>

            <StaggerReveal className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Palette, key: 'products.category.creative' },
                { icon: GraduationCap, key: 'products.category.educational' },
                { icon: Briefcase, key: 'products.category.business' },
                { icon: Cpu, key: 'products.category.technology' }
              ].map((category) => (
                <StaggerItem key={category.key}>
                  <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-xl bg-gray-50 p-3 transition-colors group-hover:bg-black/5">
                        <category.icon className="h-8 w-8 text-gray-900" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">{t(category.key)}</h3>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>

            <SectionReveal delay={0.16}>
              <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12">
                <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                  <div className="text-left">
                    <h2 className="mb-4 text-2xl font-normal text-gray-900">
                      {t('products.card.title')}
                    </h2>
                    <p className="mb-6 leading-relaxed text-gray-600">
                      {t('products.card.text')}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      {t('products.coming.subtitle')}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                    <h3 className="mb-2 font-semibold text-gray-900">{t('products.notify.prompt')}</h3>
                    <p className="mb-4 text-sm text-gray-500">{t('products.newsletter.desc')}</p>

                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('products.newsletter.placeholder')}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting
                          ? t('products.newsletter.button.subscribing')
                          : t('products.notify.button')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
