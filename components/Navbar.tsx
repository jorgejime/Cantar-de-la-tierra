import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
    onNavigate: (section: string) => void;
    onBook: () => void;
    isBookingMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onBook, isBookingMode }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = (e: React.MouseEvent, section: string) => {
        e.preventDefault();
        onNavigate(section);
        setMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <nav className={`fixed w-full z-40 top-0 transition-all duration-300 ${
            scrolled || isBookingMode
                ? 'bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md shadow-sm border-b border-stone-200 dark:border-stone-800 py-3' 
                : 'bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm border-b border-transparent py-4'
        }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={(e) => handleLinkClick(e, '')}
                >
                    <span className="material-icons-outlined text-primary text-3xl">spa</span>
                    <span className="font-display text-2xl font-medium tracking-wide text-stone-800 dark:text-stone-100">
                        Cantar de la Tierra
                    </span>
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    <a href="#" onClick={(e) => handleLinkClick(e, '')} className="text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.home}</a>
                    <a href="#experiencia" onClick={(e) => handleLinkClick(e, 'experiencia')} className="text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.services}</a>
                    <a href="#galeria" onClick={(e) => handleLinkClick(e, 'galeria')} className="text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.gallery}</a>
                    <a href="#contacto" onClick={(e) => handleLinkClick(e, 'contacto')} className="text-sm uppercase tracking-widest hover:text-primary transition-colors">{t.nav.contact}</a>
                    
                    {/* Language Switcher Desktop */}
                    <button 
                        onClick={toggleLanguage}
                        className="text-sm uppercase tracking-widest hover:text-primary transition-colors border border-stone-300 dark:border-stone-700 rounded px-2 py-1"
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>

                    <button 
                        onClick={onBook}
                        className="bg-primary text-white px-6 py-2 rounded text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-md whitespace-nowrap"
                    >
                        {t.nav.book}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                     {/* Language Switcher Mobile */}
                     <button 
                        onClick={toggleLanguage}
                        className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-stone-800 dark:text-stone-100"
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>

                    <button 
                        className="text-stone-800 dark:text-stone-100 z-50 relative"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-icons-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-background-light dark:bg-background-dark border-t border-stone-200 dark:border-stone-800 shadow-xl py-6 px-6 flex flex-col gap-4 animate-fadeIn">
                    <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors" onClick={(e) => handleLinkClick(e, '')}>{t.nav.home}</a>
                    <a href="#experiencia" className="text-sm uppercase tracking-widest hover:text-primary transition-colors" onClick={(e) => handleLinkClick(e, 'experiencia')}>{t.nav.services}</a>
                    <a href="#galeria" className="text-sm uppercase tracking-widest hover:text-primary transition-colors" onClick={(e) => handleLinkClick(e, 'galeria')}>{t.nav.gallery}</a>
                    <a href="#contacto" className="text-sm uppercase tracking-widest hover:text-primary transition-colors" onClick={(e) => handleLinkClick(e, 'contacto')}>{t.nav.contact}</a>
                    <button 
                        className="bg-primary text-white px-6 py-3 rounded text-center text-xs uppercase tracking-widest hover:bg-opacity-90 transition shadow-md" 
                        onClick={() => {
                            setMobileMenuOpen(false);
                            onBook();
                        }}
                    >
                        {t.nav.book}
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;