import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CategoryStrip } from './components/CategoryStrip';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { TopProducts } from './components/TopProducts';
import { BookTechnician } from './components/BookTechnician';
import { TrustIndicators } from './components/TrustIndicators';
import { Testimonials } from './components/Testimonials';
import { BookServicePage } from './components/BookServicePage';
import { OrderProductsPage } from './components/OrderProductsPage';
import { CartPage } from './components/CartPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ProfilePage } from './components/ProfilePage';
import { OrdersPage } from './components/OrdersPage';
import { OrderDetailsPage } from './components/OrderDetailsPage';
import { EditProfilePage } from './components/EditProfilePage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';

function HomePage() {
  return (
    <>
      <HeroSlider />
      <TopProducts />
      <BookTechnician />
      <TrustIndicators />
      <Testimonials />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <CategoryStrip />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book-service" element={<BookServicePage />} />
          <Route path="/order-products" element={<OrderProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
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
        <WhatsAppButton />
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
