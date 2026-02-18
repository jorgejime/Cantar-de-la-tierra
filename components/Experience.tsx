import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCksKEZXj8n6yMC04OrzceVYsNaYkeNJ2rKsuk9sA77U_utAUMpCy03qnkqXp7iPM94awgZRGyjQtuPg-OUvKy9ngO5nB9YypH6qedpaleMwBaJ9-WjUZIl1arx50L93dtvLJZeczDXbtbAN25O9frG9MZMgFdjtt_or-YcmhrRZTs1p9-kGSsjR79zjef52xvSad0SlO_q-SSpQKCUYLI1vMeqkOAAtJ-DCEhYEtg1-eWn4eQs2wF0jLJNtJLmIX4kqINBXDxQ1cpn";

const Experience: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();
    const [sectionImg, setSectionImg] = useState(FALLBACK_IMG);

    useEffect(() => {
        supabase.from('section_images').select('image_url').eq('section_key', 'experience_main').single()
            .then(({ data }) => { if (data?.image_url) setSectionImg(data.image_url); });
    }, []);

    return (
        <section id="experiencia" className="py-16 sm:py-20 md:py-32 overflow-hidden" aria-labelledby="experience-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-4 sm:space-y-6">
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.experience.tag}</span>
                        <h2 id="experience-heading" className="font-display text-3xl sm:text-4xl md:text-5xl text-stone-800 dark:text-stone-100 leading-tight">
                            {t.experience.title}
                        </h2>
                        <div className="w-16 h-px bg-sand"></div>
                        <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed text-base sm:text-lg">
                            {t.experience.desc}
                        </p>
                        <ul className="space-y-3 pt-2 sm:pt-4">
                            {t.experience.items.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-stone-700 dark:text-stone-300 text-sm sm:text-base">
                                    <span className="material-icons-outlined text-primary text-sm" aria-hidden="true">spa</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4 sm:pt-6">
                            <button onClick={onBook} className="bg-primary text-white px-6 sm:px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg inline-block w-full sm:w-auto text-center">
                                {t.experience.cta}
                            </button>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 relative">
                        <div className="aspect-[4/3] sm:aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                            <img
                                alt="Muelle del spa termal de Cantar de la Tierra"
                                className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                                src={sectionImg}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-24 h-24 sm:w-32 sm:h-32 bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl flex items-center justify-center p-3 sm:p-4 z-10 hidden sm:flex">
                            <div className="text-center">
                                <span className="block font-display text-2xl sm:text-3xl text-accent">40</span>
                                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-stone-500">{t.experience.min}<br />{t.experience.loc}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;