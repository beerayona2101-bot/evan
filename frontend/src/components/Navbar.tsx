import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Shield, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-amber-200/80 font-sans py-1.5 px-4 sm:px-8 shadow-sm">
      {/* EVAN COLLECTIONS Seamless Header */}
      <div className="max-w-7xl mx-auto text-slate-900 flex items-center justify-between transition-all">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-800 hover:text-red-700 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Brand Logo: Kanchanika */}
        <Link to="/" className="flex items-center space-x-2.5">
          <img
            src="/kanchanika_attire_logo.svg"
            alt="Kanchanika Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div className="flex flex-col leading-none">
            <span className="font-street text-base sm:text-lg font-black tracking-wider text-slate-900 hover:text-red-700 transition-colors">
              KANCHANIKA
            </span>
            <span className="text-[6.5px] uppercase tracking-[0.2em] font-extrabold text-amber-700">
              LUXURY ATELIER
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-[11px] font-black tracking-widest uppercase">
          <Link
            to="/"
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

        {/* Right Header Icons */}
        <div className="flex items-center space-x-3.5 text-slate-800">
          {/* Wishlist Icon with Counter - Rendered ONLY when user is logged in */}
          {user && (
            <Link
              to="/wishlist"
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
              className={`p-1.5 transition-colors relative ${
                isActive('/cart') ? 'text-red-700 font-black' : 'hover:text-red-700'
              }`}
              aria-label="Shopping Bag"
              title="View Shopping Bag Page"
            >
              <ShoppingBag className="w-4 h-4" />
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

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-6 bg-white rounded-3xl border border-amber-300 shadow-2xl space-y-4 text-xs font-black tracking-widest uppercase">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${
              isActive('/') ? 'text-red-700 font-black border-l-4 border-red-700 pl-2' : 'text-slate-900 hover:text-red-700'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${
              isActive('/about') ? 'text-red-700 font-black border-l-4 border-red-700 pl-2' : 'text-slate-900 hover:text-red-700'
            }`}
          >
            About Us
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${
              isActive('/shop') ? 'text-red-700 font-black border-l-4 border-red-700 pl-2' : 'text-slate-900 hover:text-red-700'
            }`}
          >
            Collections
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${
              isActive('/contact') ? 'text-red-700 font-black border-l-4 border-red-700 pl-2' : 'text-slate-900 hover:text-red-700'
            }`}
          >
            Contact Us
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 ${
              isActive('/faq') ? 'text-red-700 font-black border-l-4 border-red-700 pl-2' : 'text-slate-900 hover:text-red-700'
            }`}
          >
            FAQs
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-red-800 font-black">
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

