import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface ServiceItem {
    id: string;
    title: string;
    price: number;
}

const formatCOP = (price: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'decimal' }).format(price) + ' COP';
};

const Services: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();
    const [dbServices, setDbServices] = useState<ServiceItem[] | null>(null);

    useEffect(() => {
        supabase.from('services').select('id, title, price').order('created_at')
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setDbServices(data as ServiceItem[]);
                }
            });
    }, []);

    const serviceItems = dbServices
        ? dbServices.map(s => ({ name: s.title, price: formatCOP(s.price) }))
        : t.services.items;

    return (
        <section className="py-16 sm:py-24 bg-surface-light dark:bg-surface-dark border-t border-stone-200 dark:border-stone-800" aria-labelledby="services-heading">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="bg-background-light dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-10 md:p-14 rounded-lg shadow-xl relative overflow-hidden">
                    <span className="material-icons-outlined absolute -top-10 -right-10 text-[8rem] sm:text-[10rem] text-primary opacity-5 rotate-12 pointer-events-none select-none" aria-hidden="true">spa</span>
                    <div className="text-center mb-8 sm:mb-10">
                        <h2 id="services-heading" className="font-display text-3xl sm:text-4xl text-stone-800 dark:text-stone-100">{t.services.title}</h2>
                        <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="space-y-5 sm:space-y-6 text-stone-700 dark:text-stone-300">
                        {serviceItems.map((item, index) => (
                            <div key={index} className={`flex justify-between items-baseline gap-4 ${index !== serviceItems.length - 1 ? 'border-b border-dashed border-stone-300 dark:border-stone-700' : ''} pb-2`}>
                                <span className="font-display text-base sm:text-lg">{item.name}</span>
                                <span className="font-bold text-primary text-sm sm:text-base whitespace-nowrap">{item.price}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 sm:mt-12 text-center">
                        <button onClick={onBook} className="bg-accent dark:bg-accent text-white px-8 sm:px-10 py-3 rounded text-xs uppercase tracking-widest hover:bg-accent-dark transition shadow-lg inline-block w-full sm:w-auto">
                            {t.services.cta}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;