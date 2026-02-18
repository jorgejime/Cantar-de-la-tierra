import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface NavbarProps {
    onNavigate: (section: string) => void;
    onBook: () => void;
    isBookingMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onBook, isBookingMode }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t, language, setLanguage } = useLanguage();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [siteTitle, setSiteTitle] = useState('Cantar de la Tierra');

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase.from('site_config').select('*').in('key', ['logo_url', 'site_title']);
            if (data) {
                data.forEach((item: any) => {
                    if (item.key === 'logo_url') setLogoUrl(item.value);
                    if (item.key === 'site_title') setSiteTitle(item.value);
                });
            }
        };
        fetchConfig();

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLinkClick = (e: React.MouseEvent, section: string) => {
        e.preventDefault();
        onNavigate(section);
        setMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <nav
            className={`fixed w-full z-40 top-0 transition-all duration-300 ${scrolled || isBookingMode
                ? 'bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md shadow-sm border-b border-stone-200 dark:border-stone-800 py-2 sm:py-3'
                : 'bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm border-b border-transparent py-3 sm:py-4'
                }`}
            role="navigation"
            aria-label="Navegación principal"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                    onClick={(e) => handleLinkClick(e, '')}
                    role="link"
                    aria-label="Ir al inicio"
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt={siteTitle} className="h-10 sm:h-[60px] w-auto object-contain" loading="lazy" />
                    ) : (
                        <span className="material-icons-outlined text-primary text-2xl sm:text-3xl" aria-hidden="true">spa</span>
                    )}
                    <span className="font-display text-lg sm:text-2xl font-medium tracking-wide text-stone-800 dark:text-stone-100 truncate max-w-[180px] sm:max-w-none">
                        {siteTitle}
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    <a href="#" onClick={(e) => handleLinkClick(e, '')} className="text-xs lg:text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.home}</a>
                    <a href="#experiencia" onClick={(e) => handleLinkClick(e, 'experiencia')} className="text-xs lg:text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.services}</a>
                    <a href="#galeria" onClick={(e) => handleLinkClick(e, 'galeria')} className="text-xs lg:text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.gallery}</a>
                    <a href="#contacto" onClick={(e) => handleLinkClick(e, 'contacto')} className="text-xs lg:text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.contact}</a>

                    <button
                        onClick={toggleLanguage}
                        className="text-xs uppercase tracking-widest hover:text-primary transition-colors border border-stone-300 dark:border-stone-700 rounded px-2 py-1"
                        aria-label={`Cambiar idioma a ${language === 'es' ? 'inglés' : 'español'}`}
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>

                    <button
                        onClick={onBook}
                        className="bg-primary text-white px-5 lg:px-6 py-2 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-md whitespace-nowrap"
                    >
                        {t.nav.book}
                    </button>
                </div>

                {/* Mobile Actions */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={toggleLanguage}
                        className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border border-stone-300 dark:border-stone-700 rounded px-2 py-1.5 text-stone-800 dark:text-stone-100"
                        aria-label={`Cambiar idioma a ${language === 'es' ? 'inglés' : 'español'}`}
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>

                    <button
                        className="text-stone-800 dark:text-stone-100 z-50 relative p-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className="material-icons-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay — Full screen */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 top-0 z-40 bg-background-light dark:bg-background-dark flex flex-col animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú de navegación"
                >
                    {/* Close button area */}
                    <div className="flex justify-end p-4 pt-5">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-stone-800 dark:text-stone-100"
                            aria-label="Cerrar menú"
                        >
                            <span className="material-icons-outlined text-3xl">close</span>
                        </button>
                    </div>

                    {/* Links */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
                        <a href="#" className="text-2xl font-display uppercase tracking-widest hover:text-primary transition-colors text-stone-800 dark:text-stone-100" onClick={(e) => handleLinkClick(e, '')}>{t.nav.home}</a>
                        <a href="#experiencia" className="text-2xl font-display uppercase tracking-widest hover:text-primary transition-colors text-stone-800 dark:text-stone-100" onClick={(e) => handleLinkClick(e, 'experiencia')}>{t.nav.services}</a>
                        <a href="#galeria" className="text-2xl font-display uppercase tracking-widest hover:text-primary transition-colors text-stone-800 dark:text-stone-100" onClick={(e) => handleLinkClick(e, 'galeria')}>{t.nav.gallery}</a>
                        <a href="#contacto" className="text-2xl font-display uppercase tracking-widest hover:text-primary transition-colors text-stone-800 dark:text-stone-100" onClick={(e) => handleLinkClick(e, 'contacto')}>{t.nav.contact}</a>
                        <button
                            className="bg-primary text-white px-10 py-4 rounded text-sm uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg mt-4 w-full max-w-xs"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onBook();
                            }}
                        >
                            {t.nav.book}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;