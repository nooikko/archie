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
