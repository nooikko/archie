#!/usr/bin/env tsx
/**
 * Build-time script to parse CSV and generate games data
 * Runs during Next.js prebuild phase
 * Enriches game data with genres from RAWG API (with caching)
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'papaparse';
import type { Game } from '../src/lib/search';
import { getCachePath, loadCache, saveCache } from './lib/enrichment-cache';
import { enrichGame } from './lib/rawg-client';
import type { ParseError, ParseResult } from './types';

// Project paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(PROJECT_ROOT, 'data', 'Archipelago_Master_Game_List.csv');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'search', 'data');
const GAMES_OUTPUT = path.join(OUTPUT_DIR, 'games-data.json');

// Progress reporting intervals
const CACHE_PROGRESS_INTERVAL = 50;
const API_PROGRESS_INTERVAL = 10;

/**
 * Parse CSV file with strict error handling
 */
const parseCSV = (csvPath: string): ParseResult => {
  console.log(`[Build] Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const games: Game[] = [];
  const errors: ParseError[] = [];

  const parseResult = parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  // Collect parsing errors
  if (parseResult.errors.length > 0) {
    for (const error of parseResult.errors) {
      errors.push({
        row: error.row ?? -1,
        message: error.message,
        data: error,
      });
    }
  }

  // Validate and type-check each row
  for (let i = 0; i < parseResult.data.length; i++) {
    const row = parseResult.data[i];

    if (!row || typeof row !== 'object') {
      errors.push({
        row: i + 2, // +2 for header row and 0-indexing
        message: 'Invalid row structure',
        data: row,
      });
      continue;
    }

    if (!row.Game || row.Game.trim() === '') {
      errors.push({
        row: i + 2,
        field: 'Game',
        message: 'Missing required field: Game',
        data: row,
      });
      continue;
    }

    games.push({
      Game: row.Game ?? '',
      Status: row.Status ?? '',
      Platform: row.Platform ?? '',
      Emulator: row.Emulator ?? '',
      IsArchipelagoTool: row.IsArchipelagoTool ?? 'false',
    });
  }

  console.log(`[Build] Parsed ${games.length} games with ${errors.length} errors`);

  if (errors.length > 0 && errors.length < 10) {
    console.warn('[Build] Parse errors:', errors);
  } else if (errors.length >= 10) {
    console.warn(`[Build] ${errors.length} parse errors (showing first 5):`);
    console.warn(errors.slice(0, 5));
  }

  return { games, errors };
};

/**
 * Enrich games with genre data from RAWG API
 */
const enrichGames = async (games: readonly Game[]): Promise<Game[]> => {
  const cachePath = getCachePath(PROJECT_ROOT);
  const cache = loadCache(cachePath);

  console.log(`[Enrich] Starting enrichment for ${games.length} games...`);

  const enrichedGames: Game[] = [];
  let cacheHits = 0;
  let apiCalls = 0;
  let notFound = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const progress = `(${i + 1}/${games.length})`;

    // Check cache first
    if (cache.has(game.Game)) {
      const cachedData = cache.get(game.Game);
      if (cachedData) {
        enrichedGames.push({
          ...game,
          Genres: cachedData.genres,
          ReleaseYear: cachedData.releaseYear,
          IsMultiplayer: cachedData.isMultiplayer,
        });
      }
      cacheHits++;

      if ((i + 1) % CACHE_PROGRESS_INTERVAL === 0) {
        console.log(`[Enrich] ${progress} Processed (${cacheHits} from cache, ${apiCalls} API calls)`);
      }
      continue;
    }

    // Fetch from API
    try {
      const enrichmentData = await enrichGame(game.Game);
      enrichedGames.push({
        ...game,
        Genres: enrichmentData.genres,
        ReleaseYear: enrichmentData.releaseYear,
        IsMultiplayer: enrichmentData.isMultiplayer,
      });
      cache.set(game.Game, enrichmentData);

      apiCalls++;
      if (enrichmentData.genres.length === 0) {
        notFound++;
      }

      if (apiCalls % API_PROGRESS_INTERVAL === 0) {
        console.log(`[Enrich] ${progress} Fetched from API (${apiCalls} calls, ${notFound} not found)`);
      }
    } catch (error) {
      console.warn(`[Enrich] Failed to enrich "${game.Game}":`, error instanceof Error ? error.message : String(error));
      const emptyData = { genres: [], releaseYear: null, isMultiplayer: false };
      enrichedGames.push({
        ...game,
        Genres: [],
        ReleaseYear: null,
        IsMultiplayer: false,
      });
      cache.set(game.Game, emptyData);
    }
  }

  saveCache(cachePath, cache);

  console.log('[Enrich] Enrichment complete:');
  console.log(`[Enrich]   - Cache hits: ${cacheHits}`);
  console.log(`[Enrich]   - API calls: ${apiCalls}`);
  console.log(`[Enrich]   - Not found: ${notFound}`);
  console.log(`[Enrich]   - Total with genres: ${enrichedGames.filter((g) => g.Genres && g.Genres.length > 0).length}`);

  return enrichedGames;
};

/**
 * Calculate MD5 hash of a file
 */
const calculateFileHash = (filePath: string): string => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
};

/**
 * Load existing games data metadata
 */
const loadGamesMetadata = (gamesPath: string): { csvHash?: string } | null => {
  if (!fs.existsSync(gamesPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(gamesPath, 'utf-8');
    const data = JSON.parse(content);
    return data.metadata || null;
  } catch {
    return null;
  }
};

/**
 * Save games data to disk
 */
const saveGamesData = (games: ReadonlyArray<Game>, gamesPath: string, csvHash: string): void => {
  console.log(`[Build] Saving games data to: ${gamesPath}`);

  try {
    // Use date-only format to avoid rebuilds on same day
    const today = new Date().toISOString().split('T')[0];

    const gamesData = {
      games: games,
      metadata: {
        count: games.length,
        generatedAt: today,
        version: '1.0.0',
        csvHash: csvHash,
      },
    };

    fs.writeFileSync(gamesPath, JSON.stringify(gamesData, null, 2), 'utf-8');
    console.log(`[Build] Saved ${games.length} games`);
  } catch (error) {
    throw new Error(`Failed to save games data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Ensure output directory exists
 */
const ensureOutputDirectory = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    console.log(`[Build] Creating output directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Main build function
 */
const main = async (): Promise<void> => {
  console.log('[Build] Starting games data build...');
  console.log(`[Build] Project root: ${PROJECT_ROOT}`);

  try {
    ensureOutputDirectory(OUTPUT_DIR);

    // Calculate CSV hash
    const currentCsvHash = calculateFileHash(CSV_PATH);
    console.log(`[Build] CSV hash: ${currentCsvHash}`);

    // Check if we need to regenerate
    const existingMetadata = loadGamesMetadata(GAMES_OUTPUT);
    if (existingMetadata && existingMetadata.csvHash === currentCsvHash) {
      console.log('[Build] ✓ CSV unchanged, skipping regeneration');
      console.log(`[Build]   - Use existing data: ${GAMES_OUTPUT}`);
      process.exit(0);
    }

    if (existingMetadata) {
      console.log('[Build] CSV changed, regenerating games data...');
    } else {
      console.log('[Build] No existing games data, generating...');
    }

    const { games, errors } = parseCSV(CSV_PATH);

    if (games.length === 0) {
      throw new Error('No games parsed from CSV. Check CSV format and content.');
    }

    console.log('\n[Build] Starting RAWG enrichment...');
    const enrichedGames = await enrichGames(games);

    saveGamesData(enrichedGames, GAMES_OUTPUT, currentCsvHash);

    const gamesWithGenres = enrichedGames.filter((g) => g.Genres && g.Genres.length > 0).length;
    const gamesSize = fs.statSync(GAMES_OUTPUT).size;

    console.log('\n[Build] ✓ Build complete!');
    console.log(`[Build]   - Games parsed: ${enrichedGames.length}`);
    console.log(`[Build]   - Games with genres: ${gamesWithGenres}`);
    console.log(`[Build]   - Parse errors: ${errors.length}`);
    console.log(`[Build]   - Games output: ${GAMES_OUTPUT}`);
    console.log(`[Build]   - Games size: ${(gamesSize / 1024).toFixed(2)} KB`);

    process.exit(0);
  } catch (error) {
    console.error('\n[Build] ✗ Build failed!');
    console.error(`[Build] Error: ${error instanceof Error ? error.message : String(error)}`);

    if (error instanceof Error && error.stack) {
      console.error(`[Build] Stack trace:\n${error.stack}`);
    }

    process.exit(1);
  }
};

// Run the build
main().catch((error) => {
  console.error('[Build] Unhandled error:', error);
  process.exit(1);
});
