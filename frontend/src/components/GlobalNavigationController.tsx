import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const scrollPositions = new Map<string, number>();

export const GlobalNavigationController: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPopStateRef = useRef(false);

  // Track PopState (Browser Back / Forward button clicks)
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save and Restore Scroll Positions
  useEffect(() => {
    const currentKey = location.key || `${location.pathname}${location.search}`;

    if (isPopStateRef.current) {
      // Browser back/forward navigation - restore saved scroll position
      const savedY = scrollPositions.get(currentKey) || 0;
      setTimeout(() => {
        window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
      }, 50);
      isPopStateRef.current = false;
    } else {
      // New navigation - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      scrollPositions.set(currentKey, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollPositions.set(currentKey, window.scrollY);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox');

      // 1. Backspace Key Navigation Intercept (When NOT inside text input)
      if (e.key === 'Backspace' && !isEditable) {
        e.preventDefault();
        navigate(-1);
        return;
      }

      // 2. Alt + Left / Alt + Right Navigation
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
        return;
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
        return;
      }

      // 3. Escape Key - Dismiss Active Modals / Drawers / Overlays
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('closeActiveModals'));
        return;
      }

      // 4. Arrow Keys - Gallery & Image Sliders (When NOT inside text input)
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isEditable) {
        window.dispatchEvent(
          new CustomEvent('navigateGallery', {
            detail: { direction: e.key === 'ArrowLeft' ? 'prev' : 'next' },
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};
