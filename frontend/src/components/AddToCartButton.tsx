import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from './ToastContainer';

interface AddToCartButtonProps {
  product: Product;
  size?: string;
  color?: string;
  className?: string;
  variant?: 'compact' | 'full';
  variantId?: string;
  variantImage?: string;
  sku?: string;
  customPrice?: number;
  hexColor?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  size = 'Free Size',
  color,
  className = '',
  variant = 'compact',
  variantId,
  variantImage,
  sku,
  customPrice,
  hexColor,
}) => {
  const { addToCart, getItemQuantityInCart, updateCartItemQuantityByProductId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const effectiveColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Royal Red');

  const quantityInCart = getItemQuantityInCart(product._id, size);
  const maxStock = product.stock !== undefined ? product.stock : 99;

  const checkAuth = (): boolean => {
    if (!user) {
      showToast('Please log in to add sarees to your cart or wishlist', 'info');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth()) return;
    if (quantityInCart < maxStock) {
      updateCartItemQuantityByProductId(product, quantityInCart + 1, size, effectiveColor);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth()) return;
    updateCartItemQuantityByProductId(product, quantityInCart - 1, size, effectiveColor);
  };

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!checkAuth()) return;
    addToCart(
      product,
      size,
      effectiveColor,
      1,
      variantId,
      variantImage,
      sku,
      customPrice,
      hexColor
    );
  };

  // State 2: Item is in Cart -> Transform into Interactive Quantity Controller (- quantity +) with Light Gold Active Color
  if (quantityInCart > 0) {
    if (variant === 'full') {
      return (
        <div
          className={`flex items-center justify-between bg-amber-100 text-amber-950 rounded-xl p-1.5 border-2 border-amber-300 shadow-sm ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDecrement}
            className="w-11 h-11 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 flex items-center justify-center transition-all active:scale-95"
            title="Decrease Quantity"
          >
            <Minus className="w-5 h-5 stroke-[3]" />
          </button>

          <span className="text-base font-black text-amber-950 px-4 tracking-wider">
            {quantityInCart}
          </span>

          <button
            onClick={handleIncrement}
            disabled={quantityInCart >= maxStock}
            className="w-11 h-11 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
            title="Increase Quantity"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      );
    }

    // Compact Mode (for Product Cards) - Vibrant Light Gold Active State
    return (
      <div
        className={`w-full mt-1.5 py-1 px-1 bg-amber-100 border-2 border-amber-300 text-amber-950 rounded-lg text-xs font-black shadow-sm flex items-center justify-between ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDecrement}
          className="w-7 h-7 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-950 flex items-center justify-center transition-all active:scale-95"
          title="Decrease"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <span className="px-2 text-xs font-black text-amber-950 tracking-wider">
          {quantityInCart}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantityInCart >= maxStock}
          className="w-7 h-7 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-950 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          title="Increase"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    );
  }

  // State 1: Item Not in Cart -> Soft Light Gold "ADD TO BAG" Button
  if (variant === 'full') {
    return (
      <button
        onClick={handleInitialAdd}
        className={`w-full py-4 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border border-amber-300 flex items-center justify-center gap-2 ${className}`}
      >
        <ShoppingBag className="w-4 h-4 text-amber-800" /> ADD TO BAG
      </button>
    );
  }

  return (
    <button
      onClick={handleInitialAdd}
      className={`w-full mt-1.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all shadow-sm border border-amber-300 flex items-center justify-center gap-1 ${className}`}
    >
      <ShoppingBag className="w-2.5 h-2.5 text-amber-800" /> ADD TO BAG
    </button>
  );
};
