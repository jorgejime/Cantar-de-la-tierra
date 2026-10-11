import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
// AuthProvider removed

import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ===== PÁGINAS PÚBLICAS =====
const Home = React.lazy(() => import('./pages/Home'));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'));
const ServiciosPage = React.lazy(() => import('./pages/ServiciosPage'));
const ContactoPage = React.lazy(() => import('./pages/ContactoPage'));

// ===== PÁGINAS LEGALES =====
const { PrivacidadPage, TerminosPage, DatosPersonalesPage } = {
  PrivacidadPage: React.lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacidadPage }))),
  TerminosPage: React.lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TerminosPage }))),
  DatosPersonalesPage: React.lazy(() => import('./pages/LegalPages').then(m => ({ default: m.DatosPersonalesPage }))),
};

// ===== BACKOFFICE (Supabase) =====
const BackofficeLogin = React.lazy(() => import('./pages/backoffice/LoginPage'));
const BackofficeLayout = React.lazy(() => import('./pages/backoffice/BackofficeLayout'));
const ProtectedBackofficeRoute = React.lazy(() => import('./components/ProtectedBackofficeRoute'));
const DashboardPage = React.lazy(() => import('./pages/backoffice/DashboardPage'));
const BookingsPage = React.lazy(() => import('./pages/backoffice/BookingsPage'));
const BackofficeServicesPage = React.lazy(() => import('./pages/backoffice/ServicesPage'));
const ImagesPage = React.lazy(() => import('./pages/backoffice/ImagesPage'));
const PricesPage = React.lazy(() => import('./pages/backoffice/PricesPage'));
const SettingsPage = React.lazy(() => import('./pages/backoffice/SettingsPage'));

// Wrapper para páginas públicas con Navbar y Footer
const PublicPage = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <div className="min-h-screen">{children}</div>
    <Footer />
  </>
);

const AppRoutes = () => (
  <Routes>
    {/* ===== SITIO PÚBLICO ===== */}
    <Route path="/" element={<PublicPage><Home /></PublicPage>} />
    <Route path="/servicios" element={<PublicPage><ServiciosPage /></PublicPage>} />
    <Route path="/galeria" element={<PublicPage><GalleryPage /></PublicPage>} />
    <Route path="/contacto" element={<PublicPage><ContactoPage /></PublicPage>} />

    {/* ===== PÁGINAS LEGALES ===== */}
    <Route path="/privacidad" element={<PublicPage><PrivacidadPage /></PublicPage>} />
    <Route path="/terminos" element={<PublicPage><TerminosPage /></PublicPage>} />
    <Route path="/datos-personales" element={<PublicPage><DatosPersonalesPage /></PublicPage>} />

    {/* ===== BACKOFFICE ===== */}
    <Route path="/backoffice/login" element={<BackofficeLogin />} />
    <Route element={<ProtectedBackofficeRoute />}>
      <Route element={<BackofficeLayout />}>
        <Route path="/backoffice/dashboard" element={<DashboardPage />} />
        <Route path="/backoffice/bookings" element={<BookingsPage />} />
        <Route path="/backoffice/services" element={<BackofficeServicesPage />} />
        <Route path="/backoffice/images" element={<ImagesPage />} />
        <Route path="/backoffice/prices" element={<PricesPage />} />
        <Route path="/backoffice/settings" element={<SettingsPage />} />
      </Route>
    </Route>

    {/* Redirección 404 → Inicio */}
    <Route path="*" element={<PublicPage><Home /></PublicPage>} />
  </Routes>
);

const App: React.FC = () => (
  <LanguageProvider>
    <SupabaseAuthProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-body selection:bg-primary/30 selection:text-white">
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background-dark">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          }>
            <AppRoutes />
          </React.Suspense>
        </div>
      </Router>
    </SupabaseAuthProvider>
  </LanguageProvider>
);

export default App;