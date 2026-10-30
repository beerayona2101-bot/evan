import { prefetchApi } from '../services/api';

type PageRoute =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'register'
  | 'about'
  | 'contact'
  | 'wishlist'
  | 'admin';

const prefetchedModules = new Set<string>();

/**
 * Prefetches the code chunk for a route component dynamically.
 */
export const prefetchRoute = (route: PageRoute): void => {
  if (prefetchedModules.has(route)) return;
  prefetchedModules.add(route);

  switch (route) {
    case 'home':
      import('../pages/HomePage').catch(() => {});
      prefetchApi('/homepage');
      prefetchApi('/products');
      break;
    case 'shop':
      import('../pages/ShopPage').catch(() => {});
      prefetchApi('/categories');
      prefetchApi('/fabrics', { status: 'ACTIVE' });
      prefetchApi('/occasions', { status: 'ACTIVE' });
      prefetchApi('/products');
      break;
    case 'product':
      import('../pages/ProductDetailPage').catch(() => {});
      break;
    case 'cart':
      import('../pages/CartPage').catch(() => {});
      break;
    case 'checkout':
      import('../pages/CheckoutPage').catch(() => {});
      break;
    case 'login':
      import('../pages/LoginPage').catch(() => {});
      break;
    case 'register':
      import('../pages/RegisterPage').catch(() => {});
      break;
    case 'about':
      import('../pages/AboutPage').catch(() => {});
      break;
    case 'contact':
      import('../pages/ContactPage').catch(() => {});
      break;
    case 'wishlist':
      import('../pages/WishlistPage').catch(() => {});
      break;
    case 'admin':
      import('../pages/AdminDashboardPage').catch(() => {});
      break;
    default:
      break;
  }
};

/**
 * Automatically prefetch critical routes during browser idle time
 */
export const setupIdlePrefetch = (): void => {
  if (typeof window === 'undefined') return;

  const prefetchCritical = () => {
    // Silently pre-warm the two most common routes
    prefetchRoute('shop');
    prefetchRoute('cart');
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(prefetchCritical, { timeout: 2500 });
  } else {
    setTimeout(prefetchCritical, 1500);
  }
};
