/**
 * Type definitions for build scripts
 */

import type { Game } from '../src/lib/search';

/**
 * Raw CSV row type (for parsing)
 * Uses Partial to handle incomplete rows during parsing
 */
export type GameCSVRow = Partial<Record<keyof Game, string>>;

/**
 * Validated game data with type safety
 * Ensures all required fields are present
 */
export interface ValidatedGame extends Game {
  readonly Game: string & { readonly __nonEmpty: true };
}

/**
 * Parse result from CSV processing
 */
export interface ParseResult {
  readonly games: ReadonlyArray<Game>;
  readonly errors: ReadonlyArray<ParseError>;
}

/**
 * Error type for parsing failures
 */
export interface ParseError {
  readonly row: number;
  readonly field?: keyof Game;
  readonly message: string;
  readonly data?: unknown;
}

/**
 * RAWG API genre information
 */
export interface RAWGGenre {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
}

/**
 * RAWG API tag information
 */
export interface RAWGTag {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
}

/**
 * RAWG API game response
 */
export interface RAWGGame {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly released: string | null;
  readonly genres?: readonly RAWGGenre[];
  readonly tags?: readonly RAWGTag[];
}

/**
 * RAWG API search response
 */
export interface RAWGSearchResponse {
  readonly count: number;
  readonly results: readonly RAWGGame[];
}

/**
 * RAWG API error response
 */
export interface RAWGAPIError {
  readonly error: string;
}

/**
 * Enrichment cache entry
 */
export interface EnrichmentCacheEntry {
  readonly gameName: string;
  readonly genres: readonly string[];
  readonly releaseYear: number | null;
  readonly isMultiplayer: boolean;
  readonly fetchedAt: string;
}

/**
 * Enrichment cache structure
 */
export interface EnrichmentCache {
  readonly entries: readonly EnrichmentCacheEntry[];
  readonly version: string;
}
