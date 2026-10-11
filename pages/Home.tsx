import React, { useEffect, useState } from 'react';
import QuickBookingBar from '../components/QuickBookingBar';
import SEOHead from '../components/SEOHead';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, ArrowRight, MapPin, Quote, Sparkles } from 'lucide-react';
import { supabase, Service } from '../lib/supabase';

const DEFAULT_IMAGES = {
  home_hero: 'https://i.ibb.co/m5XN33K2/530225970-1143822651132231-2243828081760603637-n.jpg',
  home_circuit: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop',
  home_spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop',
  home_dining: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  home_location: 'https://i.ibb.co/7N6JT4gR/455012325-3828310047406344-4145253964796333914-n.jpg'
};

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<Record<string, string>>(DEFAULT_IMAGES);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('site_images').select('key, url').in('key', Object.keys(DEFAULT_IMAGES));
      if (data) {
        const fetchedImages: Record<string, string> = {};
        data.forEach(img => {
          fetchedImages[img.key] = img.url;
        });
        setImages(prev => ({ ...prev, ...fetchedImages }));
      }
    };
    fetchImages();

    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').eq('is_active', true);
      if (data) setServices(data);
    };
    fetchServices();

    const channel = supabase.channel('home-services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchServices)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getPrice = (name: string, type: 'adult' | 'child' = 'adult') => {
    const s = services.find(s => s.name_es.toLowerCase() === name.toLowerCase());
    if (!s) return '...';
    const price = type === 'adult' ? s.price_adult : s.price_child;
    return `$ ${Number(price).toLocaleString('es-CO')}`;
  };

  const pricingItems = [
    { label: t.pricing.items.adultEntrance, price: getPrice('Entrada General', 'adult') },
    { label: t.pricing.items.childEntrance, price: getPrice('Entrada General', 'child') },
    { label: t.pricing.items.adultThermal, price: getPrice('Circuito Termal', 'adult') },
    { label: t.pricing.items.childThermal, price: getPrice('Circuito Termal', 'child') },
    { label: t.pricing.items.mudTherapy, price: getPrice('Terapia de Barro', 'adult') },
    { label: t.pricing.items.mudMask, price: getPrice('Máscara de Barro', 'adult') },
  ];

  return (
    <>
      <SEOHead
        title={t.hero.title + ' ' + t.hero.titleAccent}
        description={t.hero.description}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative h-screen min-h-[700px] flex flex-col text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={images.home_hero}
            alt="Aguas termales Cantar de la Tierra"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/30 via-background-dark/50 to-background-dark" />
        </div>

        {/* Texto centrado */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
          <span className="uppercase tracking-[0.3em] text-sm md:text-base mb-4 block text-sand-light font-body font-bold">
            {t.hero.subtitle}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight font-display">
            {t.hero.title} <br />
            <span className="italic text-sand">{t.hero.titleAccent}</span>
          </h1>
          <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto text-text-main-dark/80 font-body">
            {t.hero.description}
          </p>
        </div>

        {/* Barra de reserva rápida */}
        <div className="relative z-10 w-full pb-10 px-4">
          <QuickBookingBar />
        </div>
      </header>

      {/* ── Intro ─────────────────────────────────────────── */}
      <section className="pt-20 pb-20 px-4 md:px-8 bg-background-light dark:bg-surface-dark">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-accent dark:text-sand tracking-[0.2em] uppercase text-sm font-semibold mb-4 block font-body">
            {t.intro.philosophy}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-8 text-text-main-light dark:text-text-main-dark font-display">
            {t.intro.title}
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary via-sand to-accent mx-auto mb-10 rounded-full" />
          <p className="text-xl md:text-2xl text-text-main-light/70 dark:text-text-main-dark/70 leading-relaxed font-light font-body">
            {t.intro.description}
          </p>
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-surface-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group cursor-pointer">
              <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-lg mb-6">
                <img
                  src={images.home_circuit}
                  alt="Circuito Termal"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-6 left-6">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block font-body">
                    {t.common.signature}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl text-text-main-light dark:text-text-main-dark mb-2 group-hover:text-accent dark:group-hover:text-sand transition-colors font-display">
                {t.features.circuitTitle}
              </h3>
              <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-lg font-body">
                {t.features.circuitDesc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="group cursor-pointer md:mt-16">
              <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-lg mb-6">
                <img
                  src={images.home_spa}
                  alt="Spa y Masajes"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-3xl text-text-main-light dark:text-text-main-dark mb-2 group-hover:text-accent dark:group-hover:text-sand transition-colors font-display">
                {t.features.spaTitle}
              </h3>
              <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-lg font-body">
                {t.features.spaDesc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="group cursor-pointer">
              <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-lg mb-6">
                <img
                  src={images.home_dining}
                  alt="Gastronomía Orgánica"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-3xl text-text-main-light dark:text-text-main-dark mb-2 group-hover:text-accent dark:group-hover:text-sand transition-colors font-display">
                {t.features.diningTitle}
              </h3>
              <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-lg font-body">
                {t.features.diningDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section className="py-24 bg-background-light dark:bg-surface-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 dark:bg-primary/10 rounded-l-full transform translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-16">
            <span className="text-accent dark:text-sand uppercase tracking-widest font-bold text-sm block mb-4 font-body">
              {t.pricing.subtitle}
            </span>
            <h2 className="text-5xl md:text-6xl text-text-main-light dark:text-text-main-dark leading-none font-display mb-6">
              {t.pricing.title}
            </h2>
            <p className="text-xl text-text-main-light/60 dark:text-text-main-dark/60 max-w-2xl mx-auto font-light font-body">
              {t.pricing.description}
            </p>
          </div>

          <div className="bg-surface-light dark:bg-background-dark rounded-2xl shadow-xl overflow-hidden border border-sand/10 dark:border-primary/10">
            <div className="p-8 md:p-12">
              <ul className="space-y-6">
                {pricingItems.map((item, i) => (
                  <li key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b border-sand/10 dark:border-primary/10 pb-4 last:border-0 last:pb-0 group">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-lg md:text-xl font-medium text-text-main-light dark:text-text-main-dark font-body">{item.label}</span>
                    </div>
                    <span className="text-xl md:text-2xl font-display font-bold text-accent dark:text-sand mt-2 md:mt-0">
                      {t.pricing.currency} {item.price}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-sand/10 dark:border-primary/10 text-center">
                <p className="text-sm text-text-main-light/50 dark:text-text-main-dark/50 italic font-body">{t.pricing.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────── */}
      <section className="h-[600px] w-full relative">
        <img
          src={images.home_location}
          alt="Montañas de Colombia"
          className="w-full h-full object-cover filter brightness-75 grayscale-[20%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary-dark/30 flex items-center justify-center">
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md p-10 md:p-14 max-w-lg text-center rounded-2xl shadow-2xl mx-4">
            <MapPin className="text-accent dark:text-sand mb-4 w-12 h-12 mx-auto" />
            <h3 className="text-3xl font-bold mb-2 text-text-main-light dark:text-text-main-dark font-display">
              {t.location.visit}
            </h3>
            <p className="text-text-main-light/60 dark:text-text-main-dark/60 mb-8 text-lg font-body">
              {t.location.desc}
            </p>
            <div className="space-y-2 text-text-main-light dark:text-text-main-dark text-lg mb-8 font-medium font-body">
              <p>{t.location.address}</p>
              <p>{t.location.city}</p>
            </div>
            <a
              href="https://www.google.com/maps/dir//Cantar+de+la+Tierra,+Ciénaga,+Magdalena/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-xl transition-colors w-full md:w-auto font-body tracking-wide"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 bg-background-light dark:bg-surface-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Quote className="text-primary/20 dark:text-sand/20 w-16 h-16 mx-auto mb-8" />
          <blockquote className="text-3xl md:text-4xl italic text-text-main-light dark:text-text-main-dark font-light leading-snug mb-8 font-display">
            {t.testimonial.text}
          </blockquote>
          <cite className="not-italic flex flex-col items-center">
            <span className="font-bold text-lg text-accent dark:text-sand uppercase tracking-wider font-body">
              {t.testimonial.author}
            </span>
            <span className="text-text-main-light/50 dark:text-text-main-dark/50 text-sm mt-1 font-body">
              {t.testimonial.location}
            </span>
          </cite>
        </div>
      </section>
    </>
  );
};

export default Home;