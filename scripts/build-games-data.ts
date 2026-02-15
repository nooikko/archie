#!/usr/bin/env tsx
/**
 * Build-time script to parse CSV and generate games data
 * Runs during Next.js prebuild phase
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'papaparse';
import type { Game } from '../src/lib/search';
import type { ParseError, ParseResult } from './types';

// Absolute paths for file operations
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(PROJECT_ROOT, 'Archipelago_Master_Game_List.csv');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'search', 'data');
const GAMES_OUTPUT = path.join(OUTPUT_DIR, 'games-data.json');

/**
 * Parse CSV file with strict error handling
 */
function parseCSV(csvPath: string): ParseResult {
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

    // Check if row has the required Game field
    if (!row || typeof row !== 'object') {
      errors.push({
        row: i + 2, // +2 because of header row and 0-indexing
        message: 'Invalid row structure',
        data: row,
      });
      continue;
    }

    // Ensure Game field exists and is non-empty
    if (!row.Game || row.Game.trim() === '') {
      errors.push({
        row: i + 2,
        field: 'Game',
        message: 'Missing required field: Game',
        data: row,
      });
      continue;
    }

    // Create game object with all fields (use empty string for missing values)
    const game: Game = {
      Game: row.Game ?? '',
      Status: row.Status ?? '',
      Platform: row.Platform ?? '',
      Emulator: row.Emulator ?? '',
    };

    games.push(game);
  }

  console.log(`[Build] Parsed ${games.length} games with ${errors.length} errors`);

  if (errors.length > 0 && errors.length < 10) {
    console.warn('[Build] Parse errors:', errors);
  } else if (errors.length >= 10) {
    console.warn(`[Build] ${errors.length} parse errors (showing first 5):`);
    console.warn(errors.slice(0, 5));
  }

  return { games, errors };
}

/**
 * Save games data to disk
 */
function saveGamesData(games: ReadonlyArray<Game>, gamesPath: string): void {
  console.log(`[Build] Saving games data to: ${gamesPath}`);

  try {
    const gamesData = {
      games: games,
      metadata: {
        count: games.length,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    fs.writeFileSync(gamesPath, JSON.stringify(gamesData, null, 2), 'utf-8');
    console.log(`[Build] Saved ${games.length} games`);
  } catch (error) {
    throw new Error(`Failed to save games data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    console.log(`[Build] Creating output directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Main build function
 */
async function main(): Promise<void> {
  console.log('[Build] Starting games data build...');
  console.log(`[Build] Project root: ${PROJECT_ROOT}`);

  try {
    // Ensure output directory exists
    ensureOutputDirectory(OUTPUT_DIR);

    // Parse CSV
    const { games, errors } = parseCSV(CSV_PATH);

    if (games.length === 0) {
      throw new Error('No games parsed from CSV. Check CSV format and content.');
    }

    // Save games data
    saveGamesData(games, GAMES_OUTPUT);

    // Print summary
    console.log('\n[Build] ✓ Build complete!');
    console.log(`[Build]   - Games parsed: ${games.length}`);
    console.log(`[Build]   - Parse errors: ${errors.length}`);
    console.log(`[Build]   - Games output: ${GAMES_OUTPUT}`);

    // Check file size
    const gamesSize = fs.statSync(GAMES_OUTPUT).size;
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
}

// Run the build
main().catch((error) => {
  console.error('[Build] Unhandled error:', error);
  process.exit(1);
});
