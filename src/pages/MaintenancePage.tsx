import { useSettings } from '@/hooks/useSettings';
import { Construction } from 'lucide-react';

const MaintenancePage = () => {
    const { maintenance } = useSettings();
    const title = maintenance?.message || '';
    const description = maintenance?.description || '';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
            <div className="mb-8 p-6 bg-gray-50 rounded-full">
                <Construction className="w-16 h-16 text-black" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-inter tracking-tight">
                {title}
            </h1>

            <p className="text-lg text-gray-600 max-w-md mx-auto mb-8 font-inter">
                {description}
            </p>

            <div className="text-sm text-gray-400 font-inter">
                &copy; {new Date().getFullYear()} VezVision. All rights reserved.
            </div>
        </div>
    );
};

export default MaintenancePage;
