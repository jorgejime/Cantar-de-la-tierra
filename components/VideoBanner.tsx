import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const VideoBanner: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="relative py-32 flex items-center justify-center bg-stone-900 overflow-hidden">
            <img 
                alt="Misty forest atmosphere" 
                className="absolute inset-0 w-full h-full object-cover opacity-40" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-ozn6fCg1rROF_uqMpB36rreHVy-R9DhaXvOGxe16lcalZgBOdGwmIREzHw7pHnJZbBDc3k_pglpov-1zGuHaHVu0sbxAvFddDtgfSdlNWolOi4mE4Xt4lyQDisGMJvV9pbqYGnuWktAzQUOOVPaMR9BxOHWqCA54qg9PuCDBxIx4BBYsitPTjckJU_3cVdX98KgZU3-AK5EWqkAfTtRT_AfAMvuVeenwNHzp662mTRWxI3f0ZEbOkDr-_WHsRufSViOZ2Za6bjCs" 
            />
            <div className="relative z-10 text-center max-w-3xl px-6">
                <h2 className="font-display text-4xl md:text-5xl text-white mb-6">{t.video.title}</h2>
                <p className="text-stone-300 mb-10 font-light text-lg">
                    {t.video.desc}
                </p>
                <button className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group hover:bg-white/20 transition-all border border-white/30">
                    <span className="material-icons-outlined text-white text-4xl ml-1 group-hover:scale-110 transition-transform">play_arrow</span>
                </button>
            </div>
        </section>
    );
};

export default VideoBanner;