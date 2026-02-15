/**
 * Search module - loads game data from JSON
 */

import gamesDataJson from './data/games-data.json';

/**
 * Main game interface representing a row in the CSV + enriched data from RAWG API
 */
export interface Game {
  /** Name of the game (primary identifier) */
  readonly Game: string;
  /** Development status: Official, Stable, Unstable, etc. */
  readonly Status: string;
  /** Platform: PC, SNES, PS1, etc. */
  readonly Platform: string;
  /** Emulator required: DuckStation, BizHawk, PCSX2, etc. Empty for native PC games */
  readonly Emulator: string;
  /** Whether this is an Archipelago-specific tool (not a standalone video game) */
  readonly IsArchipelagoTool: string;
  /** Genres from RAWG API (enriched data, may be empty array if not found) */
  readonly Genres?: readonly string[];
  /** Release year from RAWG API (enriched data, null if not found) */
  readonly ReleaseYear?: number | null;
  /** Multiplayer support from RAWG API (enriched data, false if not found) */
  readonly IsMultiplayer?: boolean;
}

/**
 * All games loaded from JSON at build time
 */
export const allGames: readonly Game[] = gamesDataJson.games;
