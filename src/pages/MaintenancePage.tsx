import { Helmet } from 'react-helmet-async';
import { Construction } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useLanguageContext } from '@/hooks/useLanguage';

const MaintenancePage = () => {
    const { maintenance } = useSettings();
    const { language, t } = useLanguageContext();
    const title = maintenance?.message?.trim() || t('maintenance.default_title');
    const description = maintenance?.description?.trim() || t('maintenance.default_description');

    return (
        <>
            <Helmet>
                <html lang={language} />
                <title>{title}</title>
                <meta name="robots" content="noindex,nofollow" />
                <meta name="description" content={description} />
            </Helmet>
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
                <div className="mb-8 p-6 bg-gray-50 rounded-full">
                    <Construction className="w-16 h-16 text-black" aria-hidden="true" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-sans tracking-tight">
                    {title}
                </h1>

                <p className="text-lg text-gray-600 max-w-md mx-auto mb-8 font-sans">
                    {description}
                </p>

                <div className="text-sm text-gray-400 font-sans">
                    &copy; {new Date().getFullYear()} VezVision. All rights reserved.
                </div>
            </div>
        </>
    );
};

export default MaintenancePage;
