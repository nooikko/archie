'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls past the main header (roughly 400px)
      // This is approximately when the sticky header takes over
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type='button'
      onClick={scrollToTop}
      className='fixed top-2 left-1/2 -translate-x-1/2 z-50 inline-flex items-center justify-center p-1.5 bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground transition-all duration-200 animate-in fade-in slide-in-from-top-1'
      aria-label='Scroll to top'
    >
      <ChevronUp className='h-4 w-4' strokeWidth={2.5} />
    </button>
  );
};
