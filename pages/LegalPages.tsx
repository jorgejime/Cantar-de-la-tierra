import React, { useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import { Shield } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-3 flex items-center gap-2 font-display">
            <span className="w-1 h-6 bg-primary rounded-full inline-block" />
            {title}
        </h2>
        <div className="text-text-main-light/70 dark:text-text-main-dark/70 text-sm leading-relaxed space-y-2 pl-4 font-body">
            {children}
        </div>
    </div>
);

const LegalLayout = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <>
        <header className="pt-32 pb-12 px-4 bg-background-dark text-center">
            <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                    <Shield className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-3">{title}</h1>
                <p className="text-white/40 text-sm font-body">{subtitle}</p>
            </div>
        </header>
        <main className="bg-background-light dark:bg-background-dark py-16 px-4">
            <div className="max-w-3xl mx-auto bg-surface-light dark:bg-surface-dark border border-sand/10 dark:border-white/5 rounded-2xl p-8 md:p-12 shadow-sm">
                {children}
            </div>
        </main>
    </>
);

// =============================================
// POLÍTICA DE PRIVACIDAD
// =============================================
export const PrivacidadPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { config } = useSiteConfig();

    return (
        <>
            <SEOHead
                title="Política de Privacidad — Cantar de la Tierra"
                description="Política de privacidad y tratamiento de datos personales de Cantar de la Tierra, conforme a la Ley 1581 de 2012 de Colombia."
            />
            <LegalLayout
                title="Política de Privacidad"
                subtitle="Última actualización: febrero de 2026 · Conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013"
            >
                <Section title="1. Responsable del Tratamiento">
                    <p><strong className="text-text-main-light dark:text-text-main-dark">Razón social:</strong> Cantar de la Tierra</p>
                    <p><strong className="text-text-main-light dark:text-text-main-dark">Domicilio:</strong> {config.address || 'Vereda La Palma'}, {config.city || 'Municipio de Neira, Caldas'}, Colombia</p>
                    <p><strong className="text-text-main-light dark:text-text-main-dark">Contacto:</strong> {config.phone_display || config.whatsapp_number ? `+${config.whatsapp_number}` : '+57 310 502 6547'}</p>
                </Section>

                <Section title="2. Marco Legal">
                    <p>El tratamiento de datos personales se rige por la <strong className="text-text-main-light dark:text-text-main-dark">Ley Estatutaria 1581 de 2012</strong> (Protección de Datos Personales), el <strong className="text-text-main-light dark:text-text-main-dark">Decreto 1377 de 2013</strong> y las demás normas que las modifiquen o complementen, expedidas por la Superintendencia de Industria y Comercio (SIC) de Colombia.</p>
                </Section>

                <Section title="3. Datos que Recopilamos">
                    <p>Recopilamos los siguientes datos personales cuando realiza una reserva o nos contacta:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Nombre completo</li>
                        <li>Número de teléfono / WhatsApp</li>
                        <li>Correo electrónico (opcional)</li>
                        <li>Fecha de visita y servicios seleccionados</li>
                        <li>Información de pago (no almacenamos datos de tarjetas)</li>
                    </ul>
                </Section>

                <Section title="4. Finalidad del Tratamiento">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Gestionar y confirmar reservas de servicios</li>
                        <li>Enviar información sobre su reserva y ticket de confirmación</li>
                        <li>Atender solicitudes, quejas y reclamos (PQRS)</li>
                        <li>Cumplir obligaciones legales y fiscales</li>
                        <li>Mejorar nuestros servicios mediante análisis estadístico anónimo</li>
                    </ul>
                </Section>

                <Section title="5. Derechos del Titular">
                    <p>De conformidad con el artículo 8 de la Ley 1581 de 2012, usted tiene derecho a:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Conocer</strong> los datos personales que tenemos sobre usted</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Actualizar y rectificar</strong> sus datos cuando sean inexactos</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Solicitar prueba</strong> de la autorización otorgada</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Revocar</strong> la autorización y/o solicitar la supresión de sus datos</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Presentar quejas</strong> ante la Superintendencia de Industria y Comercio</li>
                    </ul>
                    <p className="mt-2">Para ejercer estos derechos, contáctenos al {config.phone_display || config.whatsapp_number ? `+${config.whatsapp_number}` : '+57 310 502 6547'}.</p>
                </Section>

                <Section title="6. Seguridad de los Datos">
                    <p>Implementamos medidas técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, pérdida o alteración. Los datos se almacenan en servidores seguros con cifrado SSL/TLS.</p>
                </Section>

                <Section title="7. Transferencia de Datos">
                    <p>No vendemos ni cedemos sus datos personales a terceros con fines comerciales. Solo compartimos información con proveedores de servicios tecnológicos necesarios para operar nuestra plataforma (como servicios de almacenamiento en la nube), quienes están obligados contractualmente a proteger su información.</p>
                </Section>

                <Section title="8. Vigencia">
                    <p>Sus datos serán conservados durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables, o hasta que usted solicite su eliminación.</p>
                </Section>

                <Section title="9. Modificaciones">
                    <p>Nos reservamos el derecho de actualizar esta política. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.</p>
                </Section>
            </LegalLayout>
        </>
    );
};

// =============================================
// TÉRMINOS Y CONDICIONES
// =============================================
export const TerminosPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { config } = useSiteConfig();
    return (
        <>
            <SEOHead
                title="Términos y Condiciones — Cantar de la Tierra"
                description="Términos y condiciones de uso del sitio web y servicios de Cantar de la Tierra, conforme a la legislación colombiana."
            />
            <LegalLayout
                title="Términos y Condiciones"
                subtitle="Última actualización: febrero de 2026 · Aplica legislación colombiana"
            >
                <Section title="1. Aceptación de los Términos">
                    <p>Al acceder y utilizar el sitio web de <strong className="text-text-main-light dark:text-text-main-dark">Cantar de la Tierra</strong>, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo, le pedimos abstenerse de usar nuestros servicios.</p>
                </Section>

                <Section title="2. Descripción del Servicio">
                    <p>Cantar de la Tierra es un establecimiento de aguas termales naturales ubicado en {config.city || 'Neira, Caldas'}, Colombia. Ofrecemos servicios de balneoterapia, terapias de barro, masajes y gastronomía local.</p>
                </Section>

                <Section title="3. Reservas y Pagos">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Las reservas se realizan a través de WhatsApp o el formulario en línea</li>
                        <li>El pago se efectúa en el establecimiento en el momento de la visita</li>
                        <li>Los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplique</li>
                        <li>Cantar de la Tierra se reserva el derecho de modificar precios sin previo aviso</li>
                    </ul>
                </Section>

                <Section title="4. Política de Cancelación">
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Cancelación con más de 24 horas:</strong> Sin cargo</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">Cancelación con menos de 24 horas:</strong> Se podrá cobrar el 50% del valor reservado</li>
                        <li><strong className="text-text-main-light dark:text-text-main-dark">No presentación (no-show):</strong> Se podrá cobrar el 100% del valor</li>
                        <li>Cancelaciones por fuerza mayor o emergencias serán evaluadas caso a caso</li>
                    </ul>
                </Section>

                <Section title="5. Responsabilidades del Usuario">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Informar sobre condiciones médicas que puedan contraindicar el uso de aguas termales</li>
                        <li>Respetar las normas de convivencia y el reglamento interno del establecimiento</li>
                        <li>Supervisar a los menores de edad bajo su responsabilidad en todo momento</li>
                        <li>No ingresar bajo efectos de alcohol o sustancias psicoactivas</li>
                    </ul>
                </Section>

                <Section title="6. Limitación de Responsabilidad">
                    <p>Cantar de la Tierra no será responsable por daños, lesiones o pérdidas derivadas del incumplimiento de las normas de seguridad por parte del usuario, ni por causas de fuerza mayor. El uso de las instalaciones es bajo la responsabilidad del visitante.</p>
                </Section>

                <Section title="7. Propiedad Intelectual">
                    <p>Todo el contenido del sitio web (imágenes, textos, logotipos, diseño) es propiedad de Cantar de la Tierra o de sus respectivos titulares. Queda prohibida su reproducción sin autorización expresa.</p>
                </Section>

                <Section title="8. Ley Aplicable y Jurisdicción">
                    <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será resuelta ante los jueces competentes de Manizales, Caldas, Colombia, conforme al Código General del Proceso (Ley 1564 de 2012).</p>
                </Section>

                <Section title="9. Contacto">
                    <p>Para cualquier consulta sobre estos términos, contáctenos al <strong className="text-text-main-light dark:text-text-main-dark">{config.phone_display || config.whatsapp_number ? `+${config.whatsapp_number}` : '+57 310 502 6547'}</strong> o visítenos en nuestra sede en {config.city || 'Neira, Caldas'}.</p>
                </Section>
            </LegalLayout>
        </>
    );
};

// =============================================
// TRATAMIENTO DE DATOS PERSONALES
// =============================================
export const DatosPersonalesPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { config } = useSiteConfig();
    return (
        <>
            <SEOHead
                title="Tratamiento de Datos Personales — Cantar de la Tierra"
                description="Aviso de privacidad y autorización para el tratamiento de datos personales conforme a la Ley 1581 de 2012 de Colombia."
            />
            <LegalLayout
                title="Tratamiento de Datos Personales"
                subtitle="Aviso de Privacidad · Ley 1581 de 2012 · Decreto 1377 de 2013"
            >
                <Section title="1. Aviso de Privacidad">
                    <p>En cumplimiento de la <strong className="text-text-main-light dark:text-text-main-dark">Ley 1581 de 2012</strong> y el <strong className="text-text-main-light dark:text-text-main-dark">Decreto 1377 de 2013</strong>, Cantar de la Tierra informa a sus usuarios, clientes y visitantes sobre el tratamiento que dará a sus datos personales.</p>
                </Section>

                <Section title="2. Responsable del Tratamiento">
                    <p><strong className="text-text-main-light dark:text-text-main-dark">Cantar de la Tierra</strong><br />
                        {config.address || 'Vereda La Palma'}, {config.city || 'Neira, Caldas'}, Colombia<br />
                        Teléfono: {config.phone_display || config.whatsapp_number ? `+${config.whatsapp_number}` : '+57 310 502 6547'}</p>
                </Section>

                <Section title="3. Datos Recopilados">
                    <p>Recopilamos datos personales de identificación (nombre, teléfono, correo) y datos de uso del servicio (fecha de visita, servicios contratados). No recopilamos datos sensibles según el artículo 5 de la Ley 1581 de 2012.</p>
                </Section>

                <Section title="4. Finalidades del Tratamiento">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Gestión de reservas y prestación del servicio</li>
                        <li>Envío de confirmaciones y comunicaciones relacionadas con su reserva</li>
                        <li>Cumplimiento de obligaciones legales, contables y fiscales</li>
                        <li>Atención de PQRS (Peticiones, Quejas, Reclamos y Sugerencias)</li>
                        <li>Análisis estadístico para mejora del servicio (datos anonimizados)</li>
                    </ul>
                </Section>

                <Section title="5. Autorización">
                    <p>Al proporcionar sus datos personales a través de nuestros canales de contacto (formulario web, WhatsApp), usted otorga su autorización libre, previa, expresa e informada para el tratamiento de sus datos personales conforme a las finalidades descritas.</p>
                    <p className="mt-2">Puede revocar esta autorización en cualquier momento contactándonos al {config.phone_display || config.whatsapp_number ? `+${config.whatsapp_number}` : '+57 310 502 6547'}.</p>
                </Section>

                <Section title="6. Derechos del Titular (Art. 8, Ley 1581/2012)">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Conocer, actualizar y rectificar sus datos personales</li>
                        <li>Solicitar prueba de la autorización otorgada</li>
                        <li>Ser informado sobre el uso de sus datos</li>
                        <li>Presentar quejas ante la SIC (www.sic.gov.co)</li>
                        <li>Revocar la autorización y solicitar la supresión de datos</li>
                        <li>Acceder gratuitamente a sus datos personales</li>
                    </ul>
                </Section>

                <Section title="7. Transferencias Internacionales">
                    <p>Sus datos pueden ser procesados en servidores ubicados fuera de Colombia (servicios en la nube). En estos casos, garantizamos que los proveedores cumplen estándares de seguridad equivalentes a los exigidos por la legislación colombiana.</p>
                </Section>

                <Section title="8. Vigencia de la Política">
                    <p>Esta política rige a partir de febrero de 2026 y permanecerá vigente hasta que sea modificada. Cualquier cambio será informado a través de nuestros canales oficiales.</p>
                </Section>

                <Section title="9. Entidad de Control">
                    <p>La Superintendencia de Industria y Comercio (SIC) es la entidad encargada de velar por el cumplimiento de la Ley 1581 de 2012 en Colombia. Puede presentar quejas en <strong className="text-text-main-light dark:text-text-main-dark">www.sic.gov.co</strong>.</p>
                </Section>
            </LegalLayout>
        </>
    );
};
