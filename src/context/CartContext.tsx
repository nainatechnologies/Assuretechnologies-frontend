import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { productsApi } from '../api/productsApi';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Record<string, number>;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token');
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const localCart = JSON.parse(saved);
          const promises = [];
          for (const productId in localCart) {
            if (localCart[productId] > 0) {
              promises.push(productsApi.addToCart(productId, localCart[productId]));
            }
          }
          if (promises.length > 0) {
            Promise.allSettled(promises).then(() => {
              localStorage.removeItem('cart');
              fetchCart();
            });
            return;
          } else {
            localStorage.removeItem('cart');
          }
        } catch (e) {
          localStorage.removeItem('cart');
        }
      }
      fetchCart();
    } else {
      setCart({});
    }
  }, [isLoggedIn, fetchCart]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      await productsApi.addToCart(productId, quantity);
      setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + quantity }));
    } catch (err) {
      console.error('Add to cart failed', err);
      setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + quantity }));
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
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
  }, []);

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
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
  }, [removeFromCart]);

  const cartCount = useMemo(() => {
    return Object.values(cart || {}).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    cart,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    fetchCart,
    setCart
  }), [cart, cartCount, loading, addToCart, updateCartItem, removeFromCart, fetchCart]);

  return (
    <CartContext.Provider value={contextValue}>
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
