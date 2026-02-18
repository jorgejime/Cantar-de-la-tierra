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

import AdminPage from './components/admin/AdminPage';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'home' | 'booking' | 'admin'>('home');

  React.useEffect(() => {
    const checkPath = () => {
      if (window.location.pathname === '/admin') {
        setView('admin');
      }
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const navigateToBooking = () => {
    setView('booking');
    window.history.pushState({}, '', '/booking');
    window.scrollTo(0, 0);
  };

  const navigateToHome = (sectionId?: string) => {
    setView('home');
    window.history.pushState({}, '', '/');
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  if (view === 'admin') {
    return <AdminPage />;
  }

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