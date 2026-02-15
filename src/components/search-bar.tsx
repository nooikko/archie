'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isPending?: boolean;
  defaultValue?: string;
}

const DEBOUNCE_MS = 300;

export const SearchBar = ({ onSearch, isPending = false, defaultValue = '' }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearch(value);
    }, DEBOUNCE_MS);
  };

  return (
    <div className='relative group'>
      <div className='relative'>
        <Search
          className='absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none group-focus-within:text-foreground transition-colors'
          aria-hidden='true'
        />
        <Input
          type='text'
          value={localValue}
          onChange={handleChange}
          placeholder='Search games...'
          className='w-full pl-12 pr-5 py-4 border border-border bg-background text-base font-medium h-auto hover:border-foreground/20 transition-all focus:border-foreground focus:ring-0 focus:outline-none font-sans placeholder:text-muted-foreground/50 placeholder:font-mono placeholder:text-sm'
          disabled={isPending}
          aria-label='Search games by name, status, platform, or emulator'
        />
      </div>
    </div>
  );
};
