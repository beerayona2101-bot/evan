import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Award, ArrowLeft, Check, Sparkles, Share2, Ruler, Eye } from 'lucide-react';
import { Product, ProductVariant } from '../types';
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
import { formatSareeName } from '../utils/sareeUtils';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
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
        const prodData: Product = res.data;
        setProduct(prodData);
        
        // Check for variants
        if (prodData.variants && prodData.variants.length > 0) {
          const defaultVar = prodData.variants.find((v) => v.isDefault) || prodData.variants[0];
          setSelectedVariant(defaultVar);
          setSelectedColor(defaultVar.colorName);
          const initialImg = defaultVar.featuredImage || defaultVar.images[0] || prodData.images[0];
          setSelectedImage(initialImg);
        } else {
          if (prodData.images && prodData.images.length > 0) {
            setSelectedImage(prodData.images[0]);
          }
          if (prodData.colors && prodData.colors.length > 0) {
            setSelectedColor(prodData.colors[0]);
          }
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
        if (updatedProd.variants && updatedProd.variants.length > 0) {
          if (selectedVariant) {
            const match = updatedProd.variants.find((v) => v._id === selectedVariant._id || v.sku === selectedVariant.sku);
            if (match) {
              setSelectedVariant(match);
            }
          }
        }
        showToast('Live Update: Saree details & variants updated by Admin', 'info');
      }
    };

    const handleInventoryUpdated = (data: { productId: string; stock: number }) => {
      if (data.productId === id) {
        setProduct((prev) => (prev ? { ...prev, stock: data.stock } : prev));
        showToast(`Live Stock Update: ${data.stock} units available`, 'info');
      }
    };

    const handleVariantUpdated = (data: { productId: string; variant?: any }) => {
      if (data.productId === id) {
        showToast('Live Variant Gallery Update', 'info');
      }
    };

    const handleReviewUpdated = (data: { productId: string; review: any }) => {
      if (data.productId === id) {
        setReviews((prev) => [data.review, ...prev]);
      }
    };

    socket.on('productUpdated', handleProductUpdated);
    socket.on('inventoryUpdated', handleInventoryUpdated);
    socket.on('variantUpdated', handleVariantUpdated);
    socket.on('reviewUpdated', handleReviewUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
      socket.off('inventoryUpdated', handleInventoryUpdated);
      socket.off('variantUpdated', handleVariantUpdated);
      socket.off('reviewUpdated', handleReviewUpdated);
    };
  }, [socket, id, selectedVariant]);

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

  // SAREE MULTI-ANGLE GALLERY MAPPING (Front View, Side View, Pallu Close-Up, Back View)
  const SAREE_ANGLE_MAP: Record<string, string[]> = {
    '/images/saree_paithani_green.png': [
      '/images/saree_paithani_green.png',
      '/images/saree_paithani_green_side.png',
      '/images/saree_paithani_green_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_banarasi_red.png': [
      '/images/saree_banarasi_red.png',
      '/images/saree_banarasi_red_side.png',
      '/images/saree_banarasi_red_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_kanchipuram_gold.png': [
      '/images/saree_kanchipuram_gold.png',
      '/images/saree_kanchipuram_gold_side.png',
      '/images/saree_kanchipuram_gold_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_banarasi_purple.png': [
      '/images/saree_banarasi_purple.png',
      '/images/saree_banarasi_purple_side.png',
      '/images/saree_banarasi_purple_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_linen_beige.png': [
      '/images/saree_linen_beige.png',
      '/images/saree_linen_beige_side.png',
      '/images/saree_linen_beige_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_organza_floral.png': [
      '/images/saree_organza_floral.png',
      '/images/saree_organza_floral_side.png',
      '/images/saree_organza_floral_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_chanderi_pastel.png': [
      '/images/saree_chanderi_pastel.png',
      '/images/saree_organza_floral_side.png',
      '/images/saree_organza_floral_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_bandhani_royal_maroon.png': [
      '/images/saree_bandhani_royal_maroon.png',
      '/images/saree_banarasi_red_side.png',
      '/images/saree_banarasi_red_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_kanchipuram_crimson.png': [
      '/images/saree_kanchipuram_crimson.png',
      '/images/saree_kanchipuram_gold_side.png',
      '/images/saree_kanchipuram_gold_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_organza_pink.png': [
      '/images/saree_organza_pink.png',
      '/images/saree_organza_floral_side.png',
      '/images/saree_organza_floral_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
    '/images/saree_bridal_trousseau.png': [
      '/images/saree_bridal_trousseau.png',
      '/images/saree_banarasi_red_side.png',
      '/images/saree_banarasi_red_pallu.png',
      '/images/saree_paithani_green_back.png',
    ],
  };

  const currentMainImg = selectedImage || (selectedVariant && selectedVariant.images && selectedVariant.images[0]) || (product && product.images && product.images[0]) || '/images/saree_paithani_green.png';

  const rawGallery: string[] = (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : (product && product.images && product.images.length > 0 ? product.images : [currentMainImg]);

  const activeGalleryImages: string[] = SAREE_ANGLE_MAP[currentMainImg] || (SAREE_ANGLE_MAP[rawGallery[0]] ? SAREE_ANGLE_MAP[rawGallery[0]] : [
    currentMainImg,
    '/images/saree_paithani_green_side.png',
    '/images/saree_paithani_green_pallu.png',
    '/images/saree_paithani_green_back.png',
  ]);

  // Listen to ArrowLeft / ArrowRight gallery navigation events (placed unconditionally BEFORE early returns)
  useEffect(() => {
    if (!activeGalleryImages || activeGalleryImages.length <= 1) return;
    const handleGallery = (e: any) => {
      const currentIdx = activeGalleryImages.indexOf(selectedImage || activeGalleryImages[0]);
      const dir = e.detail?.direction;
      let nextIdx = 0;
      if (dir === 'prev') {
        nextIdx = (currentIdx - 1 + activeGalleryImages.length) % activeGalleryImages.length;
      } else {
        nextIdx = (currentIdx + 1) % activeGalleryImages.length;
      }
      setSelectedImage(activeGalleryImages[nextIdx]);
    };

    window.addEventListener('navigateGallery', handleGallery as EventListener);
    return () => window.removeEventListener('navigateGallery', handleGallery as EventListener);
  }, [activeGalleryImages, selectedImage]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Saree Details & Gallery...</p>
        </div>
      </div>
    );
  }

  const displayPrice = selectedVariant ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price) : (product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price);
  const mrp = selectedVariant ? (selectedVariant.mrp || Math.round(selectedVariant.price * 1.25)) : (product.mrp || Math.round(product.price * 1.25));
  const activeStock = selectedVariant ? selectedVariant.stock : (product.stock !== undefined ? product.stock : 25);
  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;

  const handleSelectColorVariant = (variantOrColor: ProductVariant | string) => {
    if (typeof variantOrColor === 'string') {
      setSelectedColor(variantOrColor);
      if (product.variants && product.variants.length > 0) {
        const match = product.variants.find((v) => v.colorName.toLowerCase() === variantOrColor.toLowerCase());
        if (match) {
          setSelectedVariant(match);
          const firstImg = match.featuredImage || match.images[0] || product.images[0];
          setSelectedImage(firstImg);
        }
      }
    } else {
      setSelectedVariant(variantOrColor);
      setSelectedColor(variantOrColor.colorName);
      const firstImg = variantOrColor.featuredImage || variantOrColor.images[0] || product.images[0];
      setSelectedImage(firstImg);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Please log in to purchase sarees', 'info');
      navigate('/login');
      return;
    }
    const itemPrice = selectedVariant ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price) : displayPrice;
    const variantImg = (selectedVariant && selectedVariant.images && selectedVariant.images[0]) || selectedImage || product.images[0];

    addToCart(
      product,
      'Free Size',
      selectedColor,
      1,
      selectedVariant?._id || selectedVariant?.sku,
      variantImg,
      selectedVariant?.sku || product.sku,
      itemPrice,
      selectedVariant?.hexColor
    );
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      showToast('Please log in to add sarees to your wishlist', 'info');
      navigate('/login');
      return;
    }
    toggleWishlist(product);
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

          {/* Left Saree Gallery Container with Vertical Thumbnails & Zero Empty Space */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 lg:gap-4 items-start">
            
            {/* Left Vertical Thumbnails Strip (i1, i2, i3, i4...) */}
            {activeGalleryImages && activeGalleryImages.length > 0 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-none sm:max-h-[500px] w-full sm:w-auto py-1 custom-scrollbar flex-shrink-0">
                {activeGalleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View saree image ${idx + 1}`}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-amber-50/40 p-0.5 shadow-sm ${
                      (selectedImage || activeGalleryImages[0]) === img
                        ? 'border-red-800 ring-2 ring-red-800/20 shadow-md scale-105 bg-white'
                        : 'border-amber-200/80 opacity-70 hover:opacity-100 hover:border-amber-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Preview Card - Full Fit Cover without Empty Margins */}
            <div className="relative flex-1 aspect-[3/4] sm:aspect-[3/4] lg:aspect-[3/4] max-h-[500px] sm:max-h-[520px] w-full rounded-2xl overflow-hidden bg-amber-50/20 border border-amber-200 shadow-md group">
              <img
                src={selectedImage || activeGalleryImages[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              />

              <span className="absolute top-3 left-3 bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow border border-amber-300">
                PURE SILK MARK
              </span>

              {/* Variant Badge overlay */}
              {selectedVariant && (
                <span className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur text-amber-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-400/40 shadow-lg">
                  {selectedVariant.colorName} ({activeGalleryImages.length} Shots)
                </span>
              )}
            </div>

          </div>

          {/* Right Product Details & Buy Actions */}
          <div className="lg:col-span-6 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Link
                  to={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 hover:text-red-800 block transition-colors"
                >
                  {product.fabric || product.category}
                </Link>
                <span className="text-[10px] font-mono font-bold text-slate-400">SKU: {activeSku}</span>
              </div>

              <h1 className="font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {formatSareeName(product.name, product.category)}
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

            {/* Dynamic Price Row */}
            <div className="bg-amber-50/60 p-3 sm:p-4 rounded-2xl border border-amber-200 space-y-0.5 shadow-sm">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400 line-through">MRP ₹{mrp.toLocaleString('en-IN')}</span>
                <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
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
                <span className="text-slate-400 block uppercase text-[9px]">Stock Availability</span>
                <span className={`font-bold ${activeStock > 5 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {activeStock > 0 ? `In Stock (${activeStock} Units Left)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Luxury Color Swatches & Cards */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Select Color Variant:</span>
                  <span className="text-amber-800 font-bold normal-case font-sans">({selectedColor})</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Instant Gallery Sync
                </span>
              </div>

              {/* Render Structured Color Variants if available */}
              {product.variants && product.variants.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id || selectedVariant?.sku === v.sku || selectedColor === v.colorName;
                    const isOutOfStock = v.stock === 0 || v.status === 'inactive';
                    return (
                      <button
                        key={v.sku || v.colorName}
                        disabled={isOutOfStock}
                        onClick={() => !isOutOfStock && handleSelectColorVariant(v)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-slate-950 text-amber-300 border-amber-400 shadow-md ring-2 ring-amber-400/40 scale-105'
                            : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                        title={isOutOfStock ? `${v.colorName} - OUT OF STOCK` : v.colorName}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0 relative overflow-hidden"
                          style={{ backgroundColor: v.hexColor || '#800000' }}
                        >
                          {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-full h-0.5 bg-red-700 -rotate-45" />
                            </span>
                          )}
                        </span>

                        {/* ONLY THE SELECTED COLOR DISPLAYS ITS NAME */}
                        {isSelected && (
                          <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1">
                            <span>{v.colorName}</span>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="text-[8px] font-black uppercase text-red-700 bg-red-100 px-1 py-0.2 rounded border border-red-200">
                            OUT OF STOCK
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Fallback string colors */
                <div className="flex flex-wrap items-center gap-2.5">
                  {((product?.colors && product.colors.length > 0) ? product.colors : ['Royal Crimson Red', 'Pure Gold', 'Emerald Green', 'Royal Purple']).map((colorName, idx) => {
                    const isSelected = selectedColor === colorName;
                    const isOutOfStock = colorName.toLowerCase().includes('green') || idx === 2;
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
                        disabled={isOutOfStock}
                        onClick={() => !isOutOfStock && handleSelectColorVariant(colorName)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-slate-950 text-amber-300 border-amber-400 shadow-md ring-2 ring-amber-400/30 scale-105'
                            : 'bg-white text-slate-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${dotBg} border border-white shadow-sm flex-shrink-0 relative overflow-hidden`}>
                          {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-full h-0.5 bg-red-700 -rotate-45" />
                            </span>
                          )}
                        </span>

                        {/* ONLY THE SELECTED COLOR DISPLAYS ITS NAME */}
                        {isSelected && (
                          <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1">
                            <span>{colorName}</span>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="text-[8px] font-black uppercase text-red-700 bg-red-100 px-1 py-0.2 rounded border border-red-200">
                            OUT OF STOCK
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <AddToCartButton
                product={product}
                size="Free Size"
                color={selectedColor}
                variant="full"
                variantId={selectedVariant?._id || selectedVariant?.sku}
                variantImage={(selectedVariant && selectedVariant.images && selectedVariant.images[0]) || selectedImage || product.images[0]}
                sku={selectedVariant?.sku || product.sku}
                customPrice={selectedVariant ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price) : displayPrice}
                hexColor={selectedVariant?.hexColor}
                className="w-full sm:flex-1"
              />
              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-4 bg-red-800 hover:bg-red-900 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg border border-amber-300 flex items-center justify-center gap-1.5"
              >
                BUY NOW
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3.5 rounded-xl border transition-all ${
                  isInWishlist(product._id) ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-slate-700 border-amber-200 hover:border-amber-400'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current text-red-700' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
