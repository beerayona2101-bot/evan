import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
  prefetchApi: vi.fn(),
}));

vi.mock('../context/SocketContext', () => ({
  useSocket: () => ({ socket: null }),
}));

const renderWithProviders = (ui: React.ReactNode, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{ui}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('MobileBottomBar Component', () => {
  it('renders all 5 primary mobile bottom bar tabs on customer routes', () => {
    renderWithProviders(<MobileBottomBar />, '/');

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /collections/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shopping (cart|bag)|cart/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile|account|sign in/i })).toBeInTheDocument();
  });

  it('hides completely on /admin routes', () => {
    const { container } = renderWithProviders(<MobileBottomBar />, '/admin/dashboard');
    expect(container.firstChild).toBeNull();
  });

  it('has proper mobile-only styling (md:hidden and fixed bottom)', () => {
    renderWithProviders(<MobileBottomBar />, '/');
    const nav = screen.getByRole('navigation', { name: /mobile navigation/i });
    expect(nav).toHaveClass('md:hidden');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });
});
