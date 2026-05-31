import { Star } from 'lucide-react';

interface SectionBadgeProps {
    text: string;
    icon?: React.ReactNode;
    className?: string;
}

const SectionBadge: React.FC<SectionBadgeProps> = ({ text, icon, className = '' }) => {
    return (
        <div
            className={`inline-flex items-center rounded-full bg-[#f5f5f5] overflow-hidden ${className}`}
            style={{
                boxShadow: `inset 0px 3px 1px 0px #ffffff, 
                    0px 1px 1px -1px rgba(0,0,0,0.1),
                    0px 2px 2px -1px rgba(0,0,0,0.09),
                    0px 4px 4px -2px rgba(0,0,0,0.09),
                    0px 7px 7px -2px rgba(0,0,0,0.09),
                    0px 14px 14px -3px rgba(0,0,0,0.08),
                    0px 30px 30px -3px rgba(0,0,0,0.05)`
            }}
        >
            <div className="flex items-center justify-center border border-[#f5f5f5] rounded-full px-[11px] py-[5px] min-w-[92px] h-[32px] gap-2">
                {icon ? (
                    <span className="text-black w-4 h-4 flex items-center justify-center">
                        {icon}
                    </span>
                ) : (
                    <Star className="w-3.5 h-3.5 text-black fill-black" />
                )}
                <span className="text-[11px] font-medium leading-[14px] tracking-normal text-black font-inter whitespace-nowrap">
                    {text}
                </span>
            </div>
        </div>
    );
};

export default SectionBadge;
