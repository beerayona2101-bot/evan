import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Check, Bookmark, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponApi } from '../services/couponApi';
import { showToast } from '../components/ToastContainer';
import { ProductCard } from '../components/ProductCard';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    savedForLaterItems,
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
    discount,
    total,
    totalSavings,
  } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  
  // Confirmation Modal States
  const [itemToRemove, setItemToRemove] = useState<{ index: number; name: string; isSaved: boolean } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await couponApi.validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      applyCouponCode(res.code, res.discountAmount);
      setCouponCode('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      showToast(msg, 'error');
    }
  };

  const confirmRemoveItem = () => {
    if (!itemToRemove) return;
    if (itemToRemove.isSaved) {
      // Remove from saved items
      removeFromCart(itemToRemove.index);
    } else {
      removeFromCart(itemToRemove.index);
    }
    setItemToRemove(null);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const validCartItems = cartItems.filter((i) => i && i.product && i.product._id);
  const validSavedItems = savedForLaterItems.filter((i) => i && i.product && i.product._id);

  if (validCartItems.length === 0 && validSavedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center mx-auto border-2 border-amber-300 shadow-inner">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-slate-900">YOUR SHOPPING BAG IS EMPTY</h2>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            Discover our exquisite collection of pure silk, handcrafted Banarasi & Kanchipuram sarees tailored for timeless elegance.
          </p>
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300"
            >
              EXPLORE SAREE CATALOG <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recommended Sarees Grid */}
          <div className="pt-12 border-t border-amber-200/80 text-left space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Recommended For You
              </h3>
              <Link to="/shop" className="text-xs font-bold text-red-800 hover:underline">View All Sarees →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  _id: '6a702511162ab5cd258363b9',
                  name: 'Royal Royal Crimson Banarasi Katan Silk Saree',
                  price: 14187,
                  mrp: 18999,
                  discountPercentage: 25,
                  category: 'Banarasi Silk',
                  fabric: 'Pure Katan Silk',
                  images: ['/images/saree_banarasi_red.png'],
                  numReviews: 48,
                  rating: 4.9,
                },
                {
                  _id: '6a702511162ab5cd25836ba',
                  name: 'Imperial Emerald Kanchipuram Zari Brocade Saree',
                  price: 18500,
                  mrp: 24999,
                  discountPercentage: 26,
                  category: 'Kanchipuram Silk',
                  fabric: 'Mulberry Silk',
                  images: ['/images/saree_kanchipuram_green.png'],
                  numReviews: 32,
                  rating: 5.0,
                },
                {
                  _id: '6a702511162ab5cd25836bb',
                  name: 'Midnight Onyx Organza Handloom Silk Saree',
                  price: 9800,
                  mrp: 12999,
                  discountPercentage: 24,
                  category: 'Organza Silk',
                  fabric: 'Sheer Organza',
                  images: ['/images/saree_organza_black.png'],
                  numReviews: 29,
                  rating: 4.8,
                },
                {
                  _id: '6a702511162ab5cd25836bc',
                  name: 'Antique Gold Tissue Silk Festive Saree',
                  price: 22000,
                  mrp: 29999,
                  discountPercentage: 27,
                  category: 'Tissue Silk',
                  fabric: 'Gold Tissue',
                  images: ['/images/saree_tissue_gold.png'],
                  numReviews: 55,
                  rating: 4.9,
                },
              ].map((p) => (
                <ProductCard key={p._id} product={p as any} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-200/80 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 block">EVAN SAREE ATELIER</span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-slate-900">
              MY SHOPPING BAG ({validCartItems.length})
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs font-bold text-slate-500 hover:text-red-700 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Entire Bag
            </button>
            <Link
              to="/shop"
              className="text-xs font-bold text-red-800 hover:text-red-900 hover:underline flex items-center gap-1"
            >
              + Add More Sarees
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Cart Items Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {validCartItems.map((item, idx) => {
                const sku = item.product.sku || `EVAN-SKU-${item.product._id ? item.product._id.slice(-4) : idx + 100}`;
                const stock = item.product.stock !== undefined ? item.product.stock : 25;
                const deliveryEstDate = new Date(Date.now() + 4 * 84600000).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                const mrp = item.product.mrp || Math.round((item.price || 0) * 1.25);
                const discountPct = item.product.discountPercentage || 20;

                return (
                  <div
                    key={item._id || idx}
                    className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-md flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group hover:border-amber-300 transition-all"
                  >
                    {/* Thumbnail Image */}
                    <Link to={`/product/${item.product._id}`} className="w-24 aspect-[4/5] rounded-2xl overflow-hidden bg-amber-50/40 border border-amber-200 flex-shrink-0 p-1 flex items-center justify-center">
                      <img
                        src={item.product.images[0] || '/images/saree_banarasi_red.png'}
                        alt={item.product.name}
                        className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-2 w-full">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                            {item.product.category || 'Luxury Saree'} • {item.product.fabric || 'Pure Silk'}
                          </span>
                          <Link to={`/product/${item.product._id}`} className="hover:text-red-800 transition-colors">
                            <h3 className="font-serif-luxury font-bold text-base text-slate-900 leading-snug line-clamp-1">{item.product.name}</h3>
                          </Link>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">SKU: {sku}</span>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => setItemToRemove({ index: idx, name: item.product.name, isSaved: false })}
                          className="text-slate-400 hover:text-red-800 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Specs Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="bg-amber-50 text-slate-800 px-2.5 py-0.5 rounded-md border border-amber-200 text-[11px]">
                          Size: <strong>{item.size}</strong>
                        </span>
                        <span className="bg-amber-50 text-slate-800 px-2.5 py-0.5 rounded-md border border-amber-200 text-[11px]">
                          Color: <strong>{item.color}</strong>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          stock > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <span>🚚 Express Pan-India Delivery by <strong>{deliveryEstDate}</strong></span>
                      </p>

                      {/* Quantity & Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-amber-100 gap-3">
                        <div className="flex items-center gap-3">
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-amber-50/60 border border-amber-200 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-amber-200 flex items-center justify-center font-bold text-xs text-slate-800 hover:bg-amber-100 active:scale-95 transition"
                              title="Decrease Quantity"
                            >
                              -
                            </button>
                            <span className="text-xs font-black px-2 text-slate-900 font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                              disabled={item.quantity >= stock}
                              className="w-7 h-7 rounded-lg bg-white border border-amber-200 flex items-center justify-center font-bold text-xs text-slate-800 hover:bg-amber-100 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Increase Quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Save For Later */}
                          <button
                            onClick={() => saveForLater(idx)}
                            className="text-xs font-bold text-amber-800 hover:text-red-800 flex items-center gap-1 hover:underline transition"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> Save For Later
                          </button>
                        </div>

                        {/* Pricing */}
                        <div className="text-right">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-slate-400 line-through font-medium">₹{(mrp * item.quantity).toLocaleString('en-IN')}</span>
                            <span className="font-street font-black text-xl text-red-800">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-amber-800 uppercase block">
                            SAVE {discountPct}% (₹{((mrp - item.price) * item.quantity).toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved For Later Section */}
            {validSavedItems.length > 0 && (
              <div className="bg-amber-50/40 p-6 rounded-3xl border border-amber-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <h3 className="font-serif-luxury text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-amber-700" /> SAVED FOR LATER ({validSavedItems.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Items saved for future orders</span>
                </div>

                <div className="space-y-3">
                  {validSavedItems.map((item, idx) => (
                    <div key={item._id || idx} className="bg-white p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0] || '/images/saree_banarasi_red.png'}
                          alt={item.product.name}
                          className="w-14 aspect-[4/5] object-contain rounded-xl bg-amber-50/30 p-1 border border-amber-200"
                        />
                        <div>
                          <h4 className="font-serif-luxury font-bold text-sm text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs text-red-800 font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-400 ml-2">Size: {item.size} • Color: {item.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => moveToCartFromSaved(idx)}
                          className="px-4 py-2 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                        >
                          Move To Bag
                        </button>
                        <button
                          onClick={() => setItemToRemove({ index: idx, name: item.product.name, isSaved: true })}
                          className="p-2 text-slate-400 hover:text-red-700 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Comprehensive Cart Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xl space-y-4">
              <h2 className="font-serif-luxury text-2xl font-extrabold text-slate-900 border-b border-amber-200 pb-3">
                ORDER SUMMARY
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Apply Atelier Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. ROYAL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-amber-50/40 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:border-red-800 focus:outline-none uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl transition shadow-sm"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Coupon "{appliedCoupon.code}" Applied! Saved ₹{discount.toLocaleString('en-IN')}.
                    </p>
                    <button
                      type="button"
                      onClick={removeCouponCode}
                      className="text-[10px] text-red-700 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] font-bold text-red-700 pt-1">{couponError}</p>}
              </form>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-amber-100 pt-4 text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({validCartItems.length} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated GST (5%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Express Pan-India Shipping</span>
                  <span className="font-bold text-emerald-700 uppercase">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Luxury Box Packaging</span>
                  <span className="font-bold text-emerald-700 uppercase">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Platform Service Fee</span>
                  <span className="font-bold text-emerald-700 uppercase">WAIVED</span>
                </div>

                {totalSavings > 0 && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-bold text-center">
                    🎉 You save ₹{totalSavings.toLocaleString('en-IN')} on this luxury purchase!
                  </div>
                )}

                <div className="flex justify-between items-baseline text-base font-black text-slate-900 border-t border-amber-200 pt-3">
                  <span>Grand Total</span>
                  <span className="text-red-800 font-serif-luxury text-2xl font-black">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 transition border border-amber-300"
              >
                PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center gap-3 text-xs text-slate-700 font-semibold">
              <ShieldCheck className="w-6 h-6 text-amber-800 flex-shrink-0" />
              <span>100% Encrypted SSL Checkout. Guaranteed Authentic Pure Silk & 7-Day Easy Returns.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Item Remove Confirmation Modal */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif-luxury text-xl font-bold">Remove From Shopping Bag?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>"{itemToRemove.name}"</strong> from your bag? You can also save it for later instead of deleting it.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveItem}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition shadow"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif-luxury text-xl font-bold">Clear Entire Shopping Bag?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete all {validCartItems.length} items from your shopping bag? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition shadow"
              >
                Clear Entire Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
