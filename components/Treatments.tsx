import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Treatments: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();

    return (
        <section className="py-20 md:py-32 bg-surface-light dark:bg-surface-dark">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="aspect-[16/10] rounded-lg overflow-hidden shadow-2xl">
                            <img 
                                alt="Mud therapy treatment" 
                                className="w-full h-full object-cover transform hover:scale-105 transition duration-700" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSg8jV66pEmJ9r6NuDImHSXM3k9OXw0mWqjuIWZoXTSIPDZl5H0I0aDmmc0pJ9OByjexgCN4Q-P63ECGdnaWd1C62MjLi99pyGFLwEOPUx94gPPBPM89C330gj4kQqGSJDJa999kxwiihnVYZ4uJz8O4nyzdmlAr4NJ0hWYIaah7pXQwPINkBER56DHMVDgcB0YIP209duke-oJA87i_2NvURatBwlUpsaNuOtt-iXKEfuhzXrZAgqj_wRIls69lqElRpduGxLbG7j" 
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.treatments.tag}</span>
                        <h2 className="font-display text-4xl md:text-5xl text-stone-800 dark:text-stone-100 leading-tight whitespace-pre-line">
                            {t.treatments.title}
                        </h2>
                        <div className="w-16 h-px bg-primary/50"></div>
                        <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed text-lg">
                            {t.treatments.desc}
                        </p>
                        <div className="pt-6">
                            <button onClick={onBook} className="bg-primary text-white px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg inline-block">
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