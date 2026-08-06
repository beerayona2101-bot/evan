import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { AddToCartButton } from '../components/AddToCartButton';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 'Free Size', product.colors?.[0] || 'Royal Red');
    removeFromWishlist(product._id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/40 text-slate-900 flex flex-col items-center justify-center py-20 px-4 text-center font-sans">
        <div className="w-20 h-20 rounded-full bg-red-100/80 text-red-800 flex items-center justify-center mb-4 border border-amber-300 shadow-md">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-street text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">YOUR WISHLIST IS EMPTY</h2>
        <p className="text-xs text-slate-600 font-semibold mt-1 max-w-sm">
          Save your favorite heirloom Banarasi, Kanchipuram & Organza sarees to buy later.
        </p>
        <Link
          to="/shop"
          className="mt-6 px-8 py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300 flex items-center gap-2"
        >
          <span>EXPLORE CATALOG</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-200 pb-4 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 block">SAVED SAREE COLLECTIONS</span>
            <h1 className="font-street text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              MY WISHLIST ({wishlist.length})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-slate-500 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg border border-amber-200 bg-white"
            >
              Clear Entire Wishlist
            </button>
            <Link
              to="/shop"
              className="text-xs font-extrabold text-red-800 hover:underline flex items-center gap-1"
            >
              + Add More Sarees
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
            return (
              <div
                key={product._id}
<<<<<<< HEAD
                className="group bg-white rounded-3xl p-4 border border-amber-200/90 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3">
=======
                className="group bg-white rounded-2xl border border-amber-200/90 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
>>>>>>> e82de53 (color and ui changed)
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.images[0] || '/images/saree_banarasi_red.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-slate-700 hover:text-red-700 flex items-center justify-center shadow transition-all"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

<<<<<<< HEAD
                <div className="space-y-2 text-center">
=======
                <div className="p-3 space-y-2 text-center">
>>>>>>> e82de53 (color and ui changed)
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                    {product.fabric || product.category}
                  </span>

                  <Link to={`/product/${product._id}`}>
                    <h4 className="font-serif-luxury font-bold text-sm text-slate-900 line-clamp-1 hover:text-red-800 transition-colors">
                      {product.name}
                    </h4>
                  </Link>

                  <div className="font-extrabold text-red-800 text-base">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </div>

                  <AddToCartButton product={product} className="py-2 text-xs" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

