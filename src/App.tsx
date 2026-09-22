import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Navbar } from './components/Navbar';
import { CategoryStrip } from './components/CategoryStrip';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { TopProducts } from './components/TopProducts';
import { BookTechnician } from './components/BookTechnician';
import { TrustIndicators } from './components/TrustIndicators';
import { Testimonials } from './components/Testimonials';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';
import { ScrollToTop } from './components/ScrollToTop';
import { RouteLoader } from './components/RouteLoader';

// Lazy-loaded secondary routes for optimal initial bundle size & fast LCP
const BookServicePage = lazy(() => import('./components/BookServicePage').then(m => ({ default: m.BookServicePage })));
const OrderProductsPage = lazy(() => import('./components/OrderProductsPage').then(m => ({ default: m.OrderProductsPage })));
const CartPage = lazy(() => import('./components/CartPage').then(m => ({ default: m.CartPage })));
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./components/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import('./components/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderDetailsPage = lazy(() => import('./components/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })));
const EditProfilePage = lazy(() => import('./components/EditProfilePage').then(m => ({ default: m.EditProfilePage })));
const CareersPage = lazy(() => import('./components/CareersPage').then(m => ({ default: m.CareersPage })));
const JobDetailsPage = lazy(() => import('./components/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const JobApplicationForm = lazy(() => import('./components/JobApplicationForm').then(m => ({ default: m.JobApplicationForm })));
const SitemapPage = lazy(() => import('./components/SitemapPage').then(m => ({ default: m.SitemapPage })));
const SearchPage = lazy(() => import('./components/SearchPage').then(m => ({ default: m.SearchPage })));

import { SEOHead } from './components/SEOHead';
import { StructuredData } from './components/StructuredData';

function HomePage() {
  return (
    <>
      <SEOHead 
        title="Smart Enterprise Solutions, Solar & IoT"
        description="Assure Technologies provides on-demand technician bookings, AgriTech drone spraying, high-speed optical networking, rooftop solar power, and smart surveillance systems."
        canonicalUrl="https://assuretechnologies.com/"
      />
      <StructuredData type="organization" />
      <HeroSlider />
      <TopProducts />
      <BookTechnician />
      <TrustIndicators />
      <Testimonials />
    </>
  );
}

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(() => {});

      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        const path = window.location.pathname;
        if (path === '/' || path === '/login') {
          CapApp.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then(handle => handle.remove()).catch(() => {});
      };
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar />

        <CategoryStrip />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book-service" element={<BookServicePage />} />
            <Route path="/order-products" element={<OrderProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/career" element={<CareersPage />} />
            <Route path="/career/jobdetails/:jobCode" element={<JobDetailsPage />} />
            <Route path="/career/jobdetails/:jobCode/apply" element={<JobApplicationForm />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
        <WhatsAppButton />
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
