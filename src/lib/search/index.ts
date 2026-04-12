/**
 * Search module - loads game data from JSON
 */

import gamesDataJson from './data/games-data.json';

/**
 * Main game interface — blended from Drive sheet, Discord links, CSV, and RAWG API
 */
export interface Game {
  /** Name of the game (primary identifier) */
  readonly Game: string;
  /** Classification: Game | Tool | Meta Game | Hint Game */
  readonly Type: 'Game' | 'Tool' | 'Meta Game' | 'Hint Game';
  /** Stability status: Official | Stable | Unstable | Broken on Main */
  readonly Status: string;
  /** Platform: PC, SNES, PS1, etc. */
  readonly Platform: string;
  /** Emulator required: DuckStation, BizHawk, PCSX2, etc. Empty for native PC games */
  readonly Emulator: string;
  /** PR status from community Drive sheet: In Review | Not PRing | -- */
  readonly PrStatus: string;
  /** Direct download URL (from Discord apworld-index channel) */
  readonly DownloadUrl: string;
  /** Included with the main Archipelago installation */
  readonly IsBundled: boolean;
  /** Only accessible via a private Discord thread or channel */
  readonly IsDiscordOnly: boolean;
  /** Officially bundled and listed in the Core-Verified sheet */
  readonly IsCoreVerified: boolean;
  /** Flagged 18+ or unrated in the community Drive sheet */
  readonly IsAdultContent: boolean;
  /** Community notes from the Drive sheet */
  readonly Notes: string;
  /** Genres from RAWG API */
  readonly Genres?: readonly string[];
  /** Release year from RAWG API */
  readonly ReleaseYear?: number | null;
  /** Multiplayer support from RAWG API */
  readonly IsMultiplayer?: boolean;
}

/**
 * All games loaded from JSON at build time
 */
export const allGames: readonly Game[] = gamesDataJson.games as unknown as Game[];
