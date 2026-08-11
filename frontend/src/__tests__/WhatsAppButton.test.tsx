import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { WhatsAppButton } from '../components/WhatsAppButton';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('../context/SocketContext', () => ({
  useSocket: () => ({
    socket: null,
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        whatsappNumber: '919490644434',
        whatsappGreeting: 'Hello EVAN Collections',
        whatsappEnabled: true,
        whatsappPosition: 'bottom-right',
        whatsappColor: '#25D366',
      },
    }),
  },
}));

describe('WhatsAppButton Component', () => {
  it('renders WhatsApp floating link when enabled for public visitors', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <WhatsAppButton />
      </MemoryRouter>
    );

    const linkElement = await screen.findByRole('link', { name: /Chat on WhatsApp/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toContain('https://wa.me/919490644434');
    expect(linkElement.getAttribute('target')).toBe('_blank');
  });

  it('hides WhatsApp floating link on admin routes', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <WhatsAppButton />
        </MemoryRouter>
      );
    });

    const linkElement = screen.queryByRole('link', { name: /Chat on WhatsApp/i });
    expect(linkElement).toBeNull();
  });
});
