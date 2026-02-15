/**
 * Search module - loads game data from JSON
 */

import gamesDataJson from './data/games-data.json';

/**
 * Main game interface representing a row in the CSV
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
}

/**
 * All games loaded from JSON at build time
 */
export const allGames: readonly Game[] = gamesDataJson.games;
