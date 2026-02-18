import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuChdewXb7xi3-MfcHc96be9RDHKvJNvCQEUgdGSiEjPkxei5Kk072xOQI_5gMB7v1kjW1AAa5-VUSKqMRNT-RX7okKyoqYPCXEMuT8CktoDLVXDV0rGwVTeYuq7Z9NrEkE07_W06inL3tg0Gk3fuyHW4dyQqCsVLJQHacHztkTDQOSdbu-ins8JgH5Jv1wzzIjfnEWaJYufnSFx1UVTaAlYJOvbS7orUgAGGhpttm07mBMR1joCY95BAFvApQDCIg6a_WtuVfQ-avgf";

const Hero: React.FC<{ onBook: () => void }> = ({ onBook }) => {
    const { t } = useLanguage();
    const [bgImage, setBgImage] = useState(FALLBACK_IMG);

    useEffect(() => {
        supabase.from('section_images').select('image_url').eq('section_key', 'hero_bg').single()
            .then(({ data }) => { if (data?.image_url) setBgImage(data.image_url); });
    }, []);

    return (
        <header className="relative h-[100svh] min-h-[500px] flex items-center justify-center overflow-hidden" role="banner">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Santuario termal Cantar de la Tierra — río termal entre la selva"
                    className="w-full h-full object-cover"
                    src={bgImage}
                    loading="eager"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
            </div>

            <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
                <div className="mb-4 sm:mb-6 fade-in-up">
                    <span className="material-icons-outlined text-white text-4xl sm:text-5xl opacity-90" aria-hidden="true">wb_twilight</span>
                </div>
                <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-4 sm:mb-6 leading-tight fade-in-up delay-200">
                    {t.hero.title} <br /><span className="italic text-sand-light font-light">{t.hero.subtitle}</span>
                </h1>
                <p className="text-stone-200 text-base sm:text-lg md:text-xl font-light tracking-wide mb-8 sm:mb-10 max-w-2xl mx-auto fade-in-up delay-400">
                    {t.hero.desc}
                </p>
                <div className="fade-in-up delay-400">
                    <button
                        onClick={onBook}
                        className="inline-block border border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 py-3 rounded uppercase tracking-widest text-xs transition duration-300"
                    >
                        {t.hero.cta}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <span className="material-icons-outlined text-white/70 text-2xl sm:text-3xl" aria-hidden="true">keyboard_arrow_down</span>
            </div>
        </header>
    );
};

export default Hero;