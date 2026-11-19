import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerAPI } from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setWishlist({ items: [], count: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await customerAPI.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist({ items: [], count: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    try {
      const response = await customerAPI.toggleWishlist({ product_id: productId });
      await fetchWishlist();
      return { success: true, action: response.data.action };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update wishlist' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(item => item.product_id === productId);
  };

  const value = {
    wishlist,
    loading,
    fetchWishlist,
    toggleWishlist,
    isInWishlist,
    count: wishlist.count || 0,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}