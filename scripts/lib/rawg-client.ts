/**
 * RAWG API Client
 * Fetches game metadata from RAWG Video Games Database API
 */

import type { RAWGAPIError, RAWGGame, RAWGSearchResponse } from '../types';

// RAWG API configuration
const RAWG_API_BASE = 'https://api.rawg.io/api';
const RAWG_API_KEY = 'bf46b24b1ee14b1ea2fe61955d6003b4';

// Rate limiting configuration (1.1 seconds between requests)
const REQUEST_DELAY_MS = 1100;

// Track last request time for rate limiting
let lastRequestTime = 0;

/**
 * Type guard for RAWG API errors
 */
const isRAWGAPIError = (value: unknown): value is RAWGAPIError => {
  return typeof value === 'object' && value !== null && 'error' in value && typeof (value as Record<string, unknown>).error === 'string';
};

/**
 * Type guard for RAWG search responses
 */
const isRAWGSearchResponse = (value: unknown): value is RAWGSearchResponse => {
  return typeof value === 'object' && value !== null && 'results' in value && Array.isArray((value as Record<string, unknown>).results);
};

/**
 * Delay to respect RAWG API rate limits
 */
const respectRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    const delayNeeded = REQUEST_DELAY_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delayNeeded));
  }

  lastRequestTime = Date.now();
};

/**
 * Search for a game by name in RAWG database
 * Returns the top search result or null if not found
 */
export const searchGame = async (gameName: string): Promise<RAWGGame | null> => {
  await respectRateLimit();

  const searchParams = new URLSearchParams({
    key: RAWG_API_KEY,
    search: gameName,
    page_size: '1',
  });

  const url = `${RAWG_API_BASE}/games?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[RAWG] HTTP ${response.status} for "${gameName}"`);
      return null;
    }

    const data: unknown = await response.json();

    if (isRAWGAPIError(data)) {
      console.warn(`[RAWG] API error for "${gameName}": ${data.error}`);
      return null;
    }

    if (!isRAWGSearchResponse(data)) {
      console.warn(`[RAWG] Invalid response format for "${gameName}"`);
      return null;
    }

    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.warn(`[RAWG] Fetch error for "${gameName}":`, error instanceof Error ? error.message : String(error));
    return null;
  }
};

/**
 * Enrichment data extracted from RAWG
 */
export interface GameEnrichmentData {
  readonly genres: readonly string[];
  readonly releaseYear: number | null;
  readonly isMultiplayer: boolean;
}

/**
 * Check if game has multiplayer support based on tags
 */
const hasMultiplayerSupport = (tags: readonly { name: string }[] | undefined): boolean => {
  if (!tags) {
    return false;
  }

  const multiplayerKeywords = ['multiplayer', 'co-op', 'online', 'local multiplayer', 'split screen'];

  return tags.some((tag) => multiplayerKeywords.some((keyword) => tag.name.toLowerCase().includes(keyword)));
};

/**
 * Extract release year from date string
 */
const extractReleaseYear = (released: string | null): number | null => {
  if (!released) {
    return null;
  }

  const year = new Date(released).getFullYear();
  return Number.isNaN(year) ? null : year;
};

/**
 * Enrich a single game with metadata from RAWG
 * Returns enrichment data with genres, release year, and multiplayer info
 */
export const enrichGame = async (gameName: string): Promise<GameEnrichmentData> => {
  const rawgGame = await searchGame(gameName);

  if (!rawgGame) {
    return {
      genres: [],
      releaseYear: null,
      isMultiplayer: false,
    };
  }

  return {
    genres: rawgGame.genres ? rawgGame.genres.map((genre) => genre.name) : [],
    releaseYear: extractReleaseYear(rawgGame.released),
    isMultiplayer: hasMultiplayerSupport(rawgGame.tags),
  };
};
