'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StatusBadgeTooltipProps {
  status: string;
  color: string;
  bg: string;
}

const getStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    Official: 'Officially supported. Ships with Archipelago and works on the website.',
    Merged: 'Coming in the next Archipelago release.',
    'In Review': 'Being reviewed for official support. Usually stable.',
    Stable: 'Fully playable with minimal issues.',
    Unstable: 'Playable, but expect some problems.',
    'APWorld Only': "Requires manual installation. Won't be officially included.",
    'Broken on Main': 'Currently broken. Needs an update to work.',
    'Index Only': 'Found in the package registry but not on the community sheet.',
  };

  return descriptions[status] || 'No description available.';
};

export const StatusBadgeTooltip = ({ status, color, bg }: StatusBadgeTooltipProps) => {
  const [open, setOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    // On touch devices, don't open on hover (prevents accidental triggers while scrolling)
    if (isTouchDevice) {
      return;
    }

    // Add delay to prevent accidental triggers during mouse movement
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear the hover timeout if mouse leaves before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear hover timeout on click
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
          className='inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border cursor-help transition-all hover:scale-105 hover:shadow-sm'
          style={{
            backgroundColor: bg,
            color: color,
            borderColor: color,
            borderWidth: '1px',
            borderStyle: 'dashed',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {status}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 p-3 text-sm'
        side='top'
        sideOffset={5}
        onMouseEnter={() => !isTouchDevice && setOpen(true)}
        onMouseLeave={() => !isTouchDevice && setOpen(false)}
      >
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div
              className='w-2 h-2 rounded-full'
              style={{
                backgroundColor: color,
              }}
            />
            <span className='font-mono text-xs font-semibold uppercase tracking-wider' style={{ color }}>
              {status}
            </span>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>{getStatusDescription(status)}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
