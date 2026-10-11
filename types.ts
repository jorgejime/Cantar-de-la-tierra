export type Language = 'es' | 'en';

export interface Translation {
  common: {
    signature: string;
    loading: string;
  };
  nav: {
    experience: string;
    therapies: string;
    dining: string;
    contact: string;
    signIn: string;
  };
  hero: {
    subtitle: string;
    title: string;
    titleAccent: string;
    description: string;
  };
  booking: {
    date: string;
    guests: string;
    experience: string;
    bookNow: string;
    summary: string;
    adults: string;
    children: string;
    total: string;
    name: string;
    whatsappButton: string;
    whatsappMessage: {
      greeting: string;
      intro: string;
      date: string;
      service: string;
      adults: string;
      children: string;
      mud: string;
      mask: string;
      massage: string;
      food: string;
      total: string;
      name: string;
    };
    options: {
      entrance: string;
      thermal: string;
      fullDay: string;
      couple: string;
      mud: string;
      mask: string;
    };
    addons: {
      title: string;
      mud: string;
      mask: string;
      massage: string;
      food: string;
    };
  };
  intro: {
    philosophy: string;
    title: string;
    description: string;
  };
  features: {
    circuitTitle: string;
    circuitDesc: string;
    spaTitle: string;
    spaDesc: string;
    diningTitle: string;
    diningDesc: string;
  };
  pricing: {
    subtitle: string;
    title: string;
    description: string;
    currency: string;
    items: {
      adultEntrance: string;
      childEntrance: string;
      adultThermal: string;
      childThermal: string;
      mudTherapy: string;
      mudMask: string;
    };
    note: string;
  };
  location: {
    visit: string;
    desc: string;
    address: string;
    city: string;
    getDirections: string;
  };
  testimonial: {
    text: string;
    author: string;
    location: string;
  };
  footer: {
    tagline: string;
    discover: string;
    experiences: string;
    stayConnected: string;
    rights: string;
    story: string;
    waters: string;
    sustainability: string;
    gallery: string;
    privacy: string;
    terms: string;
    dayPass: string;
    treatments: string;
    events: string;
    newsletterPlaceholder: string;
    subscribe: string;
  };
  generic: {
    description: string;
    disclaimer: string;
  };
  pages: {
    story: { title: string; content: string[] };
    waters: { title: string; content: string[] };
    sustainability: { title: string; content: string[] };
    dayPass: { title: string; content: string[] };
    treatments: { title: string; content: string[] };
    events: { title: string; content: string[] };
    privacy: { title: string; content: string[] };
    terms: { title: string; content: string[] };
    gallery: { title: string; subtitle: string };
  };
}