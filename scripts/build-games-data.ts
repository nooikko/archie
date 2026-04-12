#!/usr/bin/env tsx
/**
 * Build-time script: reads blended-games.json, enriches with RAWG genre data, and
 * writes src/lib/search/data/games-data.json for bundling into the app.
 *
 * Skips regeneration when blended-games.json is unchanged (hash check).
 * RAWG results are persisted in data/enrichment-cache.json (keyed by game name).
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Game } from '../src/lib/search';
import type { BlendedGame } from './blend-data';
import { getCachePath, loadCache, saveCache } from './lib/enrichment-cache';
import { enrichGame } from './lib/rawg-client';

// ─── Paths ───────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLENDED_PATH = path.join(PROJECT_ROOT, 'data', 'blended-games.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'search', 'data');
const GAMES_OUTPUT = path.join(OUTPUT_DIR, 'games-data.json');

const CACHE_PROGRESS_INTERVAL = 50;
const API_PROGRESS_INTERVAL = 10;

// ─── Env / skip guard ────────────────────────────────────────────────────────

// Load .env if present (local dev; no-op in CI/Vercel where it doesn't exist)
const envPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)/);
    if (match) {
      let value = match[2].trim();
      const quoteMatch = value.match(/^(['"])(.*)\1$/);
      if (quoteMatch) {
        value = quoteMatch[2].replace(/\\(['"])/g, '$1');
      } else {
        value = value.replace(/\s*#.*$/, '').trimEnd();
      }
      process.env[match[1].trim()] = value;
    }
  }
}

if (!process.env.RAWG_API_KEY) {
  if (fs.existsSync(GAMES_OUTPUT)) {
    try {
      const data = JSON.parse(fs.readFileSync(GAMES_OUTPUT, 'utf8'));
      if (Array.isArray(data.games) && data.games.length > 0) {
        console.log('build-games-data: no RAWG_API_KEY and games-data.json exists — skipping rebuild.');
        process.exit(0);
      }
      console.error('build-games-data: games-data.json exists but failed validation — rebuilding requires RAWG_API_KEY.');
    } catch {
      console.error('build-games-data: games-data.json exists but is corrupt — rebuilding requires RAWG_API_KEY.');
    }
  }
  console.error('build-games-data: RAWG_API_KEY is not set and games-data.json is missing or invalid. Run the data pipeline locally first.');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calculateFileHash = (filePath: string): string => crypto.createHash('md5').update(fs.readFileSync(filePath, 'utf-8')).digest('hex');

const loadOutputMetadata = (outputPath: string): { sourceHash?: string } | null => {
  if (!fs.existsSync(outputPath)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    return data.metadata ?? null;
  } catch {
    return null;
  }
};

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ─── Status derivation ───────────────────────────────────────────────────────

/**
 * Derive the Status field used by the UI colour system from blended data.
 *  - Core-verified bundled games → "Official"
 *  - Everything else → the Drive stability value (Stable / Unstable / Broken on Main)
 */
const deriveStatus = (g: BlendedGame): string => {
  if (g.isCoreVerified || (g.isBundled && !g.stability)) {
    return 'Official';
  }
  return g.stability || '';
};

// ─── Enrichment ──────────────────────────────────────────────────────────────

const enrichGames = async (games: readonly BlendedGame[]): Promise<Game[]> => {
  const cachePath = getCachePath(PROJECT_ROOT);
  const cache = loadCache(cachePath);

  console.log(`[Enrich] Starting enrichment for ${games.length} games...`);

  const enriched: Game[] = [];
  let cacheHits = 0;
  let apiCalls = 0;
  let notFound = 0;

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const progress = `(${i + 1}/${games.length})`;

    if (cache.has(g.name)) {
      const cached = cache.get(g.name)!;
      const base: Omit<Game, 'Genres' | 'ReleaseYear' | 'IsMultiplayer'> = {
        Game: g.name,
        Type: g.type,
        Status: deriveStatus(g),
        Platform: g.platform || cached.platform,
        Emulator: g.emulator,
        PrStatus: g.prStatus,
        DownloadUrl: g.downloadUrl,
        IsBundled: g.isBundled,
        IsDiscordOnly: g.isDiscordOnly,
        IsCoreVerified: g.isCoreVerified,
        IsAdultContent: g.isAdultContent,
        Notes: g.notes,
      };
      enriched.push({ ...base, Genres: cached.genres as string[], ReleaseYear: cached.releaseYear, IsMultiplayer: cached.isMultiplayer });
      cacheHits++;
      if ((i + 1) % CACHE_PROGRESS_INTERVAL === 0) {
        console.log(`[Enrich] ${progress} Processed (${cacheHits} cache, ${apiCalls} API)`);
      }

      continue;
    }

    try {
      const data = await enrichGame(g.name);
      const base: Omit<Game, 'Genres' | 'ReleaseYear' | 'IsMultiplayer'> = {
        Game: g.name,
        Type: g.type,
        Status: deriveStatus(g),
        Platform: g.platform || data.platform,
        Emulator: g.emulator,
        PrStatus: g.prStatus,
        DownloadUrl: g.downloadUrl,
        IsBundled: g.isBundled,
        IsDiscordOnly: g.isDiscordOnly,
        IsCoreVerified: g.isCoreVerified,
        IsAdultContent: g.isAdultContent,
        Notes: g.notes,
      };
      enriched.push({ ...base, Genres: data.genres as string[], ReleaseYear: data.releaseYear, IsMultiplayer: data.isMultiplayer });
      cache.set(g.name, data);
      apiCalls++;
      if (data.genres.length === 0) {
        notFound++;
      }
      if (apiCalls % API_PROGRESS_INTERVAL === 0) {
        console.log(`[Enrich] ${progress} API calls: ${apiCalls} (${notFound} not found)`);
      }
    } catch (err) {
      const base: Omit<Game, 'Genres' | 'ReleaseYear' | 'IsMultiplayer'> = {
        Game: g.name,
        Type: g.type,
        Status: deriveStatus(g),
        Platform: g.platform,
        Emulator: g.emulator,
        PrStatus: g.prStatus,
        DownloadUrl: g.downloadUrl,
        IsBundled: g.isBundled,
        IsDiscordOnly: g.isDiscordOnly,
        IsCoreVerified: g.isCoreVerified,
        IsAdultContent: g.isAdultContent,
        Notes: g.notes,
      };
      console.warn(`[Enrich] Failed to enrich "${g.name}":`, err instanceof Error ? err.message : String(err));
      enriched.push({ ...base, Genres: [], ReleaseYear: null, IsMultiplayer: false });
      cache.set(g.name, { genres: [], releaseYear: null, isMultiplayer: false, platform: '' });
    }
  }

  saveCache(cachePath, cache);

  console.log('[Enrich] Complete:');
  console.log(`[Enrich]   Cache hits : ${cacheHits}`);
  console.log(`[Enrich]   API calls  : ${apiCalls}`);
  console.log(`[Enrich]   Not found  : ${notFound}`);
  console.log(`[Enrich]   With genres: ${enriched.filter((g) => g.Genres && g.Genres.length > 0).length}`);

  return enriched;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  console.log('[Build] Starting games data build...');

  try {
    ensureDir(OUTPUT_DIR);

    if (!fs.existsSync(BLENDED_PATH)) {
      if (fs.existsSync(GAMES_OUTPUT)) {
        console.log('[Build] ✓ data/blended-games.json not found, using existing games-data.json');
        process.exit(0);
      }
      throw new Error(`blended-games.json not found at ${BLENDED_PATH}. Run "pnpm blend" first.`);
    }

    const sourceHash = calculateFileHash(BLENDED_PATH);
    console.log(`[Build] Source hash: ${sourceHash}`);

    const existing = loadOutputMetadata(GAMES_OUTPUT);
    if (existing?.sourceHash === sourceHash) {
      console.log('[Build] ✓ blended-games.json unchanged, skipping regeneration');
      process.exit(0);
    }

    const blended: { games: BlendedGame[] } = JSON.parse(fs.readFileSync(BLENDED_PATH, 'utf-8'));
    console.log(`[Build] Loaded ${blended.games.length} blended games`);

    const enriched = await enrichGames(blended.games);

    const today = new Date().toISOString().split('T')[0];
    const output = {
      games: enriched,
      metadata: {
        count: enriched.length,
        generatedAt: today,
        version: '2.0.0',
        sourceHash,
      },
    };

    fs.writeFileSync(GAMES_OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

    const sizekb = (fs.statSync(GAMES_OUTPUT).size / 1024).toFixed(2);
    console.log('\n[Build] ✓ Build complete!');
    console.log(`[Build]   Games : ${enriched.length}`);
    console.log(`[Build]   Size  : ${sizekb} KB`);
    console.log(`[Build]   Output: ${GAMES_OUTPUT}`);

    process.exit(0);
  } catch (err) {
    console.error('[Build] ✗ Build failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};

main().catch((err) => {
  console.error('[Build] Unhandled error:', err);
  process.exit(1);
});
