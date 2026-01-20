import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Services: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();
    
    return (
        <section className="py-24 bg-surface-light dark:bg-surface-dark border-t border-stone-200 dark:border-stone-800">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-background-light dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 p-10 md:p-14 rounded-lg shadow-xl relative overflow-hidden">
                    <span className="material-icons-outlined absolute -top-10 -right-10 text-[10rem] text-primary opacity-5 rotate-12 pointer-events-none select-none">spa</span>
                    <div className="text-center mb-10">
                        <h2 className="font-display text-4xl text-stone-800 dark:text-stone-100">{t.services.title}</h2>
                        <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="space-y-6 text-stone-700 dark:text-stone-300">
                        {t.services.items.map((item, index) => (
                            <div key={index} className={`flex justify-between items-baseline ${index !== t.services.items.length - 1 ? 'border-b border-dashed border-stone-300 dark:border-stone-700' : ''} pb-2`}>
                                <span className="font-display text-lg">{item.name}</span>
                                <span className="font-bold text-primary">{item.price}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <button onClick={onBook} className="bg-stone-800 dark:bg-stone-700 text-white px-10 py-3 rounded text-xs uppercase tracking-widest hover:bg-stone-700 dark:hover:bg-stone-600 transition shadow-lg inline-block">
                            {t.services.cta}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;