import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Sparkles, Heart, Star, ShoppingBag, Play, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ToastContainer';
import { AddToCartButton } from '../components/AddToCartButton';
import { formatSareeName } from '../utils/sareeUtils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cms, setCms] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('evan_homepage_cms');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [active3DIndex, setActive3DIndex] = useState(2);
  const [prevActiveIndex, setPrevActiveIndex] = useState(2);
  const active3DIndexRef = useRef(active3DIndex);
  const wheelLockRef = useRef(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { socket } = useSocket();

  useEffect(() => {
    active3DIndexRef.current = active3DIndex;
  }, [active3DIndex]);

  const handleSelectCard = (targetIdx: number) => {
    const cardsCount = sareeCollectionCards?.length || 5;
    const normalizedTarget = (targetIdx + cardsCount) % cardsCount;
    setPrevActiveIndex(active3DIndexRef.current);
    setActive3DIndex(normalizedTarget);
    active3DIndexRef.current = normalizedTarget;
  };

  const fetchCMS = () => {
    api
      .get('/homepage')
      .then((res) => {
        if (res.data) {
          setCms(res.data);
          try {
            localStorage.setItem('evan_homepage_cms', JSON.stringify(res.data));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const fetchProducts = () => {
    api
      .get('/products')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setFeaturedProducts(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCMS();
    fetchProducts();
  }, []);

  // Autoplay hero saree carousel slides dynamically across all active slides
  const heroSlidesCount = (cms?.heroSlides && cms.heroSlides.length > 0) ? cms.heroSlides.length : 3;

  useEffect(() => {
    if (heroSlidesCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlidesCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlidesCount]);

  // Listen to real-time Socket.IO broadcasts
  useEffect(() => {
    if (!socket) return;

    socket.on('homepageCMSUpdated', (updatedCms: any) => {
      if (updatedCms) {
        setCms(updatedCms);
        try {
          localStorage.setItem('evan_homepage_cms', JSON.stringify(updatedCms));
        } catch {}
      }
    });

    socket.on('productCreated', fetchProducts);
    socket.on('productUpdated', fetchProducts);
    socket.on('productDeleted', fetchProducts);

    return () => {
      socket.off('homepageCMSUpdated');
      socket.off('productCreated', fetchProducts);
      socket.off('productUpdated', fetchProducts);
      socket.off('productDeleted', fetchProducts);
    };
  }, [socket]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const diff = mouseStartX - e.clientX;
    if (Math.abs(diff) > 35) {
      const cardsCount = sareeCollectionCards?.length || 5;
      const curr = active3DIndexRef.current;
      if (diff > 0) {
        handleSelectCard((curr + 1) % cardsCount);
      } else {
        handleSelectCard((curr - 1 + cardsCount) % cardsCount);
      }
      setIsMouseDown(false);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    if (Math.abs(diff) > 35) {
      const cardsCount = sareeCollectionCards?.length || 5;
      const curr = active3DIndexRef.current;
      if (diff > 0) {
        handleSelectCard((curr + 1) % cardsCount);
      } else {
        handleSelectCard((curr - 1 + cardsCount) % cardsCount);
      }
      setTouchStart(null);
    }
  };

  const handleWheelScroll = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 10) {
      wheelLockRef.current = true;
      const cardsCount = sareeCollectionCards?.length || 5;
      const curr = active3DIndexRef.current;
      if (delta > 0) {
        handleSelectCard((curr + 1) % cardsCount);
      } else {
        handleSelectCard((curr - 1 + cardsCount) % cardsCount);
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    }
  };

  // Modern saree collection cards for 3D selection carousel with direct category navigation links
  const defaultModernCards = [
    { id: 's1', title: 'Modern Lightweight Organza Floral', tag: 'PARTYWEAR ORGANZA', price: '$115.00 USD', rupeePrice: '₹6,999', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Organza Sarees' },
    { id: 's2', title: 'Fancy Tissue Zari Shimmer Saree', tag: 'MODERN TISSUE', price: '$190.00 USD', rupeePrice: '₹12,499', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Silk Sarees' },
    { id: 's3', title: 'Royal Crimson Banarasi Partywear', tag: 'TRENDING BANARASI', price: '$160.00 USD', rupeePrice: '₹9,999', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Banarasi Sarees' },
    { id: 's4', title: 'Glamour Sequenced Purple Georgette', tag: 'PARTYWEAR GEORGETTE', price: '$220.00 USD', rupeePrice: '₹14,999', image: '/images/saree_banarasi_purple.png', buttonLink: '/shop?category=Designer Sarees' },
    { id: 's5', title: 'Handwoven Peacock Paithani Silk', tag: 'PAITHANI SILK', price: '$280.00 USD', rupeePrice: '₹17,999', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Paithani Sarees' },
    { id: 's6', title: 'Pure Artisan Soft Linen Saree', tag: 'LIGHTWEIGHT LINEN', price: '$95.00 USD', rupeePrice: '₹4,499', image: '/images/saree_linen_beige.png', buttonLink: '/shop?category=Linen Sarees' },
    { id: 's7', title: 'Mustard Temple Zari Kanchipuram', tag: 'KANCHIPURAM SILK', price: '$240.00 USD', rupeePrice: '₹14,999', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Kanchipuram Sarees' },
    { id: 's8', title: 'Contemporary Floral Chiffon Drape', tag: 'TRENDY CHIFFON', price: '$135.00 USD', rupeePrice: '₹8,499', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Designer Sarees' },
  ];

  const sareeCollectionCards = cms?.featuredCategories && cms.featuredCategories.length >= 1
    ? cms.featuredCategories.map((cat: any, i: number) => {
        const catName = cat.name || defaultModernCards[i % defaultModernCards.length].title;
        const link = cat.buttonLink || `/shop?category=${encodeURIComponent(catName)}`;
        return {
          id: cat.id || cat._id || `sc-${i}`,
          title: cat.name || defaultModernCards[i % defaultModernCards.length].title,
          tag: (cat.tag || cat.name || 'SILK').toUpperCase().replace(' SAREES', ''),
          price: cat.price || defaultModernCards[i % defaultModernCards.length].price,
          rupeePrice: cat.rupeePrice || defaultModernCards[i % defaultModernCards.length].rupeePrice,
          image: cat.image || defaultModernCards[i % defaultModernCards.length].image,
          buttonLink: link,
        };
      })
    : defaultModernCards;

  // Autoplay 3D Saree Selection Carousel every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const cardsCount = sareeCollectionCards?.length || 8;
      const nextIndex = (active3DIndexRef.current + 1) % cardsCount;
      setPrevActiveIndex(active3DIndexRef.current);
      setActive3DIndex(nextIndex);
      active3DIndexRef.current = nextIndex;
    }, 2000);
    return () => clearInterval(timer);
  }, [sareeCollectionCards?.length]);

  const hero = cms?.heroBanner || {
    enabled: true,
    offerBadge: 'ROYAL SAREE COLLECTION 2026',
    subtitle: 'HERITAGE HANDLOOM',
    title: 'STYLE CLASSIC',
    description: "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans.",
    primaryButtonText: 'SEE MORE',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'EXPLORE CATALOG',
    secondaryButtonLink: '/shop?category=Kanchipuram Sarees',
    desktopImage: '/images/saree_banarasi_red.png',
  };

  const heroImage = cms?.heroBanner?.desktopImage || '/images/saree_hero_editorial_right_seated.png';

  const defaultHeroSlides = [
    {
      id: 'traditional',
      offerBadge: hero.offerBadge || 'ROYAL SAREE COLLECTION 2026',
      subtitle: hero.subtitle || 'HERITAGE HANDLOOM',
      title: hero.title || 'STYLE CLASSIC',
      description: hero.description || "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans.",
      primaryButtonText: hero.primaryButtonText || 'SEE MORE',
      primaryButtonLink: hero.primaryButtonLink || '/shop',
      secondaryButtonText: hero.secondaryButtonText || 'EXPLORE CATALOG',
      secondaryButtonLink: hero.secondaryButtonLink || '/shop?category=Kanchipuram Sarees',
      image: heroImage,
      displayOrder: 1,
    },
    {
      id: 'fashion',
      offerBadge: 'TRENDING FASHION WEAR 2026',
      subtitle: 'MODERN DESIGNER DRAPES',
      title: 'FASHION WEAR',
      description: 'Discover sleek contemporary silhouettes, lightweight organza & tissue sarees, and modern fusion drapes curated for the trendsetting fashionista.',
      primaryButtonText: 'EXPLORE FASHION',
      primaryButtonLink: '/shop?category=Designer Sarees',
      secondaryButtonText: 'EXPLORE CATALOG',
      secondaryButtonLink: '/shop',
      image: '/images/saree_fashion_wear_hero_v3.png',
      displayOrder: 2,
    },
    {
      id: 'party',
      offerBadge: 'EXCLUSIVE PARTYWEAR 2026',
      subtitle: 'CELEBRATION GLAMOUR',
      title: 'PARTY COLLECTIONS',
      description: 'Elevate your evening look with opulent sequence work, shimmering tissue zari, vibrant georgettes, and grand festive partywear drapes.',
      primaryButtonText: 'SHOP PARTYWEAR',
      primaryButtonLink: '/shop?category=Organza Sarees',
      secondaryButtonText: 'EXPLORE CATALOG',
      secondaryButtonLink: '/shop',
      image: '/images/saree_party_wear_hero_v3.png',
      displayOrder: 3,
    },
  ];

  const rawHeroSlides = (cms?.heroSlides && cms.heroSlides.length > 0)
    ? cms.heroSlides.filter((s: any) => s.status !== 'INACTIVE')
    : defaultHeroSlides;

  const heroSlides = [...rawHeroSlides].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const safeSlideIndex = heroSlides.length > 0 ? (currentHeroSlide % heroSlides.length) : 0;
  const activeSlide = heroSlides[safeSlideIndex] || heroSlides[0] || defaultHeroSlides[0];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans overflow-x-hidden pt-0 mt-0">

      {/* 1. LUXURY SAREE HERO BANNER SECTION - 100% FULL-BLEED EDITORIAL BANNER CAROUSEL (3 SLIDES) */}
      {hero.enabled && (
        <section className="relative w-full mb-6 group mt-0 pt-0">
          <div className="relative w-full overflow-hidden bg-[#0b070d] min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
            
            {/* Full-bleed Background Images Carousel displaying model face & full saree drape */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {heroSlides.map((slide: any, idx: number) => (
                <img
                  key={slide.id || idx}
                  src={slide.image}
                  alt={`Kanchanika Saree - ${slide.title}`}
                  className={`absolute inset-0 w-full h-full object-cover object-[75%_center] sm:object-right filter brightness-[0.95] contrast-[1.05] transition-opacity duration-700 ease-in-out ${
                    idx === safeSlideIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
                  }`}
                />
              ))}
              {/* Left-to-right gradient overlay for text readability & seamless integration */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#09050b] via-[#09050b]/80 to-transparent w-[70%] sm:w-[58%] lg:w-[50%] z-10" />
            </div>

            {/* Left Content Area (Overlaid on the dark left gradient) */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 py-8 sm:py-12">
              <div key={activeSlide.id || safeSlideIndex} className="space-y-3 sm:space-y-5 max-w-[85%] sm:max-w-xl flex flex-col justify-center animate-fadeIn">
                
                {/* Gold Pill Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/50 text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase w-fit shadow-md">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>{activeSlide.offerBadge}</span>
                </div>

                {/* Subtitle & Main Headline */}
                <div className="space-y-1 sm:space-y-1.5">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] text-amber-500">
                    {activeSlide.subtitle}
                  </span>
                  <h1 className="font-street text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none uppercase drop-shadow-md">
                    {activeSlide.title}
                  </h1>
                </div>

                {/* Description Text */}
                <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-lg line-clamp-3 sm:line-clamp-none">
                  {activeSlide.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1">
                  <Link
                    to={activeSlide.primaryButtonLink || '/shop'}
                    className="px-5 py-2.5 sm:px-7 sm:py-3 bg-slate-950/80 hover:bg-slate-900 text-amber-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all border border-amber-400/50 flex items-center gap-1.5 sm:gap-2"
                  >
                    <span>{activeSlide.primaryButtonText || 'SEE MORE'}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  </Link>
                  <Link
                    to={activeSlide.secondaryButtonLink || '/shop'}
                    className="px-5 py-2.5 sm:px-7 sm:py-3 bg-black/30 hover:bg-black/50 text-slate-200 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl border border-amber-400/40 transition-all shadow-sm"
                  >
                    {activeSlide.secondaryButtonText || 'EXPLORE CATALOG'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Right Floating Collection Badge */}
            <Link
              to={activeSlide.secondaryButtonLink || '/shop'}
              className="absolute bottom-5 right-5 sm:right-12 z-20 hidden md:flex items-center gap-2 sm:gap-4 bg-[#09050b]/80 backdrop-blur-md px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-bold shadow-2xl hover:bg-[#09050b] hover:border-amber-400 transition-all group"
            >
              <span>View Full Saree Collection</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Interactive Left/Right Carousel Arrows & Slide Dots */}
            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-red-900 text-amber-300 border border-amber-400/40 backdrop-blur-md transition-all shadow-lg hover:scale-110"
                  aria-label="Previous Hero Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-red-900 text-amber-300 border border-amber-400/40 backdrop-blur-md transition-all shadow-lg hover:scale-110"
                  aria-label="Next Hero Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Slide Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/30">
                  {heroSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentHeroSlide(dotIdx)}
                      className={`h-2.5 rounded-full transition-all ${
                        dotIdx === safeSlideIndex
                          ? 'w-7 bg-amber-400 border border-amber-300 shadow'
                          : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Jump to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        </section>
      )}

      {/* 2. 5-TILE EDITORIAL SAREE LOOKBOOK GALLERY (PROPORTIONALLY SCALED FOR SINGLE-SCREEN FIT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 my-8 py-2">
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-amber-200/90 shadow-md space-y-4">
          <div className="text-center space-y-0.5">
            <h2 className="font-street text-3xl sm:text-4xl text-slate-900 tracking-wider">EDITORIAL LOOKBOOK GALLERY</h2>
            <p className="text-[10px] sm:text-xs text-amber-800 font-bold uppercase tracking-widest">Curated Saree Collections • Click Any Tile To Explore</p>
          </div>

          {/* Dynamic 5-Tile Lookbook Gallery from CMS */}
          {(() => {
            const cols = cms?.featuredCollections || [];
            const tile1 = cols[0] || { name: 'Banarasi Zari Brocade Collection', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Banarasi Sarees', buttonText: 'Explore' };
            const tile2 = cols[1] || { name: 'Kanchipuram Temple Border', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Kanchipuram Sarees', buttonText: 'Explore' };
            const tile3 = cols[2] || { name: 'LUXURY SILK SAREES', image: '/images/saree_banarasi_purple.png', buttonLink: '/shop?category=Silk Sarees', buttonText: 'SHOP SILK COLLECTION', description: 'Discover handcrafted mulberry silk sarees & heirloom zari drapes.' };
            const tile4 = cols[3] || { name: 'Paithani Peacock Pallu', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Paithani Sarees', buttonText: 'Explore' };
            const tile5 = cols[4] || { name: 'Scalloped Floral Organza', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Organza Sarees', buttonText: 'Explore' };

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 h-auto md:h-[400px]">
                {/* Tile 1 & 2 */}
                <div className="md:col-span-4 grid grid-rows-2 gap-3.5 h-full min-h-[360px] md:min-h-full">
                  <Link
                    to={tile1.buttonLink || '/shop?category=Banarasi Sarees'}
                    className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block h-full min-h-[170px]"
                  >
                    <img
                      src={tile1.image || '/images/saree_banarasi_red.png'}
                      alt={tile1.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-3.5 justify-between">
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">{tile1.name}</span>
                      <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {tile1.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>

                  <Link
                    to={tile2.buttonLink || '/shop?category=Kanchipuram Sarees'}
                    className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block h-full min-h-[170px]"
                  >
                    <img
                      src={tile2.image || '/images/saree_kanchipuram_gold.png'}
                      alt={tile2.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-3.5 justify-between">
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">{tile2.name}</span>
                      <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {tile2.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Tile 3 (Featured Large Center Tile) */}
                <div className="md:col-span-4 h-full min-h-[320px] md:min-h-full">
                  <Link
                    to={tile3.buttonLink || '/shop?category=Silk Sarees'}
                    className="relative h-full rounded-2xl overflow-hidden group border border-amber-200 bg-slate-900 block"
                  >
                    <img
                      src={tile3.image || '/images/saree_banarasi_purple.png'}
                      alt={tile3.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-800 text-amber-300 border border-amber-300 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow z-10">
                      EDITOR'S CHOICE
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-5">
                      <div className="w-full">
                        <h3 className="text-amber-300 font-street text-2xl sm:text-3xl tracking-wide group-hover:text-white transition-colors">{tile3.name}</h3>
                        <p className="text-slate-200 text-xs mt-0.5">{tile3.description || 'Discover handcrafted mulberry silk sarees & heirloom zari drapes.'}</p>
                        <div className="mt-2.5 inline-flex items-center gap-2 text-xs font-black text-amber-400 uppercase group-hover:translate-x-1 transition-transform">
                          <span>{tile3.buttonText || 'SHOP SILK COLLECTION'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Tile 4 & 5 */}
                <div className="md:col-span-4 grid grid-rows-2 gap-3.5 h-full min-h-[360px] md:min-h-full">
                  <Link
                    to={tile4.buttonLink || '/shop?category=Paithani Sarees'}
                    className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block h-full min-h-[170px]"
                  >
                    <img
                      src={tile4.image || '/images/saree_paithani_green.png'}
                      alt={tile4.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-3.5 justify-between">
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">{tile4.name}</span>
                      <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {tile4.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>

                  <Link
                    to={tile5.buttonLink || '/shop?category=Organza Sarees'}
                    className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block h-full min-h-[170px]"
                  >
                    <img
                      src={tile5.image || '/images/saree_organza_floral.png'}
                      alt={tile5.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-3.5 justify-between">
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">{tile5.name}</span>
                      <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {tile5.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 3. INTERACTIVE SELECTION SAREE CAROUSEL WITH DIRECT COLLECTION RELOCATION */}
      {cms?.trendingSarees?.enabled !== false && (
        <section className="bg-white my-10 py-10 border-y border-amber-200/80 shadow-sm relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center mb-8">
            <h2 className="font-street text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wider uppercase">
              {cms?.trendingSarees?.title || 'DIVE INTO A WORLD OF ENDLESS SAREE POSSIBILITIES'}
            </h2>
          </div>

          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onWheel={handleWheelScroll}
            className="max-w-6xl mx-auto px-4 relative min-h-[480px] flex items-center justify-center perspective-[1200px] touch-pan-x cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-full h-[450px] flex items-center justify-center transform-style-3d">
              {sareeCollectionCards.map((card: any, idx: number) => {
                const count = sareeCollectionCards.length;

                let prevOff = idx - prevActiveIndex;
                if (prevOff > Math.floor(count / 2)) prevOff -= count;
                if (prevOff < -Math.floor(count / 2)) prevOff += count;

                let normOffset = idx - active3DIndex;
                if (normOffset > Math.floor(count / 2)) normOffset -= count;
                if (normOffset < -Math.floor(count / 2)) normOffset += count;

                const isWrapping = Math.abs(prevOff - normOffset) > 2;

                const isActive = normOffset === 0;
                const rotateY = normOffset * -30;
                const translateX = normOffset * 220;
                const translateZ = -Math.abs(normOffset) * 110;
                const scale = isActive ? 1.08 : Math.max(0.72, 1 - Math.abs(normOffset) * 0.14);
                const opacity = Math.abs(normOffset) > 2 ? 0 : Math.max(0.35, 1 - Math.abs(normOffset) * 0.3);
                const zIndex = 30 - Math.abs(normOffset) * 5;

                return (
                  <div
                    key={card.id || idx}
                    onClick={() => {
                      if (isActive) {
                        navigate(card.buttonLink);
                      } else {
                        handleSelectCard(idx);
                      }
                    }}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity: opacity,
                      zIndex: zIndex,
                      transformStyle: 'preserve-3d',
                      transition: isWrapping
                        ? 'opacity 300ms ease-in-out'
                        : 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1), opacity 700ms ease-out',
                    }}
                    className={`absolute top-0 cursor-pointer ${
                      isActive
                        ? 'shadow-2xl border-2 border-red-800 rounded-3xl w-72 sm:w-80 h-[440px]'
                        : 'border border-amber-300 hover:border-amber-400 rounded-2xl w-64 sm:w-72 h-[400px] hover:shadow-xl'
                    } bg-slate-900 overflow-hidden flex flex-col justify-between p-5 select-none group`}
                  >
                    <img
                      src={card.image || '/images/saree_banarasi_red.png'}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Top Tag Pill - Small & Strictly Single Line */}
                    <div className="relative z-10 flex items-center justify-between gap-1.5 w-full">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 group-hover:bg-amber-100 group-hover:text-amber-950 transition-colors text-[8.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm border border-amber-200/60 whitespace-nowrap truncate max-w-[65%]">
                        {card.tag}
                      </span>
                      {isActive && (
                        <span className="bg-red-100 text-red-950 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm border border-red-300 whitespace-nowrap">
                          VIEW COLLECTION
                        </span>
                      )}
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="relative z-10 text-left text-white space-y-1.5">
                      <h4 className="font-serif-luxury font-extrabold text-base line-clamp-1 text-amber-200 group-hover:text-amber-300 group-hover:scale-[1.02] transition-all duration-300">
                        {card.title}
                      </h4>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-bold text-amber-300 group-hover:text-white transition-colors block">{card.price}</span>
                          <span className="text-[11px] font-extrabold text-slate-300 group-hover:text-amber-200 transition-colors">{card.rupeePrice}</span>
                        </div>
                        {isActive ? (
                          <Link
                            to={card.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-amber-300 transition-all"
                          >
                            <span>SHOP COLLECTION</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
                          </Link>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-amber-100 group-hover:text-amber-950 text-white flex items-center justify-center transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. NEW SAREE ARRIVALS GRID WITH DIRECT PRODUCT LINKING */}
      {cms?.newArrivals?.enabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center mb-10 space-y-1">
            <h2 className="font-street text-4xl sm:text-5xl text-slate-900 tracking-wider">
              {cms?.newArrivals?.title || 'NEW SAREE ARRIVALS'}
            </h2>
            <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">
              {cms?.newArrivals?.subtitle || 'Freshly Woven Artisan Sarees Added Today'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, cms?.newArrivals?.maxItems || 4).map((product, idx) => {
              const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
              return (
                <div key={idx} className="group bg-white rounded-2xl border border-amber-200/90 hover:border-amber-400 hover:shadow-2xl transition-all flex flex-col justify-between overflow-hidden">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.images[0] || '/images/saree_banarasi_red.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    </Link>
                    <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                      <span className="bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow border border-amber-300">
                        {product.category || 'PURE SILK'}
                      </span>
                      <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        NEW
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) {
                          showToast('Please log in to add sarees to your wishlist', 'info');
                          navigate('/login');
                          return;
                        }
                        toggleWishlist(product);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-red-700 shadow"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current text-red-700' : ''}`} />
                    </button>
                  </div>

                  <div className="p-3 text-center space-y-1">
                    <Link to={`/product/${product._id}`}>
                      <h4 className="font-serif-luxury font-bold text-sm text-slate-900 line-clamp-1 hover:text-red-800 transition-colors" title={formatSareeName(product.name, product.category, false, product._id)}>
                        {formatSareeName(product.name, product.category, false, product._id)}
                      </h4>
                    </Link>
                    <div className="flex items-center justify-center gap-1 text-amber-500 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 font-bold">
                      <span className="text-slate-400 text-xs line-through">₹{(product.mrp || product.price + 2000).toLocaleString('en-IN')}</span>
                      <span className="text-red-800 text-base font-black">₹{displayPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. CUSTOMER TESTIMONIALS */}
      {cms?.testimonials && cms.testimonials.length > 0 && (
        <section className="bg-amber-50/60 py-16 border-t border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-800 block">REAL VERIFIED REVIEWS</span>
              <h2 className="font-street text-4xl sm:text-5xl text-slate-900 tracking-tight">WHAT OUR ROYAL CLIENTS SAY</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cms.testimonials.map((test: any) => (
                <div key={test.id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-3 text-left">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 italic font-medium leading-relaxed font-serif-luxury">"{test.review}"</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-300 font-black text-sm flex items-center justify-center border border-amber-300">
                      {test.customerName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{test.customerName}</h5>
                      <span className="text-[10px] text-amber-800 font-extrabold uppercase">{test.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

