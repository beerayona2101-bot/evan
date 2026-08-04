import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Award, ArrowLeft, Check, Sparkles, Share2, Ruler, Eye } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { AISizeCalculator } from '../components/AISizeCalculator';
import { VirtualTryOnModal } from '../components/VirtualTryOnModal';
import { AIRecommendations } from '../components/AIRecommendations';
import { AddToCartButton } from '../components/AddToCartButton';
import { reviewApi } from '../services/reviewApi';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ToastContainer';
import { Review } from '../types';
import { useSocket } from '../context/SocketContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('Royal Crimson Red & Gold');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'care'>('specs');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // AI Feature Modals State
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { socket } = useSocket();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setSelectedImage(res.data.images[0]);
        }
        if (res.data.colors && res.data.colors.length > 0) {
          setSelectedColor(res.data.colors[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    reviewApi
      .getProductReviews(id)
      .then((res) => setReviews(res))
      .catch(() => {});
  }, [id]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!socket || !id) return;

    const handleProductUpdated = (updatedProd: Product) => {
      if (updatedProd._id === id) {
        setProduct((prev) => (prev ? { ...prev, ...updatedProd } : updatedProd));
        showToast('Live Update: Saree details updated by Admin', 'info');
      }
    };

    const handleInventoryUpdated = (data: { productId: string; stock: number }) => {
      if (data.productId === id) {
        setProduct((prev) => (prev ? { ...prev, stock: data.stock } : prev));
        showToast(`Live Stock Update: ${data.stock} units available`, 'info');
      }
    };

    const handleReviewUpdated = (data: { productId: string; review: any }) => {
      if (data.productId === id) {
        setReviews((prev) => [data.review, ...prev]);
      }
    };

    socket.on('productUpdated', handleProductUpdated);
    socket.on('inventoryUpdated', handleInventoryUpdated);
    socket.on('reviewUpdated', handleReviewUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
      socket.off('inventoryUpdated', handleInventoryUpdated);
      socket.off('reviewUpdated', handleReviewUpdated);
    };
  }, [socket, id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to write a review', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim() || !id) return;

    setSubmittingReview(true);
    try {
      const created = await reviewApi.createReview({
        productId: id,
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews((prev) => [created, ...prev]);
      setNewComment('');
      showToast('Review submitted successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Saree Details...</p>
        </div>
      </div>
    );
  }

  const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const mrp = product.mrp || Math.round(product.price * 1.25);

  const handleBuyNow = () => {
    addToCart(product, 'Free Size', product.colors[0] || 'Royal Red');
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-3 sm:py-5 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Back Link */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 hover:text-red-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Saree Catalog
        </Link>

        {/* Main Product Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start bg-white p-4 sm:p-6 rounded-3xl border border-amber-200 shadow-xl">

          {/* Left Saree Gallery Container */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-h-[45vh] sm:max-h-[55vh] lg:max-h-[440px] w-full rounded-2xl overflow-hidden bg-amber-50/30 border border-amber-200/90 shadow-md group mx-auto flex items-center justify-center p-2">
              <img
                src={selectedImage || product.images[0] || '/images/saree_banarasi_red.png'}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500 cursor-zoom-in rounded-xl"
              />
              <span className="absolute top-3 left-3 bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-amber-300">
                PURE SILK MARK
              </span>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-amber-50/30 p-1 ${
                      selectedImage === img ? 'border-red-800 shadow-md scale-105 bg-white' : 'border-amber-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details & Buy Actions */}
          <div className="lg:col-span-6 space-y-3">
            <div className="space-y-1">
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 hover:text-red-800 block transition-colors"
              >
                {product.fabric || product.category}
              </Link>
              <h1 className="font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              
              {/* Ratings */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex items-center text-amber-500 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">4.9 / 5.0</span>
                <span className="text-xs text-slate-400">({product.numReviews || 42} Verified Reviews)</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="bg-amber-50/60 p-3 sm:p-4 rounded-2xl border border-amber-200 space-y-0.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-red-800">₹{displayPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400 line-through">MRP ₹{mrp.toLocaleString('en-IN')}</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  SAVE {product.discountPercentage || 20}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">Inclusive of all taxes. Free express shipping across India.</p>
            </div>

            {/* Key Saree Attributes List */}
            <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-amber-100 text-[11px] font-semibold">
              <div>
                <span className="text-slate-400 block uppercase text-[9px]">Fabric Material</span>
                <span className="text-slate-900 font-bold">{product.fabric || 'Pure Mulberry Silk'}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px]">Blouse Piece</span>
                <span className="text-slate-900 font-bold">{product.blousePiece || 'Includes Unstitched Blouse (0.8m)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px]">Border Type</span>
                <span className="text-slate-900 font-bold">{product.borderType || 'Heavy Gold Zari Temple Border'}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px]">Saree Length</span>
                <span className="text-slate-900 font-bold">5.5 Meters + 0.8m Blouse</span>
              </div>
            </div>

            {/* Color Selection (Replacing clothing sizes with Saree Color Options) */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Available Colors:</span>
                  <span className="text-amber-800 font-bold normal-case font-sans">({selectedColor})</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  In Stock & Ready to Ship
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {((product?.colors && product.colors.length > 0) ? product.colors : ['Royal Crimson Red', 'Pure Gold', 'Emerald Green', 'Royal Purple']).map((colorName) => {
                  const isSelected = selectedColor === colorName;
                  let dotBg = 'bg-red-700';
                  if (colorName.toLowerCase().includes('gold') || colorName.toLowerCase().includes('mustard')) dotBg = 'bg-amber-400';
                  else if (colorName.toLowerCase().includes('green') || colorName.toLowerCase().includes('emerald') || colorName.toLowerCase().includes('mint')) dotBg = 'bg-emerald-700';
                  else if (colorName.toLowerCase().includes('purple')) dotBg = 'bg-purple-800';
                  else if (colorName.toLowerCase().includes('pink') || colorName.toLowerCase().includes('blush')) dotBg = 'bg-pink-400';
                  else if (colorName.toLowerCase().includes('beige') || colorName.toLowerCase().includes('linen')) dotBg = 'bg-amber-200';
                  else if (colorName.toLowerCase().includes('blue')) dotBg = 'bg-blue-800';

                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-slate-950 text-amber-300 border-amber-400 shadow-md ring-2 ring-amber-400/30 scale-[1.02]'
                          : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${dotBg} border border-white/60 shadow-sm flex-shrink-0`} />
                      <span>{colorName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>



            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <AddToCartButton product={product} size={selectedColor} variant="full" className="w-full sm:flex-1" />
              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-3 bg-red-800 hover:bg-red-900 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg border border-amber-300"
              >
                BUY NOW
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                  isInWishlist(product._id)
                    ? 'bg-red-50 border-red-800 text-red-800 shadow'
                    : 'bg-white border-amber-300 text-slate-700 hover:text-red-800'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-bold text-slate-600">
              <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col items-center gap-0.5">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Luxury Certified</span>
              </div>
              <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col items-center gap-0.5">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>Free Express Delivery</span>
              </div>
              <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col items-center gap-0.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specs, Care Instructions & Reviews */}
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center gap-6 border-b border-amber-100 pb-4">
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-xs font-extrabold uppercase tracking-wider transition-all pb-2 border-b-2 ${
                activeTab === 'specs' ? 'border-red-800 text-red-800 font-black' : 'border-transparent text-slate-400 hover:text-slate-900'
              }`}
            >
              PRODUCT SPECIFICATIONS
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-xs font-extrabold uppercase tracking-wider transition-all pb-2 border-b-2 ${
                activeTab === 'reviews' ? 'border-red-800 text-red-800 font-black' : 'border-transparent text-slate-400 hover:text-slate-900'
              }`}
            >
              CUSTOMER REVIEWS ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`text-xs font-extrabold uppercase tracking-wider transition-all pb-2 border-b-2 ${
                activeTab === 'care' ? 'border-red-800 text-red-800 font-black' : 'border-transparent text-slate-400 hover:text-slate-900'
              }`}
            >
              WASH & GARMENT CARE
            </button>
          </div>

          {activeTab === 'specs' ? (
            <div className="space-y-6 text-xs leading-relaxed text-slate-700 font-medium">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-1.5 tracking-wider">LUXURY CRAFT DESCRIPTION</h4>
                <p className="text-slate-600 leading-relaxed font-normal text-xs">{product.description}</p>
              </div>

              {/* Comprehensive Product Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">CLOTH & FABRIC TYPE</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.clothType || product.fabric || 'Pure Handloom Silk'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">{product.material || 'Mulberry Weave'}</span>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">THREAD & ZARI MATERIAL</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.threadMaterial || 'Tested Gold Zari & Fine Silk Threads'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">{product.workType || 'Jacquard Weave'}</span>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">COMFORT & BREATHABILITY</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.comfortLevel || 'Soft, Lightweight & Skin-Friendly'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">All-Day Festive Comfort</span>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">COLOR & DYE DETAILS</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.colorDetails || (product.colors && product.colors.join(', ')) || 'Royal Crimson Red & Gold'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Eco-Friendly Natural Dyes</span>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">DIMENSIONS & WEIGHT</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.sareeLength || '5.5 Meters Saree'} + {product.blousePiece || '0.8m Blouse'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Weight: {product.sareeWeight || product.weight || '650 Grams'}</span>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">GARMENT CARE</span>
                  <span className="font-bold text-slate-900 text-xs block">{product.washCare || 'Dry Clean Only'}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Store in Soft Muslin Cloth</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="space-y-6">
              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs">Write a Customer Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this saree (fabric quality, zari shine, drape)..."
                  required
                  className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-slate-900 hover:bg-red-800 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl transition shadow"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{rev.userName || 'Verified Buyer'}</span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs leading-relaxed text-slate-600 space-y-3 font-medium">
              <p>• Dry Clean Only. Avoid machine washing or harsh detergents.</p>
              <p>• Store wrapped in pure cotton or muslin fabric to preserve metallic zari sheen.</p>
              <p>• Iron on low heat setting inside out with a protective cloth layer.</p>
            </div>
          )}
        </div>

        {/* AI Recommendations Section */}
        <AIRecommendations currentProductId={product._id} currentCategory={product.category} />

        {/* AI Modals */}
        <AISizeCalculator
          isOpen={isSizeCalcOpen}
          onClose={() => setIsSizeCalcOpen(false)}
          productTitle={product.name}
          category={product.category}
          onSelectSize={(color) => setSelectedColor(color)}
        />

        <VirtualTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={{
            id: product._id,
            name: product.name,
            price: displayPrice,
            image: selectedImage || product.images[0] || '',
            category: product.category
          }}
        />
      </div>
    </div>
  );
};
