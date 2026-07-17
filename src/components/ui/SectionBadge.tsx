import { Star } from 'lucide-react';

interface SectionBadgeProps {
    text: string;
    icon?: React.ReactNode;
    className?: string;
}

function SectionBadge({ text, icon, className = '' }: SectionBadgeProps) { return (
    <div
        className={`inline-flex items-center rounded-[7px] border border-slate-200/80 bg-white/78 overflow-hidden backdrop-blur-md ${className}`}
        style={{
            boxShadow: `inset 0px 1px 0px 0px rgba(255,255,255,0.92),
                0px 1px 2px rgba(15,23,42,0.06),
                0px 6px 16px rgba(15,23,42,0.07)`
        }}
    >
        <div className="flex items-center justify-center rounded-[6px] px-[11px] py-[5px] min-w-[92px] h-[32px] gap-2">
            {icon ? (
                <span className="text-black w-4 h-4 flex items-center justify-center">
                    {icon}
                </span>
            ) : (
                <Star className="w-3.5 h-3.5 text-black fill-black" />
            )}
            <span className="text-[11px] font-medium leading-[14px] tracking-normal text-black font-sans whitespace-nowrap">
                {text}
            </span>
        </div>
    </div>
); };

export default SectionBadge;
