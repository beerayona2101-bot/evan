import React from 'react';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface AddToCartButtonProps {
  product: Product;
  size?: string;
  color?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  size = 'Free Size',
  color,
  className = '',
  variant = 'compact',
}) => {
  const { getItemQuantityInCart, updateCartItemQuantityByProductId } = useCart();
  const effectiveColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Royal Red');

  const quantityInCart = getItemQuantityInCart(product._id, size);
  const maxStock = product.stock !== undefined ? product.stock : 99;

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart < maxStock) {
      updateCartItemQuantityByProductId(product, quantityInCart + 1, size, effectiveColor);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartItemQuantityByProductId(product, quantityInCart - 1, size, effectiveColor);
  };

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartItemQuantityByProductId(product, 1, size, effectiveColor);
  };

  // State 2: Item is in Cart -> Transform into Interactive Quantity Controller (- quantity +) with Light Gold Active Color
  if (quantityInCart > 0) {
    if (variant === 'full') {
      return (
        <div
          className={`flex items-center justify-between bg-amber-400 text-slate-950 rounded-xl p-1.5 border-2 border-slate-900 shadow-xl ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDecrement}
            className="w-11 h-11 rounded-lg bg-amber-500/35 hover:bg-slate-900 hover:text-amber-300 text-slate-950 flex items-center justify-center transition-all active:scale-95"
            title="Decrease Quantity"
          >
            <Minus className="w-5 h-5 stroke-[3]" />
          </button>

          <span className="text-base font-black text-slate-950 px-4 tracking-wider">
            {quantityInCart}
          </span>

          <button
            onClick={handleIncrement}
            disabled={quantityInCart >= maxStock}
            className="w-11 h-11 rounded-lg bg-amber-500/35 hover:bg-slate-900 hover:text-amber-300 text-slate-950 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
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
        className={`w-full mt-1.5 py-1 px-1 bg-amber-400 border-2 border-slate-900 text-slate-950 rounded-lg text-xs font-black shadow-md flex items-center justify-between ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDecrement}
          className="w-7 h-7 rounded bg-amber-500/35 hover:bg-slate-900 hover:text-amber-300 text-slate-950 flex items-center justify-center transition-all active:scale-95"
          title="Decrease"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <span className="px-2 text-xs font-black text-slate-950 tracking-wider">
          {quantityInCart}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantityInCart >= maxStock}
          className="w-7 h-7 rounded bg-amber-500/35 hover:bg-slate-900 hover:text-amber-300 text-slate-950 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          title="Increase"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    );
  }

  // State 1: Item Not in Cart -> Standard Navy "ADD TO BAG" Button
  if (variant === 'full') {
    return (
      <button
        onClick={handleInitialAdd}
        className={`w-full py-4 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg border border-amber-400/40 flex items-center justify-center gap-2 ${className}`}
      >
        <ShoppingBag className="w-4 h-4" /> ADD TO BAG
      </button>
    );
  }

  return (
    <button
      onClick={handleInitialAdd}
      className={`w-full mt-1.5 py-1.5 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1 ${className}`}
    >
      <ShoppingBag className="w-2.5 h-2.5" /> ADD TO BAG
    </button>
  );
};
