import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartDrawerOpen,
    closeCartDrawer,
    removeFromCart,
    updateQuantity,
    subtotal,
    tax,
    total,
    totalItemsCount,
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleMoveToWishlist = (idx: number) => {
    const item = cartItems[idx];
    if (item && item.product) {
      toggleWishlist(item.product);
      removeFromCart(idx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between border-l border-amber-200">
          
          {/* Drawer Header */}
          <div className="p-5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 block">EVAN SAREE BAG</span>
                <h3 className="font-street text-xl font-black text-slate-900 leading-tight">
                  MY BAG ({totalItemsCount})
                </h3>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              className="p-2 text-slate-500 hover:text-red-800 transition-colors focus:outline-none rounded-full hover:bg-amber-100"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {cartItems.filter(i => i && i.product && i.product._id).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-street text-2xl font-black text-slate-900">YOUR BAG IS EMPTY</h4>
                  <p className="text-xs text-slate-500 font-semibold max-w-xs">
                    Explore our exquisite selection of handcrafted Banarasi, Kanchipuram & Organza sarees.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="mt-2 px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black uppercase tracking-widest rounded-xl border border-amber-300 shadow-sm transition-all"
                >
                  Explore Saree Catalog
                </button>
              </div>
            ) : (
              cartItems.filter(i => i && i.product && i.product._id).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex gap-3 items-center group relative hover:border-amber-300 transition-all"
                >
                  <Link
                    to={`/product/${item.product._id}`}
                    onClick={closeCartDrawer}
                    className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-amber-200 flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0] || '/images/saree_banarasi_red.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <Link
                        to={`/product/${item.product._id}`}
                        onClick={closeCartDrawer}
                        className="font-serif-luxury font-bold text-xs text-slate-900 line-clamp-1 hover:text-red-800 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-slate-400 hover:text-red-700 p-0.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 font-semibold">
                      Size: <span className="text-slate-900 font-bold">{item.size}</span> | Color: <span className="text-slate-900 font-bold">{item.color}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-lg p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-amber-100"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-black px-1 text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-amber-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-xs text-slate-900 block">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMoveToWishlist(idx)}
                      className="text-[9.5px] text-amber-800 font-bold hover:underline flex items-center gap-1 pt-0.5"
                    >
                      <Heart className="w-3 h-3 text-red-700" /> Move to Wishlist
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-amber-200 shadow-xl space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>GST Tax (5%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Pan-India Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-amber-200 pt-2">
                  <span>Total Amount</span>
                  <span className="text-slate-900 font-street text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/cart');
                  }}
                  className="py-3 bg-amber-100/70 hover:bg-amber-200 text-slate-900 font-black text-[11px] uppercase tracking-wider rounded-xl border border-amber-300 transition-all text-center"
                >
                  View Shopping Bag
                </button>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/checkout');
                  }}
                  className="py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[11px] uppercase tracking-wider rounded-xl border border-amber-300 shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
