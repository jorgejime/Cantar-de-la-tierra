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
      desc: "Seleccione su fecha ideal y el tratamiento deseado para comenzar su viaje de relajación y bienestar profundo.",
      step1: "Seleccione Fecha",
      step2: "Seleccione Hora",
      step3: "Servicios",
      personalData: "Datos Personales",
      name: "Nombre Completo",
      email: "Email",
      phone: "Teléfono",
      date: "Fecha",
      time: "Hora",
      service: "Servicio",
      total: "Total a pagar",
      confirm: "Confirmar Reserva",
      disclaimer: "Al confirmar, aceptas nuestra política de cancelación de 24 horas.",
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      selected: "Seleccionado",
      available: "Disponible",
      occupied: "Ocupado",
      servicesList: {
        circuit: { name: "Circuito Termal", desc: "Piscinas termales, sauna y baño turco." },
        massage: { name: "Masaje Relajante", desc: "Aceites esenciales y técnicas suecas." },
        mud: { name: "Terapia de Lodo", desc: "Barro mineral volcánico rico en nutrientes." }
      }
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
      desc: "Select your ideal date and desired treatment to begin your journey of relaxation and deep wellness.",
      step1: "Select Date",
      step2: "Select Time",
      step3: "Services",
      personalData: "Personal Details",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      date: "Date",
      time: "Time",
      service: "Service",
      total: "Total to pay",
      confirm: "Confirm Booking",
      disclaimer: "By confirming, you accept our 24-hour cancellation policy.",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      selected: "Selected",
      available: "Available",
      occupied: "Occupied",
      servicesList: {
        circuit: { name: "Thermal Circuit", desc: "Thermal pools, sauna, and turkish bath." },
        massage: { name: "Relaxing Massage", desc: "Essential oils and swedish techniques." },
        mud: { name: "Mud Therapy", desc: "Nutrient-rich volcanic mineral mud." }
      }
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