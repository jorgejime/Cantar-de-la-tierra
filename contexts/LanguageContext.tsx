import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'es' | 'en';

const translations = {
  es: {
    nav: {
      home: "Inicio",
      services: "Servicios",
      gallery: "Galería",
      contact: "Contacto",
      book: "Reservar Ahora"
    },
    hero: {
      title: "Donde el Renacer",
      subtitle: "es Posible",
      desc: "Nuestro Santuario Termal, ubicado en el misticismo de Ciénaga Magdalena, es más que un destino: es un principio. Un espacio sagrado donde el cuerpo y la mente encuentran su equilibrio natural.",
      cta: "Descubrir Experiencia"
    },
    experience: {
      tag: "Bienestar Integral",
      title: "Experiencia Termal",
      desc: "Sumérjase en aguas ancestrales. Nuestro circuito termal está diseñado para reactivar la circulación y purificar la piel. Ubicado a 40 min de Santa Marta, ofrecemos un refugio de paz donde el único sonido es el susurro de la naturaleza.",
      items: ["Circuitos de contraste", "Hidroterapia natural", "Relajación profunda"],
      cta: "Reservar Circuito",
      min: "Min de",
      loc: "Sta Marta"
    },
    treatments: {
      tag: "Tratamientos",
      title: "Lodoterapia y \nMascarillas Faciales",
      desc: "Disfrute de un escenario de sanación donde el barro volcánico rico en minerales revitaliza su piel. Nuestros terapeutas expertos aplican técnicas ancestrales para exfoliar, nutrir y restaurar la luminosidad natural de su rostro y cuerpo.",
      cta: "Reservar Ahora"
    },
    video: {
      title: "Un Viaje al Núcleo del Bienestar",
      desc: "El agua es nuestra terapia rejuvenecedora. Permita que el sonido del bosque y el calor de la tierra renueven su energía vital."
    },
    gallery: {
      tag: "Biodiversidad",
      title: "Fauna del Santuario"
    },
    services: {
      title: "Menú de Servicios",
      items: [
        { name: "Entrada Adulto", price: "75.000 COP" },
        { name: "Entrada Niños", price: "38.000 COP" },
        { name: "Baño Termal Adultos (Completo)", price: "109.600 COP" },
        { name: "Baño Termal Niños (Completo)", price: "58.000 COP" },
        { name: "Lodoterapia", price: "198.000 COP" },
        { name: "Mascarilla Facial con Lodo", price: "150.000 COP" }
      ],
      cta: "Agendar Visita"
    },
    footer: {
      locationTag: "Ubicación",
      howTo: "Cómo llegar",
      country: "Colombia",
      rights: "© 2023 Todos los derechos reservados.",
      created: "Creado por Orosius y Kerne"
    },
    booking: {
      back: "Volver al Inicio",
      title: "Reserva tu",
      titleHighlight: "Experiencia",
      step1: "Entradas",
      step2: "Servicios",
      step3: "Fecha",
      step4: "Ticket",
      stepOf: "de",
      next: "Continuar",
      prev: "Atrás",
      adult: "Adulto",
      child: "Niño (6-12)",
      senior: "Adulto Mayor (60+)",
      adultPrice: "75.000",
      childPrice: "40.000",
      seniorPrice: "60.000",
      howMany: "¿Cuántas personas asistirán?",
      perPerson: "/ persona",
      serviceFor: "Servicio para",
      guest: "Visitante",
      selectService: "Selecciona un servicio",
      noService: "Solo entrada (sin servicio adicional)",
      selectDate: "Selecciona una fecha",
      selectTime: "Horario disponible",
      spotsLeft: "cupos disponibles",
      full: "Agotado",
      yourData: "Tus datos de contacto",
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Celular / WhatsApp",
      summary: "Resumen",
      entries: "Entradas",
      services: "Servicios",
      total: "Total estimado",
      confirm: "Obtener Ticket",
      processing: "Procesando...",
      disclaimer: "Pagarás directamente en el santuario. Este ticket confirma tu reserva.",
      ticketTitle: "¡Tu Reserva está Confirmada!",
      ticketCode: "Código de ticket",
      ticketMsg: "Presenta este ticket en la entrada del santuario. Puedes pagar en efectivo o tarjeta al llegar.",
      print: "Imprimir Ticket",
      newBooking: "Nueva Reserva",
      errorOverbooking: "No hay suficientes cupos. Solo quedan",
      errorGeneral: "Ocurrió un error. Intenta de nuevo.",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    }
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      gallery: "Gallery",
      contact: "Contact",
      book: "Book Now"
    },
    hero: {
      title: "Where Rebirth",
      subtitle: "is Possible",
      desc: "Our Thermal Sanctuary, located in the mysticism of Ciénaga Magdalena, is more than a destination: it is a principle. A sacred space where body and mind find their natural balance.",
      cta: "Discover Experience"
    },
    experience: {
      tag: "Integral Wellness",
      title: "Thermal Experience",
      desc: "Immerse yourself in ancestral waters. Our thermal circuit is designed to reactivate circulation and purify the skin. Located 40 min from Santa Marta, we offer a haven of peace where the only sound is the whisper of nature.",
      items: ["Contrast circuits", "Natural hydrotherapy", "Deep relaxation"],
      cta: "Book Circuit",
      min: "Min from",
      loc: "Sta Marta"
    },
    treatments: {
      tag: "Treatments",
      title: "Mud Therapy and \nFacial Masks",
      desc: "Enjoy a healing setting where mineral-rich volcanic mud revitalizes your skin. Our expert therapists apply ancestral techniques to exfoliate, nourish, and restore the natural luminosity of your face and body.",
      cta: "Book Now"
    },
    video: {
      title: "A Journey to the Core of Wellness",
      desc: "Water is our rejuvenating therapy. Allow the sound of the forest and the heat of the earth to renew your vital energy."
    },
    gallery: {
      tag: "Biodiversity",
      title: "Sanctuary Wildlife"
    },
    services: {
      title: "Service Menu",
      items: [
        { name: "Adult Entry", price: "75.000 COP" },
        { name: "Child Entry", price: "38.000 COP" },
        { name: "Thermal Bath Adults (Full)", price: "109.600 COP" },
        { name: "Thermal Bath Kids (Full)", price: "58.000 COP" },
        { name: "Mud Therapy", price: "198.000 COP" },
        { name: "Mud Facial Mask", price: "150.000 COP" }
      ],
      cta: "Schedule Visit"
    },
    footer: {
      locationTag: "Location",
      howTo: "How to get there",
      country: "Colombia",
      rights: "© 2023 All rights reserved.",
      created: "Created by Orosius and Kerne"
    },
    booking: {
      back: "Back to Home",
      title: "Book your",
      titleHighlight: "Experience",
      step1: "Tickets",
      step2: "Services",
      step3: "Date",
      step4: "Ticket",
      stepOf: "of",
      next: "Continue",
      prev: "Back",
      adult: "Adult",
      child: "Child (6-12)",
      senior: "Senior (60+)",
      adultPrice: "75,000",
      childPrice: "40,000",
      seniorPrice: "60,000",
      howMany: "How many guests will attend?",
      perPerson: "/ person",
      serviceFor: "Service for",
      guest: "Guest",
      selectService: "Select a service",
      noService: "Entry only (no additional service)",
      selectDate: "Select a date",
      selectTime: "Available time",
      spotsLeft: "spots available",
      full: "Full",
      yourData: "Your contact info",
      name: "Full name",
      email: "Email address",
      phone: "Phone / WhatsApp",
      summary: "Summary",
      entries: "Tickets",
      services: "Services",
      total: "Estimated total",
      confirm: "Get Ticket",
      processing: "Processing...",
      disclaimer: "You'll pay directly at the sanctuary. This ticket confirms your reservation.",
      ticketTitle: "Your Booking is Confirmed!",
      ticketCode: "Ticket code",
      ticketMsg: "Show this ticket at the sanctuary entrance. You can pay with cash or card upon arrival.",
      print: "Print Ticket",
      newBooking: "New Booking",
      errorOverbooking: "Not enough spots. Only remaining:",
      errorGeneral: "An error occurred. Please try again.",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  // Load language from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // Simple browser detection
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};