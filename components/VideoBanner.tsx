import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const FALLBACK_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuA-ozn6fCg1rROF_uqMpB36rreHVy-R9DhaXvOGxe16lcalZgBOdGwmIREzHw7pHnJZbBDc3k_pglpov-1zGuHaHVu0sbxAvFddDtgfSdlNWolOi4mE4Xt4lyQDisGMJvV9pbqYGnuWktAzQUOOVPaMR9BxOHWqCA54qg9PuCDBxIx4BBYsitPTjckJU_3cVdX98KgZU3-AK5EWqkAfTtRT_AfAMvuVeenwNHzp662mTRWxI3f0ZEbOkDr-_WHsRufSViOZ2Za6bjCs";

/** Extract YouTube video ID from various URL formats */
const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

/** Check if URL is a direct video file */
const isDirectVideo = (url: string): boolean => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
};

const VideoBanner: React.FC = () => {
    const { t } = useLanguage();
    const [bgImage, setBgImage] = useState(FALLBACK_IMG);
    const [videoUrl, setVideoUrl] = useState('');
    const [showPlayer, setShowPlayer] = useState(false);

    useEffect(() => {
        supabase.from('section_images').select('image_url, video_url').eq('section_key', 'video_bg').single()
            .then(({ data }) => {
                if (data?.image_url) setBgImage(data.image_url);
                if (data?.video_url) setVideoUrl(data.video_url);
            });
    }, []);

    const handlePlay = useCallback(() => {
        if (!videoUrl) return;
        setShowPlayer(true);
    }, [videoUrl]);

    const handleClose = useCallback(() => {
        setShowPlayer(false);
    }, []);

    // Close on Escape key
    useEffect(() => {
        if (!showPlayer) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPlayer(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showPlayer]);

    const ytId = getYouTubeId(videoUrl);
    const hasVideo = !!(ytId || isDirectVideo(videoUrl));

    return (
        <>
            <section className="relative py-20 sm:py-32 flex items-center justify-center bg-stone-900 overflow-hidden" aria-labelledby="video-heading">
                <img
                    alt="Atmósfera de bosque tropical — Cantar de la Tierra"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                    src={bgImage}
                    loading="lazy"
                    decoding="async"
                />
                <div className="relative z-10 text-center max-w-3xl px-4 sm:px-6">
                    <h2 id="video-heading" className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6">{t.video.title}</h2>
                    <p className="text-stone-300 mb-8 sm:mb-10 font-light text-base sm:text-lg">
                        {t.video.desc}
                    </p>
                    {hasVideo ? (
                        <button
                            onClick={handlePlay}
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group hover:bg-white/20 transition-all border border-white/30 mx-auto hover:scale-105 active:scale-95"
                            aria-label="Reproducir video"
                        >
                            <span className="material-icons-outlined text-white text-3xl sm:text-4xl ml-1 group-hover:scale-110 transition-transform" aria-hidden="true">play_arrow</span>
                        </button>
                    ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mx-auto opacity-60">
                            <span className="material-icons-outlined text-white/50 text-3xl sm:text-4xl ml-1" aria-hidden="true">play_arrow</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Video Player Modal ──────────── */}
            {showPlayer && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Reproducir video"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
                        aria-label="Cerrar video"
                    >
                        <span className="material-icons-outlined text-2xl">close</span>
                    </button>

                    {/* Player */}
                    <div
                        className="relative z-10 w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
                        onClick={e => e.stopPropagation()}
                    >
                        {ytId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                                title="Video — Cantar de la Tierra"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        ) : isDirectVideo(videoUrl) ? (
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            >
                                Tu navegador no soporta la reproducción de video.
                            </video>
                        ) : null}
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoBanner;