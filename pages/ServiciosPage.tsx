import React, { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead';
import BookingWidget from '../components/BookingWidget';
import { supabase, Service } from '../lib/supabase';
import { Sparkles, Users, Baby, CheckCircle } from 'lucide-react';

const ServiciosPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        const { data } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        setServices(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();

        // Realtime: escucha cambios en la tabla services
        const channel = supabase
            .channel('services-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'services' },
                () => { fetchServices(); }
            )
            .subscribe();

        // Scroll al widget si viene con #reservar
        const hash = window.location.hash;
        if (hash === '#reservar') {
            setTimeout(() => {
                document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            window.scrollTo(0, 0);
        }

        return () => { supabase.removeChannel(channel); };
    }, []);

    const mainServices = services.filter(s => s.category === 'main');
    const addons = services.filter(s => s.category === 'addon');
    const packages = services.filter(s => s.category === 'package');

    const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
        <div className="bg-surface-light dark:bg-surface-dark border border-sand/10 dark:border-primary/10 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-text-main-light/40 dark:text-text-main-dark/40 text-xs mb-1 font-body">
                        <Users className="w-3 h-3" /> Adulto
                    </div>
                    <p className="text-2xl font-bold text-accent dark:text-sand font-display">
                        ${Number(service.price_adult).toLocaleString('es-CO')}
                    </p>
                    {service.price_child > 0 && (
                        <div className="mt-1">
                            <div className="flex items-center gap-1 text-text-main-light/40 dark:text-text-main-dark/40 text-xs mb-0.5 justify-end font-body">
                                <Baby className="w-3 h-3" /> Niño
                            </div>
                            <p className="text-lg font-bold text-text-main-light/50 dark:text-text-main-dark/50 font-body">
                                ${Number(service.price_child).toLocaleString('es-CO')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2 font-display">
                {service.name_es}
            </h3>
            {service.description_es && (
                <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-sm leading-relaxed font-body">
                    {service.description_es}
                </p>
            )}
        </div>
    );

    const SectionHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
        <div className="text-center mb-12">
            <span className="text-accent dark:text-sand uppercase tracking-widest text-xs font-bold block mb-3 font-body">{eyebrow}</span>
            <h2 className="text-4xl md:text-5xl font-display text-text-main-light dark:text-text-main-dark">{title}</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto mt-4" />
        </div>
    );

    return (
        <>
            <SEOHead
                title="Servicios y Precios — Cantar de la Tierra"
                description="Conoce todos nuestros servicios de aguas termales, terapias de barro, masajes y paquetes especiales. Precios accesibles en Neira, Caldas, Colombia."
            />

            {/* Hero */}
            <header className="relative h-[50vh] min-h-[400px] flex items-end justify-center pb-16">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
                        alt="Servicios termales"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-sand-light uppercase tracking-[0.3em] text-sm font-bold block mb-3 font-body">Lo que ofrecemos</span>
                    <h1 className="text-5xl md:text-6xl font-display font-light text-white">
                        Servicios <span className="italic text-sand">& Precios</span>
                    </h1>
                </div>
            </header>

            {/* Booking Widget */}
            <section id="reservar" className="bg-background-dark">
                <BookingWidget />
            </section>

            {/* Catálogo */}
            <main className="bg-background-light dark:bg-background-dark py-20 px-4">
                <div className="max-w-6xl mx-auto space-y-20">

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {mainServices.length > 0 && (
                                <section>
                                    <SectionHeader eyebrow="Acceso" title="Servicios Principales" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {mainServices.map(s => <ServiceCard key={s.id} service={s} />)}
                                    </div>
                                </section>
                            )}

                            {addons.length > 0 && (
                                <section>
                                    <SectionHeader eyebrow="Complementa tu visita" title="Servicios Adicionales" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {addons.map(s => <ServiceCard key={s.id} service={s} />)}
                                    </div>
                                </section>
                            )}

                            {packages.length > 0 && (
                                <section>
                                    <SectionHeader eyebrow="Experiencias completas" title="Paquetes Especiales" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {packages.map(s => <ServiceCard key={s.id} service={s} />)}
                                    </div>
                                </section>
                            )}

                            {/* Nota */}
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                    <h3 className="text-text-main-light dark:text-text-main-dark font-bold font-body">Información importante</h3>
                                </div>
                                <p className="text-text-main-light/60 dark:text-text-main-dark/60 text-sm max-w-2xl mx-auto leading-relaxed font-body">
                                    Los precios están expresados en pesos colombianos (COP) e incluyen IVA.
                                    Niños menores de 3 años no pagan. Precios sujetos a cambios sin previo aviso.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default ServiciosPage;
