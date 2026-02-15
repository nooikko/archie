/**
 * Enrichment Cache
 * Caches RAWG API responses to avoid unnecessary API calls
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { EnrichmentCache, EnrichmentCacheEntry } from '../types';

// Cache configuration
const CACHE_VERSION = '1.0.0';
const CACHE_FILENAME = 'enrichment-cache.json';

/**
 * Get cache file path
 */
export const getCachePath = (projectRoot: string): string => {
  return path.join(projectRoot, 'data', CACHE_FILENAME);
};

/**
 * Cache value structure
 */
export interface CacheValue {
  readonly genres: readonly string[];
  readonly releaseYear: number | null;
  readonly isMultiplayer: boolean;
}

/**
 * Load enrichment cache from disk
 * Returns a Map for O(1) lookups
 */
export const loadCache = (cachePath: string): Map<string, CacheValue> => {
  const cacheMap = new Map<string, CacheValue>();

  if (!fs.existsSync(cachePath)) {
    console.log('[Cache] No cache file found, starting fresh');
    return cacheMap;
  }

  try {
    const cacheContent = fs.readFileSync(cachePath, 'utf-8');
    const cache: EnrichmentCache = JSON.parse(cacheContent);

    if (cache.version !== CACHE_VERSION) {
      console.warn(`[Cache] Version mismatch (found ${cache.version}, expected ${CACHE_VERSION}), ignoring cache`);
      return cacheMap;
    }

    for (const entry of cache.entries) {
      cacheMap.set(entry.gameName, {
        genres: entry.genres,
        releaseYear: entry.releaseYear,
        isMultiplayer: entry.isMultiplayer,
      });
    }

    console.log(`[Cache] Loaded ${cacheMap.size} entries from cache`);
    return cacheMap;
  } catch (error) {
    console.warn('[Cache] Failed to load cache:', error instanceof Error ? error.message : String(error));
    return cacheMap;
  }
};

/**
 * Save enrichment cache to disk
 */
export const saveCache = (cachePath: string, cacheMap: Map<string, CacheValue>): void => {
  const entries: EnrichmentCacheEntry[] = Array.from(cacheMap.entries()).map(([gameName, value]) => ({
    gameName,
    genres: value.genres,
    releaseYear: value.releaseYear,
    isMultiplayer: value.isMultiplayer,
    fetchedAt: new Date().toISOString(),
  }));

  const cache: EnrichmentCache = {
    entries,
    version: CACHE_VERSION,
  };

  // Ensure directory exists
  const cacheDir = path.dirname(cachePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`[Cache] Saved ${entries.length} entries to cache`);
};
