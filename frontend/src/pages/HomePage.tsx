import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Sparkles, Heart, Star, ShoppingBag, Play, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSocket } from '../context/SocketContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cms, setCms] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active3DIndex, setActive3DIndex] = useState(1);
  const [prevActiveIndex, setPrevActiveIndex] = useState(1);
  const wheelLockRef = useRef(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { socket } = useSocket();

  const handleSelectCard = (targetIdx: number) => {
    setPrevActiveIndex(active3DIndex);
    setActive3DIndex(targetIdx);
  };

  const fetchCMS = () => {
    api
      .get('/homepage')
      .then((res) => setCms(res.data))
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

  // Listen to real-time Socket.IO broadcasts
  useEffect(() => {
    if (!socket) return;

    socket.on('homepageCMSUpdated', (updatedCms: any) => {
      setCms(updatedCms);
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
      if (diff > 0) {
        handleSelectCard((active3DIndex + 1) % sareeCollectionCards.length);
      } else {
        handleSelectCard((active3DIndex - 1 + sareeCollectionCards.length) % sareeCollectionCards.length);
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
      if (diff > 0) {
        handleSelectCard((active3DIndex + 1) % sareeCollectionCards.length);
      } else {
        handleSelectCard((active3DIndex - 1 + sareeCollectionCards.length) % sareeCollectionCards.length);
      }
      setTouchStart(null);
    }
  };

  const handleWheelScroll = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 10) {
      wheelLockRef.current = true;
      if (delta > 0) {
        handleSelectCard((active3DIndex + 1) % sareeCollectionCards.length);
      } else {
        handleSelectCard((active3DIndex - 1 + sareeCollectionCards.length) % sareeCollectionCards.length);
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    }
  };

  // Saree collection cards for 3D selection carousel with direct category navigation links
  const sareeCollectionCards = cms?.featuredCategories && cms.featuredCategories.length > 0
    ? cms.featuredCategories.map((cat: any, i: number) => {
        const catName = cat.name || 'Silk Sarees';
        const link = (cat.buttonLink && cat.buttonLink !== '/shop')
          ? cat.buttonLink
          : `/shop?category=${encodeURIComponent(catName)}`;
        return {
          id: cat.id || cat._id || `sc-${i}`,
          title: catName,
          tag: catName.toUpperCase().replace(' SAREES', ''),
          price: cat.price || `$${200 + i * 40}.00 USD`,
          rupeePrice: cat.rupeePrice || `₹${((200 + i * 40) * 65).toLocaleString('en-IN')}`,
          image: cat.image || '/images/saree_banarasi_red.png',
          buttonLink: link,
        };
      })
    : [
        { id: 's1', title: 'Handwoven Paithani Brocade', tag: 'PAITHANI SILK', price: '$280.00 USD', rupeePrice: '₹17,999', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Paithani Sarees' },
        { id: 's2', title: 'Pastel Floral Organza Saree', tag: 'ORGANZA SILK', price: '$115.00 USD', rupeePrice: '₹6,999', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Organza Sarees' },
        { id: 's3', title: 'Mustard Gold Kanchipuram Silk', tag: 'KANCHIPURAM SILK', price: '$240.00 USD', rupeePrice: '₹14,999', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Kanchipuram Sarees' },
        { id: 's4', title: 'Royal Crimson Banarasi Saree', tag: 'BANARASI SILK', price: '$160.00 USD', rupeePrice: '₹9,999', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Banarasi Sarees' },
        { id: 's5', title: 'Pure Jamdani Soft Linen Saree', tag: 'HANDLOOM LINEN', price: '$95.00 USD', rupeePrice: '₹4,499', image: '/images/saree_linen_beige.png', buttonLink: '/shop?category=Linen Sarees' },
        { id: 's6', title: 'Chanderi Zari Tissue Silk Saree', tag: 'CHANDERI SILK', price: '$190.00 USD', rupeePrice: '₹12,499', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Silk Sarees' },
        { id: 's7', title: 'Mysore Mulberry Silk Saree', tag: 'MYSORE SILK', price: '$220.00 USD', rupeePrice: '₹15,999', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Mysore Silk Sarees' },
        { id: 's8', title: 'Uppada Light Jamdani Silk', tag: 'UPPADA SILK', price: '$210.00 USD', rupeePrice: '₹13,999', image: '/images/saree_organza_floral.png', buttonLink: '/shop?category=Handloom Sarees' },
        { id: 's9', title: 'Patola Double Ikat Royal Saree', tag: 'PATOLA IKAT', price: '$310.00 USD', rupeePrice: '₹21,999', image: '/images/saree_paithani_green.png', buttonLink: '/shop?category=Designer Sarees' },
        { id: 's10', title: 'Tussar Gharcha Artisan Saree', tag: 'TUSSAR SILK', price: '$175.00 USD', rupeePrice: '₹11,499', image: '/images/saree_linen_beige.png', buttonLink: '/shop?category=Tussar Silk' },
        { id: 's11', title: 'Bandhani Royal Crimson Saree', tag: 'BANDHANI SILK', price: '$145.00 USD', rupeePrice: '₹8,999', image: '/images/saree_banarasi_red.png', buttonLink: '/shop?category=Bandhani Sarees' },
        { id: 's12', title: 'Gadwal Temple Zari Silk Saree', tag: 'GADWAL SILK', price: '$260.00 USD', rupeePrice: '₹16,999', image: '/images/saree_kanchipuram_gold.png', buttonLink: '/shop?category=Wedding Sarees' },
      ];

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

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans overflow-x-hidden">

      {/* 0. DYNAMIC ANNOUNCEMENT BAR */}
      {cms?.announcementBar?.enabled && (
        <div
          style={{ backgroundColor: cms.announcementBar.bgColor || '#7f1d1d', color: cms.announcementBar.textColor || '#fcd34d' }}
          className="w-full py-2 px-4 text-center font-bold text-[11px] uppercase tracking-wider shadow-sm z-50 flex items-center justify-center overflow-hidden"
        >
          <span className={cms.announcementBar.scrolling ? 'animate-pulse' : ''}>
            {cms.announcementBar.text}
          </span>
        </div>
      )}

      {/* 1. LUXURY SAREE HERO BANNER SECTION */}
      {hero.enabled && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-amber-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center min-h-[70vh]">
            {/* Left Hero Content Block */}
            <div className="lg:col-span-7 p-8 sm:p-14 space-y-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black tracking-widest uppercase w-fit shadow-sm">
                <Sparkles className="w-4 h-4 text-red-700" /> {hero.offerBadge}
              </div>

              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-amber-800">{hero.subtitle}</span>
                <h1 className="font-street text-5xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {hero.title}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg leading-relaxed">
                {hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={hero.primaryButtonLink}
                  className="px-8 py-4 bg-slate-900 hover:bg-red-800 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all border border-amber-300/40 flex items-center gap-2"
                >
                  <span>{hero.primaryButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={hero.secondaryButtonLink}
                  className="px-8 py-4 bg-amber-50 hover:bg-amber-100 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl border border-amber-300 transition-all"
                >
                  {hero.secondaryButtonText}
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <Link to={hero.secondaryButtonLink || '/shop'} className="lg:col-span-5 relative h-full min-h-[480px] bg-slate-900 flex items-center justify-center overflow-hidden group">
              <img
                src={hero.desktopImage}
                alt="EVAN COLLECTIONS Saree Model"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-700 filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/75 backdrop-blur-md p-4 rounded-2xl border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Full Saree Collection</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* 2. 5-TILE EDITORIAL SAREE LOOKBOOK GALLERY (ALL TILES NOW DIRECTLY RELOCATE TO CATEGORY PAGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 my-12 py-4">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-amber-200/90 shadow-md space-y-6 overflow-hidden">
          <div className="text-center space-y-1">
            <h2 className="font-street text-4xl sm:text-5xl text-slate-900 tracking-wider">EDITORIAL LOOKBOOK GALLERY</h2>
            <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">Curated Saree Collections • Click Any Tile To Explore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[480px]">
            {/* Tile 1 & 2 */}
            <div className="md:col-span-4 grid grid-rows-2 gap-4 h-full">
              <Link
                to="/shop?category=Banarasi Sarees"
                className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block"
              >
                <img
                  src="/images/saree_banarasi_red.png"
                  alt="Banarasi Zari Weave"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4 justify-between">
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Banarasi Zari Brocade Collection</span>
                  <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              <Link
                to="/shop?category=Kanchipuram Sarees"
                className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block"
              >
                <img
                  src="/images/saree_kanchipuram_gold.png"
                  alt="Kanchipuram Gold Silk"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4 justify-between">
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Kanchipuram Temple Border</span>
                  <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Tile 3 (Featured Large Tile) */}
            <div className="md:col-span-4 h-full">
              <Link
                to="/shop?category=Silk Sarees"
                className="relative h-full rounded-2xl overflow-hidden group border border-amber-200 bg-slate-900 max-h-[480px] block"
              >
                <img
                  src="/images/saree_banarasi_red.png"
                  alt="Glamour Royal Saree Portrait"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-4 left-4 bg-red-800 text-amber-300 border border-amber-300 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow z-10">
                  EDITOR'S CHOICE
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-6">
                  <div className="w-full">
                    <h3 className="text-amber-300 font-street text-3xl tracking-wide group-hover:text-white transition-colors">LUXURY SILK SAREES</h3>
                    <p className="text-slate-200 text-xs mt-1">Discover handcrafted mulberry silk sarees & heirloom zari drapes.</p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-black text-amber-400 uppercase group-hover:translate-x-1 transition-transform">
                      <span>SHOP SILK COLLECTION</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Tile 4 & 5 */}
            <div className="md:col-span-4 grid grid-rows-2 gap-4 h-full">
              <Link
                to="/shop?category=Paithani Sarees"
                className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block"
              >
                <img
                  src="/images/saree_paithani_green.png"
                  alt="Paithani Silk Zari"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4 justify-between">
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Paithani Peacock Pallu</span>
                  <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              <Link
                to="/shop?category=Organza Sarees"
                className="relative rounded-2xl overflow-hidden group border border-amber-200 bg-slate-100 block"
              >
                <img
                  src="/images/saree_organza_floral.png"
                  alt="Organza Embroidery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4 justify-between">
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Scalloped Floral Organza</span>
                  <span className="text-white bg-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SELECTION SAREE CAROUSEL WITH DIRECT COLLECTION RELOCATION */}
      {cms?.trendingSarees?.enabled !== false && (
        <section className="bg-white my-12 py-12 border-y border-amber-200/80 shadow-sm relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-2 mb-10">
            <h2 className="font-street text-4xl sm:text-6xl text-slate-900 tracking-tight">
              {cms?.trendingSarees?.title || 'DIVE INTO A WORLD OF ENDLESS SAREE POSSIBILITIES'}
            </h2>
            <p className="text-xs text-red-800 uppercase tracking-widest font-black">
              {cms?.trendingSarees?.subtitle || 'FEATURED SAREE COLLECTION • CLICK ANY ACTIVE CARD TO GO TO ITS COLLECTION'}
            </p>
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
                        : 'transform 700ms ease-out, opacity 700ms ease-out',
                    }}
                    className={`absolute top-0 cursor-pointer ${
                      isActive
                        ? 'shadow-2xl border-2 border-red-800 rounded-3xl w-72 sm:w-80 h-[440px]'
                        : 'border border-amber-300 rounded-2xl w-64 sm:w-72 h-[400px] hover:opacity-90'
                    } bg-slate-900 overflow-hidden flex flex-col justify-between p-5 select-none group`}
                  >
                    <img
                      src={card.image || '/images/saree_banarasi_red.png'}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Top Tag Pill */}
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                        {card.tag}
                      </span>
                      {isActive && (
                        <span className="bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow border border-amber-300 animate-pulse">
                          CLICK TO VIEW COLLECTION
                        </span>
                      )}
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="relative z-10 text-left text-white space-y-1.5">
                      <h4 className="font-serif-luxury font-extrabold text-base line-clamp-1 text-amber-200">{card.title}</h4>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-xs font-bold text-amber-400 block">{card.price}</span>
                          <span className="text-[11px] font-extrabold text-slate-300">{card.rupeePrice}</span>
                        </div>
                        {isActive ? (
                          <Link
                            to={card.buttonLink}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all"
                          >
                            <span>SHOP COLLECTION</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
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
                <div key={idx} className="group bg-white rounded-3xl p-4 border border-amber-200/90 hover:border-amber-400 hover:shadow-2xl transition-all flex flex-col justify-between">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3 cursor-pointer">
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
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:text-red-700 shadow"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current text-red-700' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-1 text-center">
                    <Link to={`/product/${product._id}`}>
                      <h4 className="font-serif-luxury font-bold text-sm text-slate-900 line-clamp-1 hover:text-red-800 transition-colors">
                        {product.name}
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
                    <button
                      onClick={() => addToCart(product, 'Free Size', product.colors[0] || 'Royal Red')}
                      className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Add to Bag
                    </button>
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

