import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Treatments from './components/Treatments';
import VideoBanner from './components/VideoBanner';
import Gallery from './components/Gallery';
import Services from './components/Services';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import Booking from './components/Booking';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'booking'>('home');

  const navigateToBooking = () => {
    setView('booking');
    window.scrollTo(0, 0);
  };

  const navigateToHome = (sectionId?: string) => {
    setView('home');
    if (sectionId) {
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        window.scrollTo(0, 0);
    }
  };

  return (
    <div className="relative">
      <ThemeToggle />
      <Navbar 
        onNavigate={navigateToHome} 
        onBook={navigateToBooking} 
        isBookingMode={view === 'booking'}
      />
      
      {view === 'home' ? (
        <main>
            <Hero onBook={navigateToBooking} />
            <Experience onBook={navigateToBooking} />
            <Treatments onBook={navigateToBooking} />
            <VideoBanner />
            <Gallery />
            <Services onBook={navigateToBooking} />
        </main>
      ) : (
        <main className="fade-in-up">
            <Booking onBack={() => navigateToHome()} />
        </main>
      )}
      
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;