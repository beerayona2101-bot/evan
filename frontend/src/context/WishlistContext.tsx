import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../services/wishlistApi';
import { showToast } from '../components/ToastContainer';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('evan_guest_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      wishlistApi
        .getWishlist()
        .then((data) => {
          setWishlist(data);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('evan_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some((p) => p._id === product._id);

    // Optimistic UI update
    setWishlist((prev) =>
      exists ? prev.filter((p) => p._id !== product._id) : [...prev, product]
    );

    if (exists) {
      showToast('Removed from Wishlist', 'info');
    } else {
      showToast('Saved to Wishlist!', 'success');
    }

    if (user) {
      try {
        const updated = await wishlistApi.toggleWishlist(product._id);
        setWishlist(updated);
      } catch {
        // revert on failure
        setWishlist((prev) =>
          exists ? [...prev, product] : prev.filter((p) => p._id !== product._id)
        );
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
    showToast('Removed from Wishlist', 'info');

    if (user) {
      try {
        const updated = await wishlistApi.removeFromWishlist(productId);
        setWishlist(updated);
      } catch {}
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    localStorage.removeItem('evan_guest_wishlist');
    showToast('Wishlist cleared', 'info');
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
