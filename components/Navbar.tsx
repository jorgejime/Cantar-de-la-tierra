import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Globe, Sprout } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_config').select('value').eq('key', 'logo_url').single();
        if (data?.value) setLogoUrl(data.value);
      } catch { /* logo fallback */ }
      setLogoLoading(false);
    })();
  }, []);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/servicios', label: 'Servicios' },
    { to: '/galeria', label: 'Galería' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navClass = `fixed w-full z-50 transition-all duration-300 ${isScrolled
    ? 'bg-background-dark/95 backdrop-blur-md shadow-lg shadow-black/20 py-2'
    : 'bg-gradient-to-b from-black/50 to-transparent py-4'
    }`;

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 md:h-32 transition-all duration-300">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            {logoLoading ? (
              // Placeholder invisible mientras carga — misma altura para evitar salto de layout
              <div className="h-20 md:h-28 w-[240px]" />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt="Cantar de la Tierra - Santuario Termal"
                className="h-20 md:h-28 w-auto object-contain drop-shadow-lg"
                onError={() => setLogoUrl(null)}
                width="240"
                height="135"
              />
            ) : (
              // Fallback si no hay logo en la base de datos
              <div className="flex items-center gap-2">
                <Sprout className="text-primary-light w-8 h-8 md:w-9 md:h-9" />
                <span className="text-lg md:text-xl font-bold text-white tracking-wider font-display drop-shadow-md leading-tight">
                  CANTAR DE<br className="hidden sm:block" /> LA TIERRA
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm uppercase tracking-widest font-body font-medium transition-colors ${isActive(link.to)
                  ? 'text-sand-light'
                  : 'text-white/80 hover:text-sand-light'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-white/70 hover:text-sand-light transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              {language.toUpperCase()}
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLanguage} className="text-white/70 hover:text-sand-light text-sm font-medium">
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-sand-light focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background-dark/98 backdrop-blur-md absolute w-full border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(link.to)
                  ? 'text-sand-light bg-primary/10'
                  : 'text-white/80 hover:text-sand-light hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
