import React, { useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import { MapPin, Phone, Clock, MessageCircle, Navigation } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';

const cleanPhone = (phone?: string) => (phone ? phone.replace(/\D/g, '') : '');

const ContactoPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { config, loading } = useSiteConfig();

    const cardCls = "bg-surface-light dark:bg-surface-dark border border-sand/10 dark:border-primary/10 rounded-2xl p-6 flex gap-4";
    const iconWrapCls = "bg-primary/10 p-3 rounded-xl flex-shrink-0";

    if (loading) return null;

    return (
        <>
            <SEOHead
                title="Cómo Llegar y Contacto — Cantar de la Tierra"
                description={`Encuéntranos en ${config.city || 'Neira, Caldas'}. Aguas termales naturales. Contacto por WhatsApp.`}
            />

            {/* Hero */}
            <header className="relative h-[45vh] min-h-[350px] flex items-end justify-center pb-14">
                <div className="absolute inset-0">
                    <img
                        src="https://i.ibb.co/7N6JT4gR/455012325-3828310047406344-4145253964796333914-n.jpg"
                        alt="Paisaje Cantar de la Tierra"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-sand-light uppercase tracking-[0.3em] text-sm font-bold block mb-3 font-body">Visítanos</span>
                    <h1 className="text-5xl md:text-6xl font-display font-light text-white">
                        Cómo <span className="italic text-sand">Llegar</span>
                    </h1>
                </div>
            </header>

            <main className="bg-background-light dark:bg-background-dark py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display text-text-main-light dark:text-text-main-dark mb-2">
                                    Información de Contacto
                                </h2>
                                <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent mb-6" />
                            </div>

                            <div className="space-y-4">
                                <div className={cardCls}>
                                    <div className={iconWrapCls}><MapPin className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-1 font-body">Dirección</h3>
                                        <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-sm leading-relaxed font-body">
                                            {config.address || 'Corregimiento de Cordobita'}<br />
                                            {config.city || 'Ciénaga, Magdalena'}<br />
                                            Colombia
                                        </p>
                                    </div>
                                </div>

                                <div className={cardCls}>
                                    <div className={iconWrapCls}><Phone className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-1 font-body">Teléfono / WhatsApp</h3>
                                        <a href={`https://wa.me/${cleanPhone(config.whatsapp_number)}`} target="_blank" rel="noopener noreferrer"
                                            className="text-primary hover:text-primary-dark font-medium font-body transition-colors">
                                            {config.phone_display || `+${config.whatsapp_number}`}
                                        </a>
                                    </div>
                                </div>

                                <div className={cardCls}>
                                    <div className={iconWrapCls}><Clock className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-2 font-body">Horario de Atención</h3>
                                        <div className="space-y-1 text-sm text-text-main-light/60 dark:text-text-main-dark/60 font-body">
                                            {[
                                                ['Lunes – Viernes', '6:00 am – 5:00 pm'],
                                                ['Sábados', '6:00 am – 5:00 pm'],
                                                ['Domingos y Festivos', '6:00 am – 4:00 pm'],
                                            ].map(([day, hours]) => (
                                                <div key={day} className="flex justify-between gap-8">
                                                    <span>{day}</span>
                                                    <span className="font-medium text-text-main-light/80 dark:text-text-main-dark/80">{hours}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA WhatsApp */}
                            <a
                                href={`https://wa.me/${cleanPhone(config.whatsapp_number)}?text=Hola,%20quiero%20información%20sobre%20Cantar%20de%20la%20Tierra`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-green-500/20 text-lg font-body"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Escríbenos por WhatsApp
                            </a>
                        </div>

                        {/* Mapa */}
                        <div className="space-y-6">
                            <div className="bg-surface-light dark:bg-surface-dark border border-sand/10 dark:border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2768.857820176865!2d-74.22374172692382!3d11.02551505455381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef457e7868e2241%3A0xe18d8ad6486812d3!2sCantar%20de%20la%20Tierra!5e1!3m2!1ses-419!2sco!4v1771429639810!5m2!1ses-419!2sco"
                                    width="100%" height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación Cantar de la Tierra"
                                />
                            </div>

                            <a
                                href={config.google_maps_url || "https://www.google.com/maps/dir//Cantar+de+la+Tierra,+Ciénaga,+Magdalena/"}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-6 rounded-2xl transition-all font-body"
                            >
                                <Navigation className="w-5 h-5" />
                                {config.google_maps_url ? "Cómo llegar" : "Cómo llegar"}
                            </a>

                            {/* Cómo llegar */}
                            <div className="bg-surface-light dark:bg-surface-dark border border-sand/10 dark:border-primary/10 rounded-2xl p-6">
                                <h3 className="font-bold text-text-main-light dark:text-text-main-dark mb-4 flex items-center gap-2 font-body">
                                    <Navigation className="w-5 h-5 text-primary" />
                                    ¿Cómo llegar?
                                </h3>
                                <ul className="space-y-3 text-sm text-text-main-light/60 dark:text-text-main-dark/60 font-body">
                                    {[
                                        ['Desde Manizales:', `Tomar la vía hacia ${config.city || 'Neira'} (aprox. 30 min). Seguir indicaciones.`],
                                        ['Desde Medellín:', 'Autopista Medellín–Bogotá hasta La Pintada, luego vía Aguadas–Neira (aprox. 2h 30min).'],
                                        ['Transporte:', 'Disponible transporte público. Consultar horarios por WhatsApp.'],
                                    ].map(([label, desc]) => (
                                        <li key={label} className="flex gap-3">
                                            <span className="text-primary font-bold flex-shrink-0">{label}</span>
                                            <span>{desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default ContactoPage;
