import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerAPI } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ items: [], subtotal: 0, item_count: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await customerAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart({ items: [], subtotal: 0, item_count: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await customerAPI.addToCart({ product_id: productId, quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add to cart' };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await customerAPI.updateCart(itemId, { quantity });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update cart' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await customerAPI.removeFromCart(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to remove from cart' };
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, item_count: 0 });
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    itemCount: cart.item_count || 0,
    subtotal: cart.subtotal || 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}