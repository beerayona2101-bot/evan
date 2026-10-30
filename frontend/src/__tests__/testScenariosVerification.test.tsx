import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { FAQPage } from '../pages/FAQPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { WishlistPage } from '../pages/WishlistPage';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { CartPage } from '../pages/CartPage';
import { AccountPage } from '../pages/AccountPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { HomepageEditorPage } from '../pages/HomepageEditorPage';
import { RevenueDashboardPage } from '../pages/RevenueDashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

// Mocks for API services
vi.mock('../services/api', () => ({
  api: {
    get: vi.fn((url: string) => {
      if (url === '/homepage') {
        return Promise.resolve({
          data: {
            announcementBar: { enabled: true, text: 'Silk Mark Certified Pure Zari Sarees' },
            heroSlides: [
              { id: '1', title: 'ROYAL KANCHIPURAM', subtitle: 'Handcrafted Heritage', image: 'slide1.jpg', buttonText: 'EXPLORE', buttonLink: '/shop' }
            ],
            editorialTiles: [
              { id: '1', title: 'BRIDAL HEIRLOOMS', subtitle: 'Grand Zari Sarees', image: 'tile1.jpg', category: 'Kanchipuram' },
              { id: '2', title: 'PAITHANI LUXURY', subtitle: 'Maharashtrian Heritage', image: 'tile2.jpg', category: 'Paithani' },
              { id: '3', title: 'BANARASI BROCADE', subtitle: 'Varanasi Silks', image: 'tile3.jpg', category: 'Banarasi' },
              { id: '4', title: 'TUSSAR SILKS', subtitle: 'Wild Silk Grace', image: 'tile4.jpg', category: 'Tussar' },
              { id: '5', title: 'ORGANZA EMBROIDERY', subtitle: 'Sheer Splendor', image: 'tile5.jpg', category: 'Organza' }
            ],
            testimonials: [
              { id: '1', customerName: 'Maharani Gayatri', location: 'Jaipur, Rajasthan', rating: 5, review: 'Unmatched craftsmanship and authenticity.' }
            ]
          }
        });
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [
            {
              _id: 'p1',
              name: 'Royal Crimson Gold Zari Kanchipuram Silk Saree',
              category: 'Kanchipuram',
              fabric: 'Pure Silk',
              price: 45000,
              originalPrice: 55000,
              images: ['saree1.jpg'],
              colorVariants: [
                { colorName: 'Royal Crimson Red', colorHex: '#990000', images: ['red1.jpg'], inStock: true, stockCount: 5 }
              ],
              isSilkMarkCertified: true,
              rating: 5,
              numReviews: 12
            }
          ]
        });
      }
      if (url.includes('/orders')) return Promise.resolve({ data: [] });
      if (url.includes('/categories')) return Promise.resolve({ data: [] });
      if (url.includes('/analytics')) return Promise.resolve({ data: {} });
      if (url.includes('/users')) return Promise.resolve({ data: [] });
      if (url.includes('/inquiries')) return Promise.resolve({ data: [] });
      if (url.includes('/coupons')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    }),
    post: vi.fn().mockResolvedValue({ data: { message: 'Success' } }),
    put: vi.fn().mockResolvedValue({ data: { message: 'Updated' } }),
    delete: vi.fn().mockResolvedValue({ data: { message: 'Deleted' } })
  }
}));

vi.mock('../context/SocketContext', () => ({
  useSocket: () => ({ socket: null })
}));

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {ui}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Aneera Silks Complete Test Scenarios Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Homepage Header & Storefront Scenarios', () => {
    it('Verify Header Section of the Homepage', () => {
      renderWithProviders(<Navbar />);
      expect(screen.getByText(/ANEERA/i)).toBeInTheDocument();
      expect(screen.getByText(/SILKS/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /collections/i })).toBeInTheDocument();
    });

    it('Verify Home Banner, Editorial Gallery, 3D Saree Cards & Reviews on HomePage', async () => {
      renderWithProviders(<HomePage />);
      await waitFor(() => {
        expect(screen.getByText(/ROYAL KANCHIPURAM/i)).toBeInTheDocument();
        expect(screen.getByText(/EDITORIAL LOOKBOOK GALLERY/i)).toBeInTheDocument();
        expect(screen.getByText(/WHAT OUR ROYAL CLIENTS SAY/i)).toBeInTheDocument();
      });
    });

    it('Verify Footer Section', () => {
      renderWithProviders(<Footer />);
      expect(screen.getAllByText(/ANEERA SILKS/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/CUSTOMER CONCIERGE/i)).toBeInTheDocument();
    });

    it('Verify WhatsApp icon at bottom-right side on every page', () => {
      renderWithProviders(<WhatsAppButton />);
      const link = screen.getByRole('link', { name: /chat on whatsapp/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('2. Authentication & Customer Account Scenarios', () => {
    it('Verify Aneera Silks Sign In page', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('button', { name: /SIGN IN TO ANEERA SILKS/i })).toBeInTheDocument();
      expect(screen.getByText(/EMAIL ADDRESS/i)).toBeInTheDocument();
      expect(screen.getAllByText(/PASSWORD/i).length).toBeGreaterThan(0);
    });

    it('Verify Create Account Page', () => {
      renderWithProviders(<RegisterPage />);
      expect(screen.getByRole('heading', { name: /CREATE AN ACCOUNT/i })).toBeInTheDocument();
      expect(screen.getByText(/FIRST NAME/i)).toBeInTheDocument();
    });

    it('Verify Forgot Password Page', () => {
      renderWithProviders(<ResetPasswordPage />);
      expect(screen.getByRole('heading', { name: /RESET YOUR PASSWORD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /UPDATE PASSWORD/i })).toBeInTheDocument();
    });

    it('Verify Account Page render when unauthenticated', async () => {
      renderWithProviders(<AccountPage />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ACCOUNT ACCESS REQUIRED/i })).toBeInTheDocument();
      });
    });
  });

  describe('3. Collections & Products Listing Scenarios', () => {
    it('Verify Collections Page Search & Filters section', async () => {
      renderWithProviders(<ShopPage />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search Banarasi, Kanchipuram.../i)).toBeInTheDocument();
        expect(screen.getByText(/LUXURY INDIAN SAREES/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Shopping Cart & Wishlist Scenarios', () => {
    it('Verify Shopping Bag Section & Empty Cart State', () => {
      renderWithProviders(<CartPage />);
      expect(screen.getByText(/YOUR SHOPPING BAG IS EMPTY/i)).toBeInTheDocument();
    });

    it('Verify Wishlist (Your Wishlist is Empty) Page', () => {
      renderWithProviders(<WishlistPage />);
      expect(screen.getByRole('heading', { name: /YOUR WISHLIST IS EMPTY/i })).toBeInTheDocument();
    });
  });

  describe('5. Informational Pages Scenarios', () => {
    it('Verify About Us Page', () => {
      renderWithProviders(<AboutPage />);
      expect(screen.getByText(/Preserving India's 2,000-year-old weaving legacy/i)).toBeInTheDocument();
      expect(screen.getByText(/MASTER WEAVERS & ARTISANS/i)).toBeInTheDocument();
    });

    it('Verify Contact Us Page & Location Map Section', () => {
      renderWithProviders(<ContactPage />);
      expect(screen.getByText(/CONTACT ANEERA SILKS/i)).toBeInTheDocument();
      expect(screen.getByText(/ATELIER LOCATION MAP/i)).toBeInTheDocument();
    });

    it('Verify FAQ Page, Search, Categories & Silk Concierge', () => {
      renderWithProviders(<FAQPage />);
      expect(screen.getByRole('heading', { name: /FREQUENTLY ASKED QUESTIONS/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search FAQs/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /GET IN TOUCH/i })).toBeInTheDocument();
    });
  });

  describe('6. Admin Dashboard Scenarios', () => {
    it('Verify Admin Dashboard rendering for Admin User', async () => {
      localStorage.setItem('evan_user', JSON.stringify({
        id: 'adm_1',
        name: 'Aneera Silks Admin',
        email: 'admin@aneerasilks.com',
        role: 'admin',
        token: 'adm_token'
      }));

      renderWithProviders(<AdminDashboardPage />);
      await waitFor(() => {
        expect(screen.getByText(/ADMIN ATELIER/i)).toBeInTheDocument();
      });
    });

    it('Verify Revenue Dashboard Page rendering', async () => {
      renderWithProviders(<RevenueDashboardPage />);
      await waitFor(() => {
        expect(screen.getByText(/REVENUE DASHBOARD & FINANCIAL ANALYTICS/i)).toBeInTheDocument();
      });
    });

    it('Verify Homepage CMS Editor Page rendering', async () => {
      renderWithProviders(<HomepageEditorPage />);
      await waitFor(() => {
        expect(screen.getByText(/HOMEPAGE CMS EDITOR/i)).toBeInTheDocument();
      });
    });
  });
});
