import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { productsApi } from '../api/productsApi';

interface CartContextType {
  cart: Record<string, number>;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>; // Keep for backward compatibility initially
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token');
      // Attempt to load from API. If auth fails, fallback to local storage could be added here, 
      // but the requirement is server-side cart.
      const res = await productsApi.getCart();
      const cartItems = res.data.cartItems || [];
      const newCart: Record<string, number> = {};
      cartItems.forEach((item: any) => {
        if (item && item.product && item.product.id) {
          newCart[item.product.id] = item.quantity;
        }
      });
      setCart(newCart);
    } catch (err) {
      console.error('Failed to fetch cart', err);
      // Fallback to local storage if API fails (e.g. not logged in yet)
      const saved = localStorage.getItem('cart');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        try { setCart(JSON.parse(saved) || {}); } catch(e) { setCart({}); }
      } else { setCart({}); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Sync to local storage for guest carts / fallback
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await productsApi.addToCart(productId, quantity);
      setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + quantity }));
    } catch (err) {
      console.error('Add to cart failed', err);
      // Optimistic update fallback
      setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + quantity }));
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    try {
      await productsApi.updateCartItem(productId, quantity);
      setCart(prev => ({ ...prev, [productId]: quantity }));
    } catch (err) {
      console.error('Update cart item failed', err);
      setCart(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await productsApi.removeFromCart(productId);
      setCart(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } catch (err) {
      console.error('Remove cart item failed', err);
      setCart(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  const cartCount = Object.values(cart || {}).reduce((sum, qty) => sum + qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, updateCartItem, removeFromCart, fetchCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
