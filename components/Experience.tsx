import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Experience: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();

    return (
        <section id="experiencia" className="py-20 md:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.experience.tag}</span>
                        <h2 className="font-display text-4xl md:text-5xl text-stone-800 dark:text-stone-100 leading-tight">
                            {t.experience.title}
                        </h2>
                        <div className="w-16 h-px bg-primary/50"></div>
                        <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed text-lg">
                            {t.experience.desc}
                        </p>
                        <ul className="space-y-3 pt-4">
                            {t.experience.items.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                                    <span className="material-icons-outlined text-primary text-sm">spa</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-6">
                            <button onClick={onBook} className="bg-primary text-white px-8 py-3 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg inline-block">
                                {t.experience.cta}
                            </button>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 relative">
                        <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                            <img 
                                alt="Thermal Spa Pier" 
                                className="w-full h-full object-cover transform hover:scale-105 transition duration-700" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCksKEZXj8n6yMC04OrzceVYsNaYkeNJ2rKsuk9sA77U_utAUMpCy03qnkqXp7iPM94awgZRGyjQtuPg-OUvKy9ngO5nB9YypH6qedpaleMwBaJ9-WjUZIl1arx50L93dtvLJZeczDXbtbAN25O9frG9MZMgFdjtt_or-YcmhrRZTs1p9-kGSsjR79zjef52xvSad0SlO_q-SSpQKCUYLI1vMeqkOAAtJ-DCEhYEtg1-eWn4eQs2wF0jLJNtJLmIX4kqINBXDxQ1cpn" 
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl flex items-center justify-center p-4 z-10 hidden md:flex">
                            <div className="text-center">
                                <span className="block font-display text-3xl text-primary">40</span>
                                <span className="text-xs uppercase tracking-widest text-stone-500">{t.experience.min}<br/>{t.experience.loc}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;