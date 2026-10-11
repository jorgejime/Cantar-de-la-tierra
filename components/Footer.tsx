import React from 'react';
import { Sprout, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig';

const ensureUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  return `https://${url}`;
};

const cleanPhone = (phone?: string) => (phone ? phone.replace(/\D/g, '') : '');

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { config, loading } = useSiteConfig();

  if (loading) return null; // O un skeleton simple

  return (
    <footer className="bg-background-dark text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              {config.logo_url ? (
                <img
                  src={config.logo_url}
                  alt="Cantar de la Tierra - Santuario Termal"
                  className="h-24 md:h-32 w-auto object-contain"
                  width="280"
                  height="158"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Sprout className="text-primary-light w-8 h-8" />
                  <span className="text-xl font-bold tracking-wider font-display text-sand-light">CANTAR DE LA TIERRA</span>
                </div>
              )}
            </Link>
            <p className="text-text-main-dark/60 text-sm leading-relaxed mb-6 font-body">
              Aguas termales naturales en el corazón de Colombia. Un espacio de sanación, bienestar y conexión con la naturaleza.
            </p>
            <div className="flex gap-4">
              {config.facebook_url && (
                <a href={ensureUrl(config.facebook_url)} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-main-dark/50 hover:text-primary-light transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.instagram_url && (
                <a href={ensureUrl(config.instagram_url)} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-main-dark/50 hover:text-primary-light transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {config.whatsapp_number && (
                <a href={`https://wa.me/${cleanPhone(config.whatsapp_number)}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-main-dark/50 hover:text-primary-light transition-all">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-sand font-bold uppercase tracking-wider mb-5 text-xs font-body">Navegación</h4>
            <ul className="space-y-3 text-sm text-text-main-dark/60 font-body">
              <li><Link to="/" className="hover:text-sand-light transition-colors">Inicio</Link></li>
              <li><Link to="/servicios" className="hover:text-sand-light transition-colors">Servicios y Precios</Link></li>
              <li><Link to="/galeria" className="hover:text-sand-light transition-colors">Galería</Link></li>
              <li><Link to="/contacto" className="hover:text-sand-light transition-colors">Cómo Llegar / Contacto</Link></li>
              <li><Link to="/backoffice/login" className="hover:text-primary-light transition-colors text-xs uppercase tracking-widest opacity-50">Admin</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sand font-bold uppercase tracking-wider mb-5 text-xs font-body">Contacto</h4>
            <ul className="space-y-3 text-sm text-text-main-dark/60 font-body">
              <li className="flex items-start gap-2">
                <span className="text-primary-light mt-0.5">📍</span>
                <span>{config.address || 'Corregimiento de Cordobita'}, {config.city || 'Ciénaga, Magdalena'}, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-light">📱</span>
                <a href={`https://wa.me/${cleanPhone(config.whatsapp_number)}`} className="hover:text-sand-light transition-colors">
                  {config.phone_display || `+${config.whatsapp_number}`}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-light">⏰</span>
                <span>Lun – Dom: 6:00 am – 5:00 pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-main-dark/40 font-body">
          <p>© {year} Cantar de la Tierra. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-sand-light transition-colors">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-sand-light transition-colors">Términos y Condiciones</Link>
            <Link to="/datos-personales" className="hover:text-sand-light transition-colors">Tratamiento de Datos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;