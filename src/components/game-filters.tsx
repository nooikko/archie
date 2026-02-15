'use client';

import { ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Game } from '@/lib/search';

interface GameFiltersProps {
  allGames: readonly Game[];
  filters: {
    status: string[];
    platform: string[];
    emulator: string[];
    genre: string[];
  };
  onFilterChange: (filterType: 'status' | 'platform' | 'emulator' | 'genre', values: string[]) => void;
}

export const GameFilters = ({ allGames, filters, onFilterChange }: GameFiltersProps) => {
  // Track popover/sheet open states
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Detect mobile screen size - start with false to match server render
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Extract unique values for each filter
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const platforms = new Set<string>();
    const emulators = new Set<string>();
    const genres = new Set<string>();

    for (const game of allGames) {
      if (game.Status) {
        statuses.add(game.Status);
      }
      if (game.Platform) {
        platforms.add(game.Platform);
      }
      if (game.Emulator) {
        emulators.add(game.Emulator);
      }
      if (game.Genres) {
        for (const genre of game.Genres) {
          genres.add(genre);
        }
      }
    }

    return {
      statuses: Array.from(statuses).sort(),
      platforms: Array.from(platforms).sort(),
      emulators: Array.from(emulators).sort(),
      genres: Array.from(genres).sort(),
    };
  }, [allGames]);

  const toggleFilter = (filterType: 'status' | 'platform' | 'emulator' | 'genre', value: string) => {
    const currentValues = filters[filterType];
    const newValues = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const removeFilter = (filterType: 'status' | 'platform' | 'emulator' | 'genre', value: string) => {
    const newValues = filters[filterType].filter((v) => v !== value);
    onFilterChange(filterType, newValues);
  };

  const clearAllFilters = () => {
    onFilterChange('status', []);
    onFilterChange('platform', []);
    onFilterChange('emulator', []);
    onFilterChange('genre', []);
  };

  const hasActiveFilters = filters.status.length > 0 || filters.platform.length > 0 || filters.emulator.length > 0 || filters.genre.length > 0;

  const renderMultiSelectFilter = (
    filterType: 'status' | 'platform' | 'emulator' | 'genre',
    label: string,
    options: string[],
    selectedValues: string[],
  ) => {
    const isOpen = openPopover === filterType;

    const triggerButton = (
      <Button
        variant='outline'
        className='h-auto min-h-[40px] justify-between gap-2 sm:gap-3 border-border bg-background px-2.5 sm:px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:border-foreground/30 hover:bg-muted/50 data-[state=open]:border-foreground/50 data-[state=open]:bg-muted/30'
      >
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <span className='text-muted-foreground'>
            {label}
            {selectedValues.length > 0 && (
              <span className='ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background'>
                {selectedValues.length}
              </span>
            )}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    );

    const filterContent = (
      <Command className='rounded-lg border-border'>
        <CommandInput placeholder={`Search ${label.toLowerCase()}...`} className='h-10 font-mono text-xs' />
        <CommandList className='max-h-[50vh] sm:max-h-[300px]'>
          <CommandEmpty className='py-6 text-center font-mono text-xs text-muted-foreground'>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => toggleFilter(filterType, option)}
                  className='cursor-pointer font-mono text-xs aria-selected:bg-accent aria-selected:text-accent-foreground'
                >
                  <div className='flex items-center gap-3'>
                    <Checkbox checked={isSelected} className='h-4 w-4 shrink-0' />
                    <span className={isSelected ? 'font-semibold' : ''}>{option}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    );

    // Mobile: Use Sheet (bottom drawer) - only after client hydration
    if (isClient && isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={(open) => setOpenPopover(open ? filterType : null)}>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent side='bottom' className='p-0 max-h-[80vh]'>
            <SheetHeader className='px-4 pt-6 pb-4 border-b'>
              <SheetTitle className='font-mono text-sm uppercase tracking-widest'>{label} Filter</SheetTitle>
            </SheetHeader>
            <div className='px-2 pb-6'>{filterContent}</div>
          </SheetContent>
        </Sheet>
      );
    }

    // Desktop: Use Popover (also used for SSR to avoid hydration mismatch)
    return (
      <Popover open={isOpen} onOpenChange={(open) => setOpenPopover(open ? filterType : null)}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className='w-[280px] p-0' align='start' sideOffset={8}>
          {filterContent}
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Filter Controls */}
      <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
        <span className='font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-full sm:w-auto'>Filters:</span>

        {renderMultiSelectFilter('status', 'Status', filterOptions.statuses, filters.status)}
        {renderMultiSelectFilter('platform', 'Platform', filterOptions.platforms, filters.platform)}
        {renderMultiSelectFilter('emulator', 'Emulator', filterOptions.emulators, filters.emulator)}
        {renderMultiSelectFilter('genre', 'Genre', filterOptions.genres, filters.genre)}

        {hasActiveFilters && (
          <Button
            type='button'
            variant='ghost'
            onClick={clearAllFilters}
            className='h-auto px-2.5 sm:px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground'
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Selected Filters Display */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200'>
          {filters.status.map((value) => (
            <Badge
              key={`status-${value}`}
              variant='secondary'
              className='group gap-1.5 pr-1.5 font-mono text-[10px] uppercase tracking-wide transition-all hover:bg-secondary/80'
            >
              <span className='text-muted-foreground'>Status:</span>
              <span className='font-semibold'>{value}</span>
              <button
                type='button'
                onClick={() => removeFilter('status', value)}
                className='ml-0.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label={`Remove ${value} filter`}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          {filters.platform.map((value) => (
            <Badge
              key={`platform-${value}`}
              variant='secondary'
              className='group gap-1.5 pr-1.5 font-mono text-[10px] uppercase tracking-wide transition-all hover:bg-secondary/80'
            >
              <span className='text-muted-foreground'>Platform:</span>
              <span className='font-semibold'>{value}</span>
              <button
                type='button'
                onClick={() => removeFilter('platform', value)}
                className='ml-0.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label={`Remove ${value} filter`}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          {filters.emulator.map((value) => (
            <Badge
              key={`emulator-${value}`}
              variant='secondary'
              className='group gap-1.5 pr-1.5 font-mono text-[10px] uppercase tracking-wide transition-all hover:bg-secondary/80'
            >
              <span className='text-muted-foreground'>Emulator:</span>
              <span className='font-semibold'>{value}</span>
              <button
                type='button'
                onClick={() => removeFilter('emulator', value)}
                className='ml-0.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label={`Remove ${value} filter`}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          {filters.genre.map((value) => (
            <Badge
              key={`genre-${value}`}
              variant='secondary'
              className='group gap-1.5 pr-1.5 font-mono text-[10px] uppercase tracking-wide transition-all hover:bg-secondary/80'
            >
              <span className='text-muted-foreground'>Genre:</span>
              <span className='font-semibold'>{value}</span>
              <button
                type='button'
                onClick={() => removeFilter('genre', value)}
                className='ml-0.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label={`Remove ${value} filter`}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
