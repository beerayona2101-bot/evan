import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { prefetchRoute } from '../utils/prefetch';

export const MobileBottomBar: React.FC = () => {
  const { user } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  // Hide completely on Admin routes so the admin panel has its own layout
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Helper to determine active tab
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/shop') {
      return location.pathname === '/shop' || location.pathname.startsWith('/product/');
    }
    if (path === '/account') {
      return (
        location.pathname === '/account' ||
        location.pathname === '/orders' ||
        location.pathname === '/login' ||
        location.pathname === '/register'
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-amber-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {/* 1. Home Tab */}
        <Link
          to="/"
          onMouseEnter={() => prefetchRoute('home')}
          onTouchStart={() => prefetchRoute('home')}
          className={`relative flex flex-col items-center justify-center py-1 select-none active:scale-90 transition-all duration-200 group ${
            isActive('/') ? 'text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Home"
        >
          {isActive('/') && (
            <span className="absolute -top-1.5 w-6 h-0.5 bg-red-700 rounded-full shadow-[0_1px_4px_rgba(185,28,28,0.5)]" />
          )}
          <Home className={`w-5 h-5 transition-transform ${isActive('/') ? 'scale-110' : 'group-hover:scale-105'}`} />
          <span
            className={`text-[10px] tracking-wider uppercase mt-1 leading-tight ${
              isActive('/') ? 'font-black text-red-700' : 'font-bold'
            }`}
          >
            Home
          </span>
        </Link>

        {/* 2. Collections / Shop Tab */}
        <Link
          to="/shop"
          onMouseEnter={() => prefetchRoute('shop')}
          onTouchStart={() => prefetchRoute('shop')}
          className={`relative flex flex-col items-center justify-center py-1 select-none active:scale-90 transition-all duration-200 group ${
            isActive('/shop') ? 'text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Collections"
        >
          {isActive('/shop') && (
            <span className="absolute -top-1.5 w-6 h-0.5 bg-red-700 rounded-full shadow-[0_1px_4px_rgba(185,28,28,0.5)]" />
          )}
          <Sparkles className={`w-5 h-5 transition-transform ${isActive('/shop') ? 'scale-110' : 'group-hover:scale-105'}`} />
          <span
            className={`text-[10px] tracking-wider uppercase mt-1 leading-tight ${
              isActive('/shop') ? 'font-black text-red-700' : 'font-bold'
            }`}
          >
            Collections
          </span>
        </Link>

        {/* 3. Wishlist Tab */}
        <Link
          to="/wishlist"
          onMouseEnter={() => prefetchRoute('wishlist')}
          onTouchStart={() => prefetchRoute('wishlist')}
          className={`relative flex flex-col items-center justify-center py-1 select-none active:scale-90 transition-all duration-200 group ${
            isActive('/wishlist') ? 'text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Wishlist"
        >
          {isActive('/wishlist') && (
            <span className="absolute -top-1.5 w-6 h-0.5 bg-red-700 rounded-full shadow-[0_1px_4px_rgba(185,28,28,0.5)]" />
          )}
          <div className="relative">
            <Heart
              className={`w-5 h-5 transition-transform ${
                isActive('/wishlist') ? 'fill-current text-red-700 scale-110' : 'group-hover:scale-105'
              }`}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-700 text-white font-black text-[8px] min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center border border-amber-300 shadow-xs">
                {wishlist.length > 99 ? '99+' : wishlist.length}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-wider uppercase mt-1 leading-tight ${
              isActive('/wishlist') ? 'font-black text-red-700' : 'font-bold'
            }`}
          >
            Wishlist
          </span>
        </Link>

        {/* 4. Cart Tab */}
        <Link
          to="/cart"
          onMouseEnter={() => prefetchRoute('cart')}
          onTouchStart={() => prefetchRoute('cart')}
          className={`relative flex flex-col items-center justify-center py-1 select-none active:scale-90 transition-all duration-200 group ${
            isActive('/cart') ? 'text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Shopping Cart"
        >
          {isActive('/cart') && (
            <span className="absolute -top-1.5 w-6 h-0.5 bg-red-700 rounded-full shadow-[0_1px_4px_rgba(185,28,28,0.5)]" />
          )}
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 transition-transform ${isActive('/cart') ? 'scale-110' : 'group-hover:scale-105'}`} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-800 text-amber-300 font-black text-[8px] min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center border border-amber-300 shadow-xs animate-pulse">
                {totalItemsCount > 99 ? '99+' : totalItemsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-wider uppercase mt-1 leading-tight ${
              isActive('/cart') ? 'font-black text-red-700' : 'font-bold'
            }`}
          >
            Cart
          </span>
        </Link>

        {/* 5. Account / Profile Tab */}
        <Link
          to={user ? '/account' : '/login'}
          onMouseEnter={() => prefetchRoute(user ? 'about' : 'login')}
          onTouchStart={() => prefetchRoute(user ? 'about' : 'login')}
          className={`relative flex flex-col items-center justify-center py-1 select-none active:scale-90 transition-all duration-200 group ${
            isActive('/account') ? 'text-red-700' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label={user ? 'Account' : 'Sign In'}
        >
          {isActive('/account') && (
            <span className="absolute -top-1.5 w-6 h-0.5 bg-red-700 rounded-full shadow-[0_1px_4px_rgba(185,28,28,0.5)]" />
          )}
          {user ? (
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black overflow-hidden border transition-all ${
                isActive('/account')
                  ? 'border-red-700 bg-red-800 text-amber-300 ring-2 ring-red-700/30'
                  : 'border-amber-400 bg-amber-100 text-slate-800'
              }`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <UserIcon className={`w-5 h-5 transition-transform ${isActive('/account') ? 'scale-110' : 'group-hover:scale-105'}`} />
          )}
          <span
            className={`text-[10px] tracking-wider uppercase mt-1 leading-tight ${
              isActive('/account') ? 'font-black text-red-700' : 'font-bold'
            }`}
          >
            {user ? 'Account' : 'Profile'}
          </span>
        </Link>
      </div>
    </nav>
  );
};
