import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const mrp = product.mrp || Math.round(product.price * 1.25);

  return (
    <div className="group bg-white rounded-xl p-2 sm:p-2.5 border border-amber-200/80 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Ultra Compact Saree Image Container */}
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-amber-50/30 mb-1.5">
        <Link to={`/product/${product._id}`} className="w-full h-full block">
          <img
            src={product.images[0] || '/images/saree_banarasi_red.png'}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/saree_banarasi_red.png';
            }}
            className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10">
          <span className="bg-red-800 text-amber-300 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-full shadow border border-amber-300">
            {product.category.includes('Silk') ? 'PURE SILK' : 'HANDLOOM'}
          </span>
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-full shadow">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Action Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-700 shadow transition-all z-10"
          title="Add to Wishlist"
        >
          <Heart className={`w-3 h-3 ${isInWishlist(product._id) ? 'fill-current text-red-700' : ''}`} />
        </button>
      </div>

      {/* Saree Info */}
      <div className="space-y-0.5 text-center">
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="text-[8.5px] font-black uppercase tracking-wider text-amber-800 group-hover:text-red-700 block line-clamp-1 transition-colors"
        >
          {product.fabric || product.category}
        </Link>
        
        <Link to={`/product/${product._id}`} className="block">
          <h4 className="font-serif-luxury font-bold text-[11px] leading-tight text-slate-900 line-clamp-1 group-hover:text-red-700 transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-0.5 text-amber-500 text-[9px]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-2 h-2 fill-current" />
          ))}
          <span className="text-[8px] text-slate-500 font-bold ml-0.5">({product.numReviews || 24})</span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-center justify-center gap-1 font-bold pt-0.5">
          <span className="text-slate-400 text-[9px] line-through">₹{mrp.toLocaleString('en-IN')}</span>
          <span className="text-red-800 text-xs font-black">₹{displayPrice.toLocaleString('en-IN')}</span>
        </div>

        {/* Quick Add Button with Dynamic Quantity Control */}
        <AddToCartButton product={product} />
      </div>
    </div>
  );
};
