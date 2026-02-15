'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import type { Game } from '@/lib/search';
import { GameFilters } from './game-filters';
import { GameGrid } from './game-grid';
import { SearchBar } from './search-bar';

interface GameBrowserProps {
  allGames: readonly Game[];
}

/**
 * Client-side game browser with instant search, multi-select filters, and URL sync
 * Filters games locally for fast, responsive searching
 * Syncs search query and filters to URL for shareable links
 * Supports multiple selections per filter (e.g., ?status=Official,Stable)
 */
export const GameBrowser = ({ allGames }: GameBrowserProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse comma-separated values from URL
  const parseUrlArray = (param: string | null): string[] => {
    if (!param) {
      return [];
    }
    return param.split(',').filter(Boolean);
  };

  // Initialize from URL query parameters
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [filters, setFilters] = useState(() => ({
    status: parseUrlArray(searchParams.get('status')),
    platform: parseUrlArray(searchParams.get('platform')),
    emulator: parseUrlArray(searchParams.get('emulator')),
  }));
  const [isPending, startTransition] = useTransition();

  // Filter games based on search query and filters
  const filteredGames = useMemo(() => {
    let results = allGames;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter((game) => {
        return (
          game.Game.toLowerCase().includes(query) ||
          game.Status.toLowerCase().includes(query) ||
          game.Platform.toLowerCase().includes(query) ||
          game.Emulator.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter (match any selected status)
    if (filters.status.length > 0) {
      results = results.filter((game) => filters.status.includes(game.Status));
    }

    // Apply platform filter (match any selected platform)
    if (filters.platform.length > 0) {
      results = results.filter((game) => filters.platform.includes(game.Platform));
    }

    // Apply emulator filter (match any selected emulator)
    if (filters.emulator.length > 0) {
      results = results.filter((game) => filters.emulator.includes(game.Emulator));
    }

    return results;
  }, [allGames, searchQuery, filters]);

  // Update URL with current search and filter state
  const updateUrl = (newQuery: string, newFilters: typeof filters) => {
    const params = new URLSearchParams();

    if (newQuery) {
      params.set('q', newQuery);
    }
    if (newFilters.status.length > 0) {
      params.set('status', newFilters.status.join(','));
    }
    if (newFilters.platform.length > 0) {
      params.set('platform', newFilters.platform.join(','));
    }
    if (newFilters.emulator.length > 0) {
      params.set('emulator', newFilters.emulator.join(','));
    }

    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const handleSearch = (query: string) => {
    startTransition(() => {
      setSearchQuery(query);
      updateUrl(query, filters);
    });
  };

  const handleFilterChange = (filterType: 'status' | 'platform' | 'emulator', values: string[]) => {
    startTransition(() => {
      const newFilters = { ...filters, [filterType]: values };
      setFilters(newFilters);
      updateUrl(searchQuery, newFilters);
    });
  };

  return (
    <div className='space-y-6'>
      <SearchBar onSearch={handleSearch} isPending={isPending} defaultValue={searchQuery} />
      <GameFilters allGames={allGames} filters={filters} onFilterChange={handleFilterChange} />
      <GameGrid games={filteredGames} />
    </div>
  );
};
