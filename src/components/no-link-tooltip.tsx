'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NoLinkTooltipProps {
  children: React.ReactNode;
  type: string;
}

export const NoLinkTooltip = ({ children, type }: NoLinkTooltipProps) => {
  const [open, setOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    if (isTouchDevice) {
      return;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpen(!open);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='cursor-pointer text-left min-w-0 flex-1 truncate bg-transparent border-0 p-0 outline-none focus-visible:outline-none text-foreground hover:text-primary transition-colors'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          aria-label='No download link available'
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-64 p-3 text-sm'
        side='top'
        sideOffset={5}
        onMouseEnter={() => !isTouchDevice && setOpen(true)}
        onMouseLeave={() => !isTouchDevice && setOpen(false)}
      >
        <p className='text-xs text-muted-foreground leading-relaxed'>No download link available for this {type.toLowerCase()}.</p>
      </PopoverContent>
    </Popover>
  );
};
