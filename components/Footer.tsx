import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_MAP = "https://lh3.googleusercontent.com/aida-public/AB6AXuDxnHMKJz6VXKjOMnaF_RWKb1n1vG34_E_PCEhml-GztJ3_Ovjklr52MQMpoSvuAABjZlkRtT2YtFVs-5yMB3i5p5XoGHFW_boSrphHeCTTd-LZACEw4yQvLeqgGX32iSpkMqNBpn14ZHMYVJkBpwl-qsU9pZJLb90_KYSxE1E7qYvAJmR-HVNc2Dv3EbcSpYWjqvjr59e2QZY4CTA42AdYM0TGWQik9zORNuAOEFuKF07oOrnD8nB8tF-pChCtzexG-86CxnJlhKji";

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const [mapImg, setMapImg] = useState(FALLBACK_MAP);

    useEffect(() => {
        supabase.from('section_images').select('image_url').eq('section_key', 'footer_map').single()
            .then(({ data }) => { if (data?.image_url) setMapImg(data.image_url); });
    }, []);

    return (
        <footer id="contacto" className="bg-background-light dark:bg-background-dark pt-16 sm:pt-20" role="contentinfo">
            <div className="text-center mb-8 sm:mb-12 px-4">
                <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.footer.locationTag}</span>
                <h2 className="font-display text-3xl sm:text-4xl text-stone-800 dark:text-stone-100 mt-2">{t.footer.howTo}</h2>
            </div>

            <div className="w-full h-52 sm:h-80 grayscale opacity-80 hover:grayscale-0 transition-all duration-500 relative bg-stone-200 dark:bg-stone-800">
                <img
                    alt="Mapa de ubicación de Cantar de la Tierra — Ciénaga, Magdalena, Colombia"
                    className="w-full h-full object-cover"
                    src={mapImg}
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded shadow-lg flex items-center gap-2 sm:gap-3">
                        <span className="material-icons-outlined text-accent text-2xl sm:text-3xl" aria-hidden="true">place</span>
                        <div className="text-left">
                            <p className="font-bold text-stone-800 dark:text-stone-100 text-xs sm:text-sm">Ciénaga, Magdalena</p>
                            <p className="text-[10px] sm:text-xs text-stone-500">{t.footer.country}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 border-t border-stone-200 dark:border-stone-800 mt-8 sm:mt-10">
                <div className="text-center md:text-left">
                    <p className="font-display text-base sm:text-lg text-stone-800 dark:text-stone-200 font-bold mb-1">Cantar de la Tierra</p>
                    <p className="text-stone-500 text-xs sm:text-sm">{t.footer.rights}</p>
                </div>
                <nav className="flex gap-6" aria-label="Redes sociales">
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors p-2" aria-label="Facebook">
                        <span className="material-icons-outlined" aria-hidden="true">facebook</span>
                    </a>
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors p-2" aria-label="Instagram">
                        <span className="material-icons-outlined" aria-hidden="true">camera_alt</span>
                    </a>
                    <a href="#" className="text-stone-500 hover:text-primary transition-colors p-2" aria-label="Email">
                        <span className="material-icons-outlined" aria-hidden="true">alternate_email</span>
                    </a>
                </nav>
                <div className="text-stone-500 text-xs text-center md:text-right">
                    <p>{t.footer.created}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;