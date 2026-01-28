import React from 'react';

interface SectionHeaderProps {
    phase?: string;
    title: string;
    subtitle?: string;
}

const SectionHeader = ({ phase, title, subtitle }: SectionHeaderProps) => {
    return (
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-8 md:pb-10">
            <div className="space-y-2">
                {phase && <div className="font-serif text-amber-600 italic font-black text-sm md:text-lg">{phase}</div>}
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl italic font-black text-slate-900 leading-tight tracking-tighter">
                    {title}
                </h2>
                {subtitle && <p className="text-slate-400 font-bold tracking-[0.1em] text-xs uppercase">{subtitle}</p>}
            </div>
        </header>
    );
};

export default SectionHeader;
