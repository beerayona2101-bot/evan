import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Sparkles, Heart, Star, ShoppingBag, Play, Quote } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ToastContainer';
import { AddToCartButton } from '../components/AddToCartButton';
import { formatSareeName } from '../utils/sareeUtils';
import { prefetchRoute } from '../utils/prefetch';
import { prefetchApi } from '../services/api';

// Dual-tone heading helper: First half in black (text-slate-900), next half in red (text-red-800)
const renderDualToneHeading = (title: string, splitWordsCount?: number) => {
  if (!title) return null;
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return <span className="text-slate-900">{title}</span>;
  const splitAt = splitWordsCount !== undefined ? splitWordsCount : Math.ceil(words.length / 2);
  const first = words.slice(0, splitAt).join(' ');
  const second = words.slice(splitAt).join(' ');
  return (
    <>
      <span className="text-slate-900">{first}</span>{' '}
      <span className="text-red-800">{second}</span>
    </>
  );
};

// Ambient Weather & Time Greeting Helper
const getGreetingAndWeather = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good Morning', icon: '☀️', weatherMood: 'Sunny & Radiant' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good Afternoon', icon: '🌤️', weatherMood: 'Golden Daylight' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good Evening', icon: '🌅', weatherMood: 'Royal Sunset' };
  } else {
    return { greeting: 'Good Evening', icon: '🌙', weatherMood: 'Serene Night' };
  }
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greetingData, setGreetingData] = useState(getGreetingAndWeather());

  // Keep greeting refreshed
  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingData(getGreetingAndWeather());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
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

  // Testimonials with 4 royal client reviews (2 existing + 2 newly added)
  const defaultTestimonials = [
    {
      id: 'test-1',
      customerName: 'Priya Rajvanshi',
      location: 'Hyderabad, India',
      rating: 5,
      review: 'The Kanchipuram pure zari saree I ordered for my wedding was breathtaking. Authentic silk weave and magnificent craftsmanship!',
    },
    {
      id: 'test-2',
      customerName: 'Ananya Sharma',
      location: 'Mumbai, India',
      rating: 5,
      review: 'EVAN COLLECTIONS is the best luxury saree atelier! Fast shipping and 100% authentic handloom craftsmanship.',
    },
    {
      id: 'test-3',
      customerName: 'Deepika Reddy',
      location: 'Bengaluru, India',
      rating: 5,
      review: 'The Banarasi pure Katan silk drape is exquisite. The royal zari sheen and luxury box packaging felt like pure regal heritage.',
    },
    {
      id: 'test-4',
      customerName: 'Meera Krishnan',
      location: 'Chennai, India',
      rating: 5,
      review: 'Received my heirloom silk saree with official Silk Mark certification within 48 hours. The drape and rich fall are absolutely unmatched.',
    },
  ];

  const testimonialsList = React.useMemo(() => {
    const fromCms = cms?.testimonials && cms.testimonials.length > 0 ? cms.testimonials : [];
    if (fromCms.length >= 4) return fromCms;
    const combined = [...fromCms];
    for (const def of defaultTestimonials) {
      if (!combined.some((t: any) => (t.customerName || t.clientName) === def.customerName)) {
        combined.push(def);
      }
    }
    return combined;
  }, [cms?.testimonials]);

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Auto-change testimonial card every 1.5 seconds like a carousel
  useEffect(() => {
    if (testimonialsList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialsList.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [testimonialsList.length]);

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
    { id: 's2', title: 'Fancy Tissue Zari Shimmer Saree', tag: 'MODERN TISSUE', price: '$190.00 USD', rupeePrice: '₹12,499', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Royal Zari Brocade Sarees' },
    { id: 's3', title: 'Royal Crimson Banarasi Partywear', tag: 'TRENDING BANARASI', price: '$160.00 USD', rupeePrice: '₹9,999', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Banarasi Sarees' },
    { id: 's4', title: 'Glamour Sequenced Purple Georgette', tag: 'PARTYWEAR GEORGETTE', price: '$220.00 USD', rupeePrice: '₹14,999', image: '/images/saree_banarasi_purple.png', buttonLink: '/shop?category=Designer Sarees' },
    { id: 's5', title: 'Handwoven Peacock Paithani Silk', tag: 'PAITHANI SILK', price: '$280.00 USD', rupeePrice: '₹17,999', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Paithani Sarees' },
    { id: 's6', title: 'Pure Artisan Soft Linen Saree', tag: 'LIGHTWEIGHT LINEN', price: '$95.00 USD', rupeePrice: '₹4,499', image: '/images/saree_linen_beige.png', buttonLink: '/shop?category=Linen Sarees' },
    { id: 's7', title: 'Mustard Temple Zari Kanchipuram', tag: 'KANCHIPURAM SILK', price: '$240.00 USD', rupeePrice: '₹14,999', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Kanchipuram Sarees' },
    { id: 's8', title: 'Contemporary Floral Chiffon Saree', tag: 'TRENDY CHIFFON', price: '$135.00 USD', rupeePrice: '₹8,499', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Designer Sarees' },
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

  // Autoplay 3D Saree Selection Carousel every 4.5 seconds when tab is active
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const cardsCount = sareeCollectionCards?.length || 8;
      const nextIndex = (active3DIndexRef.current + 1) % cardsCount;
      setPrevActiveIndex(active3DIndexRef.current);
      setActive3DIndex(nextIndex);
      active3DIndexRef.current = nextIndex;
    }, 4500);
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
      id: 'timeless',
      offerBadge: 'TIMELESS ELEGANCE',
      subtitle: 'TIMELESS ELEGANCE',
      title: 'The Art of Elegance',
      titleLine1: 'The Art of',
      titleLine2: 'Elegance',
      description: 'Explore the Festive Collection',
      primaryButtonText: 'Shop Now',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'Explore Catalog',
      secondaryButtonLink: '/shop?category=Banarasi Sarees',
      image: '/images/aneera_editorial_plum_banner.jpg',
      displayOrder: 1,
    },
    {
      id: 'heritage',
      offerBadge: 'ROYAL HERITAGE',
      subtitle: 'ROYAL HERITAGE',
      title: 'The Grandeur of Tradition',
      titleLine1: 'The Grandeur of',
      titleLine2: 'Tradition',
      description: 'Handcrafted Kanchipuram Silk Heirlooms',
      primaryButtonText: 'Shop Now',
      primaryButtonLink: '/shop?category=Kanchipuram Sarees',
      secondaryButtonText: 'Explore Catalog',
      secondaryButtonLink: '/shop?category=Kanchipuram Sarees',
      image: '/images/aneera_editorial_emerald_banner.jpg',
      displayOrder: 2,
    },
    {
      id: 'bridal',
      offerBadge: 'BRIDAL SPLENDOR',
      subtitle: 'BRIDAL SPLENDOR',
      title: 'The Radiance of Royalty',
      titleLine1: 'The Radiance of',
      titleLine2: 'Royalty',
      description: 'Handwoven Pure Silk Bridal Trousseau',
      primaryButtonText: 'Shop Now',
      primaryButtonLink: '/shop?category=Bridal Sarees',
      secondaryButtonText: 'Explore Catalog',
      secondaryButtonLink: '/shop',
      image: '/images/aneera_editorial_crimson_banner.jpg',
      displayOrder: 3,
    },
  ];

  const rawHeroSlides = (cms?.heroSlides && cms.heroSlides.length > 0)
    ? cms.heroSlides.filter((s: any) => s.status !== 'INACTIVE')
    : defaultHeroSlides;

  const heroSlides = [...rawHeroSlides].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const safeSlideIndex = heroSlides.length > 0 ? (currentHeroSlide % heroSlides.length) : 0;
  const activeSlide = heroSlides[safeSlideIndex] || heroSlides[0] || defaultHeroSlides[0];

  const titleParts = (() => {
    if (activeSlide.titleLine1 && activeSlide.titleLine2) {
      return { line1: activeSlide.titleLine1, line2: activeSlide.titleLine2 };
    }
    const rawTitle = activeSlide.title || 'The Art of Elegance';
    const parts = rawTitle.split(' ');
    if (parts.length >= 3) {
      return { line1: parts.slice(0, -1).join(' '), line2: parts[parts.length - 1] };
    }
    if (parts.length === 2) {
      return { line1: parts[0], line2: parts[1] };
    }
    return { line1: 'The Art of', line2: rawTitle };
  })();

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans overflow-x-hidden pt-0 mt-0">

      {/* MOBILE ONLY: Luxury Ambient Weather Greeting & Welcome Card (with small gap from navbar) */}
      <div className="md:hidden px-3 pt-2.5 pb-1">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50/95 via-[#FFFDF9] to-amber-100/60 border border-amber-200/90 shadow-2xs px-3.5 py-2.5 select-none space-y-0.5">
          {/* Top Line: Weather / Time of Day Greeting */}
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900">
            <span className="text-base leading-none" role="img" aria-label="weather-icon">
              {greetingData.icon}
            </span>
            <span className="font-serif-luxury font-black text-sm tracking-wide text-slate-900">
              {greetingData.greeting}
            </span>
          </div>

          {/* Bottom Line (Underneath Good Morning): Welcome Note with Brand & Customer Name */}
          <div className="text-xs">
            {user ? (
              <Link to="/account" className="flex items-center gap-1.5 truncate group">
                <span className="text-slate-600 font-medium text-xs">Welcome to</span>
                <span className="font-street font-black text-red-800 tracking-wider text-xs">ANEERA SILKS</span>
                <span className="text-slate-400">,</span>
                <span className="font-extrabold text-amber-900 truncate max-w-[150px] text-xs">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 truncate group">
                <span className="text-slate-600 font-medium text-xs">Welcome to</span>
                <span className="font-street font-black text-red-800 tracking-wider text-xs">ANEERA SILKS</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 1. LUXURY SAREE HERO BANNER SECTION (Desktop: 100% Viewport Attached to Navbar / Mobile: Untouched Landscape Rectangular Card) */}
      {hero.enabled && (
        <section className="relative w-full mb-3 sm:mb-6 md:mb-10 group mt-2 sm:mt-3 md:mt-0 pt-0 px-3 sm:px-6 md:px-0">
          <div className="relative w-full overflow-hidden bg-[#0b070d] h-[200px] xs:h-[220px] sm:h-[260px] md:h-[calc(100vh-60px)] md:min-h-[500px] md:max-h-[820px] lg:max-h-[880px] xl:max-h-[960px] rounded-2xl md:rounded-none border border-amber-400/50 md:border-none shadow-md md:shadow-none flex items-center">
            
            {/* Full-bleed Background Images Carousel displaying model face & full saree drape */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {heroSlides.map((slide: any, idx: number) => (
                <img
                  key={slide.id || idx}
                  src={slide.image}
                  alt={`Aneera Silks Saree - ${slide.title}`}
                  {...({ fetchpriority: idx === 0 ? 'high' : 'auto' } as any)}
                  className={`absolute inset-0 w-full h-full object-cover object-[75%_center] md:object-[82%_top] lg:object-[85%_top] xl:object-[88%_top] filter brightness-[0.95] contrast-[1.05] transition-opacity duration-700 ease-in-out ${
                    idx === safeSlideIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
                  }`}
                />
              ))}
              {/* Gradient overlays:
                  - Mobile: left-to-right gradient for heading & button legibility on left, keeping model visible on right
                  - Desktop: left-to-right gradient overlay for text readability & seamless edge-to-edge navbar integration */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-r from-[#09050b]/95 via-[#09050b]/60 to-transparent w-[72%] z-10" />
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#09050b] via-[#09050b]/80 via-45% to-transparent w-[72%] sm:w-[62%] lg:w-[52%] z-10" />
            </div>

            {/* Mobile Touch Tap Overlay (Whole rectangular banner is clickable on mobile) */}
            <Link
              to={activeSlide.primaryButtonLink || '/shop'}
              onMouseEnter={() => prefetchRoute('shop')}
              onTouchStart={() => prefetchRoute('shop')}
              className="md:hidden absolute inset-0 z-30"
              aria-label={`Shop ${activeSlide.title}`}
            />

            {/* Content Area - Responsive for both Mobile and Desktop */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-4 xs:px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 h-full flex flex-col justify-center items-start py-3 sm:py-6 md:py-8 pointer-events-none md:pointer-events-auto">
              <div key={activeSlide.id || safeSlideIndex} className="space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-3.5 lg:space-y-4 max-w-[62%] xs:max-w-[65%] sm:max-w-md md:max-w-xl lg:max-w-2xl flex flex-col items-start justify-center animate-fadeIn text-left">
                
                {/* 1. Subtitle with side lines: —— TIMELESS ELEGANCE —— (Desktop only) */}
                <div className="hidden md:flex items-center gap-2 sm:gap-3 text-amber-300 font-extrabold uppercase tracking-[0.25em] text-[10px] xs:text-[11px] sm:text-xs">
                  <span className="w-5 sm:w-10 h-px bg-amber-400/80" />
                  <span className="font-sans tracking-[0.22em] drop-shadow-sm">{activeSlide.subtitle || 'TIMELESS ELEGANCE'}</span>
                  <span className="w-5 sm:w-10 h-px bg-amber-400/80" />
                </div>

                {/* 2. Dual Headline: "The Art of" + "Elegance" with golden italic script & swash flourish */}
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="font-playfair text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal text-white tracking-normal drop-shadow-md leading-tight">
                    {titleParts.line1}
                  </div>
                  <div className="relative inline-block">
                    <span className="font-playfair italic font-medium text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl tracking-tight bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#e5a93b] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] pr-2 md:pr-3 leading-none block">
                      {titleParts.line2}
                    </span>
                    {/* Delicate Golden Flourish / Swash Underline */}
                    <svg
                      className="w-28 xs:w-36 sm:w-48 md:w-56 lg:w-72 xl:w-80 h-2.5 xs:h-3 sm:h-3.5 md:h-4 text-amber-400 -mt-0.5 sm:-mt-1 md:-mt-2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                      viewBox="0 0 260 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 12 6 C 55 6, 85 16, 130 16 C 175 16, 210 7, 248 5 C 205 9, 165 18, 130 18 C 85 18, 55 8, 12 6 Z"
                        fill="url(#goldSwashGradient)"
                      />
                      <defs>
                        <linearGradient id="goldSwashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.1" />
                          <stop offset="25%" stopColor="#fef08a" stopOpacity="0.95" />
                          <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* 3. Tagline: Explore the Festive Collection (Desktop only) */}
                <p className="hidden md:block text-white/90 font-sans text-xs xs:text-sm sm:text-base md:text-sm lg:text-base xl:text-lg tracking-wide font-normal max-w-md lg:max-w-lg drop-shadow-sm pt-0.5">
                  {activeSlide.description || 'Explore the Festive Collection'}
                </p>

                {/* 4. Luxury Golden Pill CTA Button: "Shop Now →" */}
                <div className="pt-1.5 xs:pt-2 sm:pt-2.5 md:pt-3 pointer-events-auto">
                  <Link
                    to={activeSlide.primaryButtonLink || '/shop'}
                    onMouseEnter={() => prefetchRoute('shop')}
                    onTouchStart={() => prefetchRoute('shop')}
                    className="group inline-flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 px-3.5 py-1.5 xs:px-4 xs:py-2 md:px-6 md:py-2.5 rounded-full bg-gradient-to-r from-[#e5a93b] via-[#f7d479] to-[#d8972b] hover:from-[#f3be4d] hover:to-[#e0a438] text-slate-950 font-bold text-[11px] xs:text-xs md:text-sm tracking-wide shadow-[0_4px_16px_rgba(240,180,51,0.4)] hover:shadow-[0_6px_25px_rgba(240,180,51,0.6)] active:scale-95 transition-all duration-200"
                  >
                    <span className="font-extrabold">{activeSlide.primaryButtonText || 'Shop Now'}</span>
                    <div className="w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-[9px] xs:text-[10px] md:text-xs group-hover:translate-x-0.5 transition-transform shadow-inner">
                      <ArrowRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-3.5 md:h-3.5 text-amber-300 stroke-[2.5]" />
                    </div>
                  </Link>
                </div>

              </div>
            </div>

            {/* Bottom Right Floating Collection Badge (Desktop only) */}
            <Link
              to={activeSlide.secondaryButtonLink || '/shop'}
              onMouseEnter={() => prefetchRoute('shop')}
              onTouchStart={() => prefetchRoute('shop')}
              className="absolute bottom-5 right-5 sm:right-12 z-20 hidden md:flex items-center gap-2 sm:gap-4 bg-[#09050b]/80 backdrop-blur-md px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-bold shadow-2xl hover:bg-[#09050b] hover:border-amber-400 transition-all group"
            >
              <span>{activeSlide.secondaryButtonText || 'Explore Catalog'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>

          {/* Mobile Carousel Indicators (Dots) */}
          {heroSlides.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5">
              {heroSlides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === safeSlideIndex ? 'w-6 bg-amber-500 shadow-xs' : 'w-1.5 bg-amber-300/80 hover:bg-amber-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. NEW SAREE ARRIVALS: MOBILE HORIZONTAL SCROLL ROW (2 VISIBLE + 1 PEEK) & DESKTOP GRID */}
      {cms?.newArrivals?.enabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-5 sm:mb-10 text-center sm:text-left gap-2">
            <div className="space-y-1">
              <h2 className="font-street text-base sm:text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-normal sm:tracking-wider uppercase leading-snug">
                {renderDualToneHeading(cms?.newArrivals?.title || 'NEW SAREE ARRIVALS', 2)}
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-800 font-bold uppercase tracking-widest">
                {cms?.newArrivals?.subtitle || 'Freshly Woven Artisan Sarees Added Today'}
              </p>
            </div>
          </div>

          {/* MOBILE ONLY: Single-row horizontal scrollable cards with 2 visible + 1 peeking */}
          <div className="flex sm:hidden overflow-x-auto gap-3 pb-3 pt-1 px-1 -mx-1 scroll-smooth snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {featuredProducts.slice(0, Math.max(cms?.newArrivals?.maxItems || 6, 6)).map((product, idx) => {
              const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
              return (
                <div
                  key={`mob-${idx}-${product._id}`}
                  className="w-[44%] min-w-[150px] max-w-[175px] flex-shrink-0 snap-start bg-white rounded-2xl border border-amber-200/90 shadow-sm hover:border-amber-400 flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.images[0] || '/images/saree_banarasi_red.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                    </Link>
                    <div className="absolute top-1.5 left-1.5 pointer-events-none">
                      <span className="bg-slate-900 text-white text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                        NEW
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-700 hover:text-red-700 active:scale-90 transition-transform"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(product._id) ? 'fill-current text-red-700' : ''}`} />
                    </button>
                  </div>

                  <div className="p-2 text-center space-y-1">
                    <Link to={`/product/${product._id}`}>
                      <h4
                        className="font-serif-luxury font-bold text-[11px] text-slate-900 truncate hover:text-red-800 transition-colors px-0.5"
                        title={formatSareeName(product.name, product.category, false, product._id)}
                      >
                        {formatSareeName(product.name, product.category, false, product._id).replace(/\s*by\s+Aneera\s+Silks/gi, '').replace(/\s+Saree$/i, '')}
                      </h4>
                    </Link>
                    <div className="flex items-center justify-center gap-0.5 text-amber-500 text-[10px]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pt-0.5 font-bold">
                      <span className="text-slate-400 text-[10px] line-through">₹{(product.mrp || product.price + 2000).toLocaleString('en-IN')}</span>
                      <span className="text-red-800 text-xs font-black">₹{displayPrice.toLocaleString('en-IN')}</span>
                    </div>
                    {/* Buttons on cards removed only in mobile response */}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP ONLY: 4-Column Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                        NEW
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWishlist(product)}
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

      {/* 3. 5-TILE EDITORIAL SAREE LOOKBOOK GALLERY */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 my-4 sm:my-8 py-1 sm:py-2">
        <div className="bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-md space-y-3 sm:space-y-5">
          <div className="text-center space-y-0.5 sm:space-y-1">
            <h2 className="font-street text-sm xs:text-base sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-normal sm:tracking-wider uppercase leading-tight sm:leading-snug">
              {renderDualToneHeading('EDITORIAL LOOKBOOK GALLERY', 1)}
            </h2>
            <p className="text-[9px] sm:text-xs text-amber-800 font-bold uppercase tracking-wider sm:tracking-widest">Curated Saree Collections • Click Any Tile To Explore</p>
          </div>

          {/* Dynamic 5-Tile Lookbook Gallery from CMS (Balanced 3-Column Bento Layout) */}
          {(() => {
            const cols = cms?.featuredCollections || [];
            const tile1 = cols[0] || { name: 'Banarasi Zari Brocade Collection', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Banarasi Sarees', buttonText: 'Explore' };
            const tile2 = cols[1] || { name: 'Kanchipuram Temple Border', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Kanchipuram Sarees', buttonText: 'Explore' };
            const tile3 = cols[2] || { name: 'LUXURY SILK SAREES', image: '/images/saree_banarasi_purple.png', buttonLink: '/shop?category=Royal Zari Brocade Sarees', buttonText: 'SHOP SILK COLLECTION', description: 'Discover handcrafted mulberry silk sarees & heirloom zari sarees.' };
            const tile4 = cols[3] || { name: 'Paithani Peacock Pallu', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Paithani Sarees', buttonText: 'Explore' };
            const tile5 = cols[4] || { name: 'Scalloped Floral Organza', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Organza Sarees', buttonText: 'Explore' };

            return (
              <div className="grid grid-cols-12 gap-2 xs:gap-2.5 sm:gap-3.5 md:gap-4.5 h-[300px] xs:h-[340px] sm:h-[420px] md:h-[500px] lg:h-[520px]">
                {/* Left Column: 2 Stacked Tiles (Tile 1 & 2) */}
                <div className="col-span-4 grid grid-rows-2 gap-2 xs:gap-2.5 sm:gap-3.5 md:gap-4.5 h-full">
                  {/* Tile 1 */}
                  <Link
                    to={tile1.buttonLink || '/shop?category=Banarasi Sarees'}
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden group border border-amber-200/90 bg-slate-950 block h-full shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-300"
                    aria-label={tile1.name}
                  >
                    <img
                      src={tile1.image || '/images/saree_banarasi_red.png'}
                      alt={tile1.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end p-2 xs:p-2.5 sm:p-4 justify-between gap-1 sm:gap-2 z-10">
                      <span className="w-full text-center sm:text-left text-amber-300 text-[9px] xs:text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-wider truncate drop-shadow-sm">
                        {tile1.name}
                      </span>
                      <span className="hidden sm:inline-flex shrink-0 text-white bg-red-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-black uppercase items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow">
                        {tile1.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>

                  {/* Tile 2 */}
                  <Link
                    to={tile2.buttonLink || '/shop?category=Kanchipuram Sarees'}
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden group border border-amber-200/90 bg-slate-950 block h-full shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-300"
                    aria-label={tile2.name}
                  >
                    <img
                      src={tile2.image || '/images/saree_kanchipuram_gold.png'}
                      alt={tile2.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end p-2 xs:p-2.5 sm:p-4 justify-between gap-1 sm:gap-2 z-10">
                      <span className="w-full text-center sm:text-left text-amber-300 text-[9px] xs:text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-wider truncate drop-shadow-sm">
                        {tile2.name}
                      </span>
                      <span className="hidden sm:inline-flex shrink-0 text-white bg-red-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-black uppercase items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow">
                        {tile2.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Center Column: Featured Hero Tile (Tile 3) */}
                <div className="col-span-4 h-full">
                  <Link
                    to={tile3.buttonLink || '/shop?category=Royal Zari Brocade Sarees'}
                    className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden group border-2 border-amber-300/90 bg-slate-950 block shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-300"
                    aria-label={tile3.name}
                  >
                    <img
                      src={tile3.image || '/images/saree_banarasi_purple.png'}
                      alt={tile3.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-2 left-2 xs:top-3 xs:left-3 sm:top-3.5 sm:left-3.5 bg-red-800 text-amber-300 border border-amber-300/90 font-black text-[7.5px] xs:text-[8.5px] sm:text-[10px] uppercase px-2 xs:px-2.5 sm:px-3 py-0.5 rounded-full shadow-lg z-20 tracking-wider">
                      EDITOR'S CHOICE
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex items-end p-2.5 xs:p-3.5 sm:p-5 md:p-6 z-10">
                      <div className="w-full text-center sm:text-left">
                        <h3 className="text-amber-300 font-street text-[11px] xs:text-xs sm:text-2xl md:text-3xl tracking-wide group-hover:text-white transition-colors drop-shadow-md leading-tight truncate">
                          {tile3.name}
                        </h3>
                        <p className="hidden sm:block text-slate-200 text-xs md:text-sm mt-1 line-clamp-2 leading-relaxed">
                          {tile3.description || 'Discover handcrafted mulberry silk sarees & heirloom zari sarees.'}
                        </p>
                        <div className="hidden sm:inline-flex mt-3 items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md group-hover:from-amber-300 group-hover:to-amber-400 group-hover:translate-x-1 transition-all">
                          <span>{tile3.buttonText || 'SHOP SILK COLLECTION'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Right Column: 2 Stacked Tiles (Tile 4 & 5) */}
                <div className="col-span-4 grid grid-rows-2 gap-2 xs:gap-2.5 sm:gap-3.5 md:gap-4.5 h-full">
                  {/* Tile 4 */}
                  <Link
                    to={tile4.buttonLink || '/shop?category=Paithani Sarees'}
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden group border border-amber-200/90 bg-slate-950 block h-full shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-300"
                    aria-label={tile4.name}
                  >
                    <img
                      src={tile4.image || '/images/saree_paithani_green.png'}
                      alt={tile4.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end p-2 xs:p-2.5 sm:p-4 justify-between gap-1 sm:gap-2 z-10">
                      <span className="w-full text-center sm:text-left text-amber-300 text-[9px] xs:text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-wider truncate drop-shadow-sm">
                        {tile4.name}
                      </span>
                      <span className="hidden sm:inline-flex shrink-0 text-white bg-red-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-black uppercase items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow">
                        {tile4.buttonText || 'Explore'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>

                  {/* Tile 5 */}
                  <Link
                    to={tile5.buttonLink || '/shop?category=Organza Sarees'}
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden group border border-amber-200/90 bg-slate-950 block h-full shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-300"
                    aria-label={tile5.name}
                  >
                    <img
                      src={tile5.image || '/images/saree_organza_floral.png'}
                      alt={tile5.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end p-2 xs:p-2.5 sm:p-4 justify-between gap-1 sm:gap-2 z-10">
                      <span className="w-full text-center sm:text-left text-amber-300 text-[9px] xs:text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-wider truncate drop-shadow-sm">
                        {tile5.name}
                      </span>
                      <span className="hidden sm:inline-flex shrink-0 text-white bg-red-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-black uppercase items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow">
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

      {/* 4. INTERACTIVE SELECTION SAREE CAROUSEL WITH DIRECT COLLECTION RELOCATION */}
      {cms?.trendingSarees?.enabled !== false && (
        <section className="bg-white my-6 sm:my-10 py-6 sm:py-10 border-y border-amber-200/80 shadow-sm relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-8 text-center mb-5 sm:mb-8">
            <h2 className="font-street text-base sm:text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-normal sm:tracking-wider uppercase leading-snug">
              {renderDualToneHeading(cms?.trendingSarees?.title || 'DIVE INTO A WORLD OF ENDLESS SAREE POSSIBILITIES', 5)}
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
                    } bg-slate-900 overflow-hidden flex flex-col justify-end sm:justify-between p-5 select-none group`}
                  >
                    <img
                      src={card.image || '/images/saree_banarasi_red.png'}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Top Tag Pill - Hidden only for Mobile Response */}
                    <div className="hidden sm:flex relative z-10 items-center justify-between gap-1.5 w-full">
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

      {/* 9. CUSTOMER TESTIMONIALS - AUTO-PLAYING 1.5s CAROUSEL */}
      {testimonialsList.length > 0 && (
        <section className="bg-amber-50/60 py-12 sm:py-16 border-t border-amber-200 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-800 block">
                REAL VERIFIED REVIEWS
              </span>
              <h2 className="font-street text-base sm:text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight sm:tracking-normal uppercase leading-snug">
                {renderDualToneHeading('WHAT OUR ROYAL CLIENTS SAY', 3)}
              </h2>
            </div>

            {/* Testimonials Single Card Carousel with 1.5s Transitions */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative h-[220px] xs:h-[200px] sm:h-[190px] w-full">
                {testimonialsList.map((test: any, idx: number) => {
                  const isCurrent = idx === currentTestimonialIndex;
                  return (
                    <div
                      key={test.id || idx}
                      className={`absolute inset-0 bg-white p-5 sm:p-6 rounded-3xl border border-amber-200/90 shadow-md text-left transition-all duration-700 ease-in-out flex flex-col justify-between ${
                        isCurrent
                          ? 'opacity-100 scale-100 translate-y-0 z-20 pointer-events-auto'
                          : 'opacity-0 scale-95 translate-y-2 z-10 pointer-events-none'
                      }`}
                    >
                      <Quote className="w-8 h-8 text-amber-300/40 absolute top-4 right-5 pointer-events-none" />

                      <div className="space-y-2">
                        {/* 5 Stars */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(test.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current drop-shadow-2xs" />
                          ))}
                        </div>

                        {/* Review text */}
                        <p className="text-xs sm:text-sm text-slate-800 italic font-medium leading-relaxed font-serif-luxury pr-6 line-clamp-3">
                          "{test.review || test.quoteText || ''}"
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 pt-2.5 border-t border-amber-100/80">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center border-2 border-amber-300 shadow-xs flex-shrink-0">
                          {(test.customerName || test.clientName || 'R').charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                            {test.customerName || test.clientName || 'Royal Client'}
                          </h5>
                          <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">
                            {test.location || test.cityState || 'India'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carousel Navigation & Dots Indicator */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTestimonialIndex(
                      (prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length
                    )
                  }
                  className="w-7 h-7 rounded-full bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 flex items-center justify-center transition shadow-xs active:scale-90 text-sm font-bold"
                  aria-label="Previous Review"
                >
                  ‹
                </button>

                {/* Animated sequential indicator dots */}
                <div className="flex items-center gap-1.5">
                  {testimonialsList.map((_: any, idx: number) => {
                    const isCurrent = idx === currentTestimonialIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentTestimonialIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCurrent ? 'w-6 bg-red-800' : 'w-2 bg-amber-300 hover:bg-amber-400'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialsList.length)
                  }
                  className="w-7 h-7 rounded-full bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 flex items-center justify-center transition shadow-xs active:scale-90 text-sm font-bold"
                  aria-label="Next Review"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

