import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { cartApi } from '../services/cartApi';
import { showToast } from '../components/ToastContainer';

interface CartContextType {
  cartItems: CartItem[];
  savedForLaterItems: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  removeFromCart: (indexOrId: number | string) => Promise<void>;
  updateQuantity: (index: number, quantity: number) => Promise<void>;
  saveForLater: (indexOrId: number | string) => Promise<void>;
  moveToCartFromSaved: (indexOrId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: { code: string; discountAmount: number } | null;
  applyCouponCode: (code: string, discountAmount: number) => void;
  removeCouponCode: () => void;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalSavings: number;
  totalItemsCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  getItemQuantityInCart: (productId: string, size?: string, color?: string) => number;
  updateCartItemQuantityByProductId: (product: Product, newQuantity: number, size?: string, color?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('evan_guest_cart');
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed.filter((i: any) => i && i.product && i.product._id) : [];
    } catch {
      return [];
    }
  });

  const [savedForLaterItems, setSavedForLaterItems] = useState<CartItem[]>(() => {
    const savedLater = localStorage.getItem('evan_guest_saved_for_later');
    if (!savedLater) return [];
    try {
      const parsed = JSON.parse(savedLater);
      return Array.isArray(parsed) ? parsed.filter((i: any) => i && i.product && i.product._id) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  useEffect(() => {
    if (user) {
      // Merge guest cart if items exist
      const guestSaved = localStorage.getItem('evan_guest_cart');
      let guestItems: any[] = [];
      try {
        guestItems = guestSaved ? JSON.parse(guestSaved) : [];
      } catch {
        guestItems = [];
      }

      const validGuestItems = Array.isArray(guestItems)
        ? guestItems.filter((i: any) => i && i.product && i.product._id)
        : [];

      if (validGuestItems.length > 0) {
        cartApi
          .mergeCart(
            validGuestItems.map((i: any) => ({
              productId: i.product._id,
              size: i.size,
              color: i.color,
              quantity: i.quantity,
              price: i.price,
            }))
          )
          .then((data) => {
            localStorage.removeItem('evan_guest_cart');
            if (data && data.items) {
              setCartItems(data.items.filter((i: any) => i && i.product && i.product._id));
            }
            if (data && data.savedForLater) {
              setSavedForLaterItems(data.savedForLater.filter((i: any) => i && i.product && i.product._id));
            }
          })
          .catch(() => fetchUserCart());
      } else {
        fetchUserCart();
      }
    }
  }, [user]);

  const fetchUserCart = () => {
    cartApi
      .getCart()
      .then((data) => {
        if (data && data.items) {
          setCartItems(data.items.filter((i: any) => i && i.product && i.product._id));
        }
        if (data && data.savedForLater) {
          setSavedForLaterItems(data.savedForLater.filter((i: any) => i && i.product && i.product._id));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) {
      const validItems = cartItems.filter((i) => i && i.product && i.product._id);
      localStorage.setItem('evan_guest_cart', JSON.stringify(validItems));
      const validSaved = savedForLaterItems.filter((i) => i && i.product && i.product._id);
      localStorage.setItem('evan_guest_saved_for_later', JSON.stringify(validSaved));
    }
  }, [cartItems, savedForLaterItems, user]);

  const addToCart = async (product: Product, size: string, color: string, quantity: number = 1) => {
    if (!product || !product._id) return;
    const itemPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

    setCartItems((prev) => {
      const validPrev = prev.filter((item) => item && item.product && item.product._id);
      const existingIdx = validPrev.findIndex(
        (item) => item.product._id === product._id && item.size === size && item.color === color
      );

      if (existingIdx > -1) {
        const updated = [...validPrev];
        const maxStock = product.stock !== undefined ? product.stock : 99;
        updated[existingIdx].quantity = Math.min(updated[existingIdx].quantity + quantity, maxStock);
        return updated;
      }

      return [
        ...validPrev,
        {
          product,
          size,
          color,
          quantity,
          price: itemPrice,
        },
      ];
    });

    showToast(`Added ${product.name ? product.name.slice(0, 30) : 'Item'}... to Bag`, 'success');

    if (user) {
      try {
        const res = await cartApi.addToCart({
          productId: product._id,
          size,
          color,
          quantity,
          price: itemPrice,
        });
        if (res && res.items) {
          setCartItems(res.items.filter((i: any) => i && i.product && i.product._id));
        }
      } catch {}
    }
  };

  const removeFromCart = async (indexOrId: number | string) => {
    const targetItem = typeof indexOrId === 'number' ? cartItems[indexOrId] : cartItems.find((i) => i && i._id === indexOrId);

    setCartItems((prev) =>
      typeof indexOrId === 'number' ? prev.filter((_, idx) => idx !== indexOrId) : prev.filter((i) => i && i._id !== indexOrId)
    );

    showToast('Item removed from shopping bag', 'info');

    if (user && targetItem && targetItem._id) {
      try {
        const res = await cartApi.removeFromCart(targetItem._id);
        if (res && res.items) {
          setCartItems(res.items.filter((i: any) => i && i.product && i.product._id));
        }
      } catch {}
    }
  };

  const updateQuantity = async (index: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(index);
      return;
    }
    const targetItem = cartItems[index];
    const availableStock = targetItem?.product?.stock !== undefined ? targetItem.product.stock : 99;

    if (quantity > availableStock) {
      showToast(`Maximum quantity available in stock is ${availableStock}`, 'info');
    }

    const cappedQuantity = Math.min(quantity, availableStock);

    setCartItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].quantity = cappedQuantity;
      }
      return updated;
    });

    if (user && targetItem && targetItem._id) {
      try {
        const res = await cartApi.updateQuantity(targetItem._id, cappedQuantity);
        if (res && res.items) {
          setCartItems(res.items.filter((i: any) => i && i.product && i.product._id));
        }
      } catch {}
    }
  };

  const saveForLater = async (indexOrId: number | string) => {
    const targetItem = typeof indexOrId === 'number' ? cartItems[indexOrId] : cartItems.find((i) => i && i._id === indexOrId);
    if (!targetItem) return;

    setCartItems((prev) =>
      typeof indexOrId === 'number' ? prev.filter((_, idx) => idx !== indexOrId) : prev.filter((i) => i && i._id !== indexOrId)
    );

    setSavedForLaterItems((prev) => [...prev, targetItem]);
    showToast('Item moved to Save For Later', 'success');

    if (user && targetItem._id) {
      try {
        const res = await cartApi.saveForLater(targetItem._id);
        if (res && res.items) {
          setCartItems(res.items.filter((i: any) => i && i.product && i.product._id));
        }
        if (res && res.savedForLater) {
          setSavedForLaterItems(res.savedForLater.filter((i: any) => i && i.product && i.product._id));
        }
      } catch {}
    }
  };

  const moveToCartFromSaved = async (indexOrId: number | string) => {
    const targetItem = typeof indexOrId === 'number' ? savedForLaterItems[indexOrId] : savedForLaterItems.find((i) => i && i._id === indexOrId);
    if (!targetItem) return;

    setSavedForLaterItems((prev) =>
      typeof indexOrId === 'number' ? prev.filter((_, idx) => idx !== indexOrId) : prev.filter((i) => i && i._id !== indexOrId)
    );

    setCartItems((prev) => [...prev, targetItem]);
    showToast('Item moved back to Shopping Bag', 'success');

    if (user && targetItem._id) {
      try {
        const res = await cartApi.moveToCart(targetItem._id);
        if (res && res.items) {
          setCartItems(res.items.filter((i: any) => i && i.product && i.product._id));
        }
        if (res && res.savedForLater) {
          setSavedForLaterItems(res.savedForLater.filter((i: any) => i && i.product && i.product._id));
        }
      } catch {}
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);

    if (user) {
      try {
        await cartApi.clearCart();
      } catch {}
    } else {
      localStorage.removeItem('evan_guest_cart');
    }
    showToast('Shopping bag cleared', 'info');
  };

  const applyCouponCode = (code: string, discountAmount: number) => {
    setAppliedCoupon({ code, discountAmount });
    showToast(`Coupon '${code}' applied successfully!`, 'success');
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed', 'info');
  };

  const validCartItems = cartItems.filter((item) => item && item.product && item.product._id);
  const subtotal = validCartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  
  // Calculate total MRP savings
  const totalMrp = validCartItems.reduce((acc, item) => {
    const mrp = item.product.mrp || Math.round((item.price || 0) * 1.25);
    return acc + mrp * (item.quantity || 1);
  }, 0);

  const itemDiscount = Math.max(0, totalMrp - subtotal);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const couponDiscount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discountAmount) : 0;
  const total = Math.max(0, subtotal + tax - couponDiscount);
  const totalSavings = itemDiscount + couponDiscount;
  const totalItemsCount = validCartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const getItemQuantityInCart = (productId: string, size?: string, color?: string): number => {
    if (!productId || !cartItems.length) return 0;
    const matchingItems = cartItems.filter((i) => {
      if (!i || !i.product || i.product._id !== productId) return false;
      if (size && i.size !== size) return false;
      if (color && i.color !== color) return false;
      return true;
    });
    return matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const updateCartItemQuantityByProductId = async (
    product: Product,
    newQuantity: number,
    size: string = 'Free Size',
    color: string = 'Royal Red'
  ) => {
    if (!product || !product._id) return;
    const effectiveColor = product.colors && product.colors.length > 0 ? product.colors[0] : color;

    const existingIndex = cartItems.findIndex(
      (item) => item && item.product && item.product._id === product._id && (size ? item.size === size : true)
    );

    if (existingIndex > -1) {
      if (newQuantity <= 0) {
        await removeFromCart(existingIndex);
      } else {
        await updateQuantity(existingIndex, newQuantity);
      }
    } else if (newQuantity > 0) {
      await addToCart(product, size, effectiveColor, newQuantity);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLaterItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCartFromSaved,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        subtotal,
        tax,
        discount: couponDiscount,
        total,
        totalSavings,
        totalItemsCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
        getItemQuantityInCart,
        updateCartItemQuantityByProductId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

