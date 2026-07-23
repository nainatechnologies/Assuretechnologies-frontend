import { useState } from 'react';
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

function HomePage({ cart, setCart }: {
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  return (
    <>
      <HeroSlider />
      <TopProducts cart={cart} setCart={setCart} />
      <BookTechnician />
      <TrustIndicators />
      <Testimonials />
    </>
  );
}

function App() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Sai Kumar');

  // Calculate total items in cart
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userName={userName} />
      <CategoryStrip />
      <Routes>
        <Route path="/" element={<HomePage cart={cart} setCart={setCart} />} />
        <Route path="/book-service" element={<BookServicePage />} />
        <Route path="/order-products" element={<OrderProductsPage cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<RegisterPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
