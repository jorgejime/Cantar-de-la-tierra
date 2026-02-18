import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCSg8jV66pEmJ9r6NuDImHSXM3k9OXw0mWqjuIWZoXTSIPDZl5H0I0aDmmc0pJ9OByjexgCN4Q-P63ECGdnaWd1C62MjLi99pyGFLwEOPUx94gPPBPM89C330gj4kQqGSJDJa999kxwiihnVYZ4uJz8O4nyzdmlAr4NJ0hWYIaah7pXQwPINkBER56DHMVDgcB0YIP209duke-oJA87i_2NvURatBwlUpsaNuOtt-iXKEfuhzXrZAgqj_wRIls69lqElRpduGxLbG7j";

const Treatments: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();
    const [sectionImg, setSectionImg] = useState(FALLBACK_IMG);

    useEffect(() => {
        supabase.from('section_images').select('image_url').eq('section_key', 'treatments_main').single()
            .then(({ data }) => { if (data?.image_url) setSectionImg(data.image_url); });
    }, []);

    return (
        <section className="py-16 sm:py-20 md:py-32 bg-surface-light dark:bg-surface-dark" aria-labelledby="treatments-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                    <div className="relative">
                        <div className="aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden shadow-2xl">
                            <img
                                alt="Tratamiento de lodoterapia y mascarillas faciales en Cantar de la Tierra"
                                className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                                src={sectionImg}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.treatments.tag}</span>
                        <h2 id="treatments-heading" className="font-display text-3xl sm:text-4xl md:text-5xl text-stone-800 dark:text-stone-100 leading-tight whitespace-pre-line">
                            {t.treatments.title}
                        </h2>
                        <div className="w-16 h-px bg-sand"></div>
                        <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed text-base sm:text-lg">
                            {t.treatments.desc}
                        </p>
                        <div className="pt-4 sm:pt-6">
                            <button onClick={onBook} className="bg-primary text-white px-6 sm:px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg inline-block w-full sm:w-auto text-center">
                                {t.treatments.cta}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Treatments;