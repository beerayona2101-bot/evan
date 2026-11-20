import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, User as UserIcon, Sparkles, Bell, X, Tag, Truck, ChevronRight, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { prefetchRoute } from '../utils/prefetch';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const [userDropdown, setUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNotificationClick = (path: string) => {
    setShowNotifications(false);
    navigate(path);
  };

  // If on Admin Panel, hide customer navbar so Admin has a dedicated clean sidebar layout
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Helper to determine active navigation route
  const isActive = (path: string, exactQuery?: string) => {
    if (exactQuery) {
      return location.pathname === path && location.search.includes(exactQuery);
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/shop') {
      return (location.pathname === '/shop' || location.pathname.startsWith('/product/')) && !location.search.includes('offers=true') && !location.search.includes('sort=newest');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-amber-200/80 font-sans py-1.5 md:py-0 md:h-[60px] px-4 sm:px-8 shadow-sm flex items-center">
      {/* ANEERA SILKS Seamless Header */}
      <div className="max-w-7xl mx-auto w-full text-slate-900 flex items-center justify-between transition-all">
        {/* Brand Logo: Aneera Silks */}
        <Link to="/" className="flex items-center space-x-2.5">
          <img
            src="/aneera_silks_logo.jpg"
            alt="Aneera Silks Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover shadow-sm border border-amber-400/50 hover:scale-105 transition-transform"
          />
          <div className="flex flex-col leading-none">
            <span className="font-street text-base sm:text-lg font-black tracking-wider text-slate-900 hover:text-red-700 transition-colors">
              ANEERA SILKS
            </span>
            <span className="text-[6.5px] uppercase tracking-[0.2em] font-extrabold text-amber-700">
              LUXURY SILK ATELIER
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-[11px] font-black tracking-widest uppercase">
          <Link
            to="/"
            onMouseEnter={() => prefetchRoute('home')}
            onTouchStart={() => prefetchRoute('home')}
            className={`transition-all py-1 ${
              isActive('/')
                ? 'text-red-700 font-black border-b-2 border-red-700'
                : 'text-slate-800 hover:text-red-700'
            }`}
          >
            HOME
          </Link>
          <Link
            to="/about"
            onMouseEnter={() => prefetchRoute('about')}
            onTouchStart={() => prefetchRoute('about')}
            className={`transition-all py-1 ${
              isActive('/about')
                ? 'text-red-700 font-black border-b-2 border-red-700'
                : 'text-slate-800 hover:text-red-700'
            }`}
          >
            ABOUT US
          </Link>
          <Link
            to="/shop"
            onMouseEnter={() => prefetchRoute('shop')}
            onTouchStart={() => prefetchRoute('shop')}
            className={`transition-all py-1 ${
              isActive('/shop')
                ? 'text-red-700 font-black border-b-2 border-red-700'
                : 'text-slate-800 hover:text-red-700'
            }`}
          >
            COLLECTIONS
          </Link>
          <Link
            to="/contact"
            onMouseEnter={() => prefetchRoute('contact')}
            onTouchStart={() => prefetchRoute('contact')}
            className={`transition-all py-1 ${
              isActive('/contact')
                ? 'text-red-700 font-black border-b-2 border-red-700'
                : 'text-slate-800 hover:text-red-700'
            }`}
          >
            CONTACT US
          </Link>
          <Link
            to="/faq"
            className={`transition-all py-1 ${
              isActive('/faq')
                ? 'text-red-700 font-black border-b-2 border-red-700'
                : 'text-slate-800 hover:text-red-700'
            }`}
          >
            FAQS
          </Link>
        </nav>

        {/* Mobile Top Actions (Admin badge & Notification Bell Button with Dropdown) */}
        <div className="flex items-center space-x-1.5 md:hidden">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-800 text-amber-300 border border-amber-300 text-[10px] font-black uppercase tracking-wider shadow-xs"
            >
              <Shield className="w-3 h-3 text-amber-300" />
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile Right Notification Bell Dropdown Container */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-800 hover:text-red-800 hover:bg-amber-100/60 active:scale-90 transition-all focus:outline-none"
              aria-label="View Notifications"
            >
              <Bell className="w-5 h-5 text-slate-800" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-700 border-2 border-white"></span>
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu (Directly Below Bell Button) */}
            {showNotifications && (
              <>
                {/* Backdrop to close on tap outside */}
                <div
                  className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
                  onClick={() => setShowNotifications(false)}
                  aria-hidden="true"
                />

                {/* Dropdown Card */}
                <div className="absolute right-0 top-full mt-2 w-[310px] xs:w-[335px] max-w-[calc(100vw-20px)] bg-[#FFFDF9] rounded-2xl border-2 border-amber-300/90 shadow-2xl z-50 overflow-hidden animate-fadeIn text-slate-900">
                  {/* Header */}
                  <div className="px-3.5 py-2.5 border-b border-amber-200/90 bg-gradient-to-r from-amber-50 via-white to-red-50/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-800 text-amber-300 flex items-center justify-center shadow-xs">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-street font-black text-xs uppercase tracking-wider text-slate-900 leading-none">
                          NOTIFICATIONS
                        </h4>
                        <span className="text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                          Atelier Updates & Offers
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-700 flex items-center justify-center transition-colors"
                      aria-label="Close notifications"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dropdown Notification Items (Clicking any item opens related info) */}
                  <div className="divide-y divide-amber-100/90 max-h-[340px] overflow-y-auto">
                    {/* Item 1: Royal Welcome Offer -> Opens Shop Offers */}
                    <div
                      onClick={() => handleNotificationClick('/shop?offers=true')}
                      className="p-3 hover:bg-amber-50 active:bg-amber-100/70 cursor-pointer transition-colors flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Tag className="w-3.5 h-3.5 text-amber-800" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-red-800 transition-colors">
                              Royal Welcome Privilege
                            </span>
                            <span className="text-[8px] font-black text-red-800 bg-red-50 border border-red-200 px-1 py-0.2 rounded">
                              10% OFF
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 leading-snug">
                            Use code <span className="font-black text-red-800">ROYAL10</span> at checkout for 10% privilege discount on all sarees. Tap to shop!
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Item 2: New Arrivals -> Opens Shop sorted by newest */}
                    <div
                      onClick={() => handleNotificationClick('/shop?sort=newest')}
                      className="p-3 hover:bg-amber-50 active:bg-amber-100/70 cursor-pointer transition-colors flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Sparkles className="w-3.5 h-3.5 text-red-800" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-red-800 transition-colors">
                              New Artisan Weaves Live
                            </span>
                            <span className="text-[8.5px] font-bold text-slate-400">
                              Today
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 leading-snug">
                            Fresh handloom Banarasi & Kanchipuram sarees added. Tap to explore latest weaves!
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Item 3: Delivery Info -> Opens FAQ */}
                    <div
                      onClick={() => handleNotificationClick('/faq')}
                      className="p-3 hover:bg-amber-50 active:bg-amber-100/70 cursor-pointer transition-colors flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-red-800 transition-colors">
                              Complimentary Delivery
                            </span>
                            <span className="text-[8.5px] font-bold text-emerald-700">
                              Active
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 leading-snug">
                            Complimentary insured express doorstep delivery active across India. Tap for details.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Item 4: Customer Orders or Concierge */}
                    <div
                      onClick={() => handleNotificationClick(user ? '/orders' : '/login')}
                      className="p-3 hover:bg-amber-50 active:bg-amber-100/70 cursor-pointer transition-colors flex items-center justify-between gap-2.5 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Package className="w-3.5 h-3.5 text-indigo-700" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-red-800 transition-colors">
                              {user ? 'My Orders & Deliveries' : 'Atelier Concierge Account'}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 leading-snug">
                            {user
                              ? 'Track active saree shipments and orders in real-time. Tap to open orders.'
                              : 'Sign in to access VIP privileges, order tracking & concierge. Tap to sign in.'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-amber-50/90 border-t border-amber-200/90 flex items-center justify-between gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setUnreadCount(0);
                        setShowNotifications(false);
                      }}
                      className="text-slate-600 hover:text-red-800 font-bold transition-colors"
                    >
                      Mark all as read
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick('/shop')}
                      className="text-red-800 hover:text-red-900 font-extrabold flex items-center gap-0.5 transition-colors"
                    >
                      <span>Explore Catalog</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Right Header Icons */}
        <div className="hidden md:flex items-center space-x-3.5 text-slate-800">
          {/* Wishlist Icon with Counter - Rendered ONLY when user is logged in */}
          {user && (
            <Link
              to="/wishlist"
              onMouseEnter={() => prefetchRoute('wishlist')}
              onTouchStart={() => prefetchRoute('wishlist')}
              className={`p-1.5 transition-colors relative ${
                isActive('/wishlist') ? 'text-red-700 font-black' : 'hover:text-red-700'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isActive('/wishlist') ? 'fill-current text-red-700' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-700 text-white font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-amber-300">
                  {wishlist.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart Icon with Counter - Rendered ONLY when user is logged in */}
          {user && (
            <Link
              to="/cart"
              onMouseEnter={() => prefetchRoute('cart')}
              onTouchStart={() => prefetchRoute('cart')}
              className={`p-1.5 transition-colors relative ${
                isActive('/cart') ? 'text-red-700 font-black' : 'hover:text-red-700'
              }`}
              aria-label="Shopping Cart"
              title="View Shopping Cart Page"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-800 text-amber-300 font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-amber-300">
                  {totalItemsCount}
                </span>
              )}
            </Link>
          )}

          {/* Customer / Admin Profile Menu */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div
                  className={`w-8 h-8 rounded-full bg-red-800 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-300 shadow overflow-hidden transition-all ${
                    isActive('/account') ? 'ring-2 ring-red-700 ring-offset-1' : ''
                  }`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                onMouseEnter={() => prefetchRoute('login')}
                onTouchStart={() => prefetchRoute('login')}
                className={`p-2 transition-colors flex items-center gap-1 font-extrabold text-xs ${
                  isActive('/login') || isActive('/register') ? 'text-red-700' : 'hover:text-red-700'
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Profile Dropdown Menu */}
            {userDropdown && user && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-amber-200 py-2 z-50 text-xs font-semibold text-slate-800">
                <div className="px-4 py-2.5 border-b border-amber-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-800 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-300 shadow overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  to="/account"
                  onClick={() => setUserDropdown(false)}
                  className={`block px-4 py-2 hover:bg-amber-50 transition-colors font-bold ${
                    isActive('/account') ? 'text-red-700 bg-amber-50/50' : ''
                  }`}
                >
                  My Account & Orders
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setUserDropdown(false)}
                    className="block px-4 py-2 hover:bg-amber-50 text-red-800 font-black transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={() => {
                    setUserDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-bold border-t border-amber-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

