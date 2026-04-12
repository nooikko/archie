#!/usr/bin/env tsx
/**
 * Blend three data sources into a unified, deduplicated games dataset:
 *   1. data/Archipelago_Master_Game_List.csv       — platform, emulator, historical status
 *   2. data/discord/links.md                       — download URLs, bundled/discord-only flags
 *   3. data/drive/Archipelago Games Sheet.xlsx     — stability, PR status, type, notes
 *
 * Output: data/blended-games.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(PROJECT_ROOT, 'data', 'Archipelago_Master_Game_List.csv');
const DISCORD_PATH = path.join(PROJECT_ROOT, 'data', 'discord', 'links.md');
const DRIVE_PATH = path.join(PROJECT_ROOT, 'data', 'drive', 'Archipelago Games Sheet.xlsx');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'data', 'blended-games.json');

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type GameType = 'Game' | 'Tool' | 'Meta Game' | 'Hint Game';

export interface BlendedGame {
  /** Display name */
  readonly name: string;
  /** Game vs tool/meta/hint classification */
  readonly type: GameType;
  /** Hardware platform: PC, SNES, N64, PS1, etc. */
  readonly platform: string;
  /** Emulator required: BizHawk, DuckStation, etc. Empty for native PC */
  readonly emulator: string;
  /** Stability from Drive sheet (authoritative): Stable | Unstable | Broken on Main */
  readonly stability: string;
  /** PR status from Drive sheet: In Review | Not PRing | -- */
  readonly prStatus: string;
  /** Direct download URL (from Discord links) */
  readonly downloadUrl: string;
  /** Included with the main Archipelago installation */
  readonly isBundled: boolean;
  /** Only available via a private Discord thread/channel */
  readonly isDiscordOnly: boolean;
  /** Listed in the Core-Verified (officially bundled) sheet */
  readonly isCoreVerified: boolean;
  /** Flagged 18+ or unrated in the Drive sheet */
  readonly isAdultContent: boolean;
  /** Community notes from the Drive sheet */
  readonly notes: string;
  /** Which sources contributed data for this entry */
  readonly sources: readonly string[];
}

interface BlendOutput {
  games: BlendedGame[];
  metadata: {
    count: number;
    generatedAt: string;
    sourceCounts: Record<string, number>;
    unmatched: {
      csv: string[];
      discord: string[];
      drive: string[];
    };
  };
}

// ─────────────────────────────────────────────────────────────
// Name normalisation (used as merge key)
// ─────────────────────────────────────────────────────────────

/**
 * Known platform tokens — used to identify trailing platform suffixes in Discord entries.
 * e.g. "Super Mario 64 (N64/PC)" → strip "(N64/PC)" → "Super Mario 64"
 */
const KNOWN_PLATFORM_TOKENS = new Set([
  'PC',
  'N64',
  'SNES',
  'GBA',
  'GB',
  'GBC',
  'PSX',
  'PS1',
  'PS2',
  'PS3',
  'NES',
  'GC',
  'WII',
  'WII U',
  'DS',
  'NDS',
  '3DS',
  'PSP',
  'SMS',
  'GEN',
  'VR',
  'WEB',
  'MOBILE',
  'ANDROID',
  'PICO-8',
  '2600',
  'PHYSICAL',
  'GAMECUBE',
  'ATARI',
  'SENS',
  'HGSS',
  'PC/MOBILE',
  'N64/PC',
  'SNES/PC',
  'PC / PHYSICAL',
  'PC/WEB',
  'WEB/PC',
]);

/** Returns true when all slash-delimited parts of `inner` are known platform tokens. */
const looksLikePlatform = (inner: string): boolean => {
  const parts = inner.toUpperCase().split(/\s*[/,]\s*/);
  return parts.every((p) => KNOWN_PLATFORM_TOKENS.has(p.trim()));
};

/**
 * Extract the trailing platform suffix from a Discord entry name.
 *
 * "Super Mario 64 (N64/PC)"         → { baseName: "Super Mario 64", platform: "N64/PC" }
 * "Pokémon Ranger (Quest) (DS)"      → { baseName: "Pokémon Ranger (Quest)", platform: "DS" }
 * "Celeste (Open World) (PC)"        → { baseName: "Celeste (Open World)", platform: "PC" }
 * "APWebChat-Vue"                    → { baseName: "APWebChat-Vue", platform: "" }
 */
const extractPlatform = (raw: string): { baseName: string; platform: string } => {
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match && looksLikePlatform(match[2])) {
    return { baseName: match[1].trim(), platform: match[2].trim() };
  }
  return { baseName: raw.trim(), platform: '' };
};

/** Normalise a name for use as a merge key. */
const normalise = (name: string): string =>
  name
    .toLowerCase()
    .replace(/-/g, ' ') // hyphens → space (Choo-Choo → Choo Choo)
    .replace(/[''`:!?.,]/g, '') // strip other punctuation
    .replace(/\s+/g, ' ')
    .trim();

// ─────────────────────────────────────────────────────────────
// 1. Parse Discord links.md
// ─────────────────────────────────────────────────────────────

interface DiscordEntry {
  name: string;
  platform: string;
  url: string;
  isBundled: boolean;
  isDiscordOnly: boolean;
  type: GameType;
}

/**
 * Find the split point between the game name+platform and the URL/status in a Discord entry line.
 * Game names can contain colons (e.g. "The Legend of Zelda: OoT (N64): Bundled") so we must
 * find the `: ` that precedes a known URL prefix or status string, not just the first one.
 */
const splitDiscordLine = (line: string): { namePart: string; urlPart: string } | null => {
  const KNOWN_PREFIXES = ['https://', 'http://', 'Bundled with Archipelago', 'Discord Thread Only', 'Discord Channel Only'];

  for (const prefix of KNOWN_PREFIXES) {
    const needle = `: ${prefix}`;
    const idx = line.indexOf(needle);
    if (idx !== -1) {
      return { namePart: line.slice(0, idx).trim(), urlPart: line.slice(idx + 2).trim() };
    }
  }
  return null;
};

const parseDiscord = (filePath: string): DiscordEntry[] => {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const entries: DiscordEntry[] = [];

  let currentType: GameType = 'Game';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    // Section header (no ": http" or known status) → update current type context
    const upper = line.toUpperCase();
    if (upper.startsWith('META/TOOL') || upper.startsWith('TOOL APWORLD')) {
      currentType = 'Tool';
      continue;
    }
    if (upper.startsWith('HINT GAME')) {
      currentType = 'Hint Game';
      continue;
    }
    if (upper.startsWith('GAMES ') || upper === 'GAMES') {
      currentType = 'Game';
      continue;
    }

    const split = splitDiscordLine(line);
    if (!split) {
      continue;
    }

    const { namePart, urlPart } = split;
    const { baseName, platform } = extractPlatform(namePart);
    if (!baseName) {
      continue;
    }

    const isBundled = urlPart === 'Bundled with Archipelago';
    const isDiscordOnly = urlPart === 'Discord Thread Only' || urlPart === 'Discord Channel Only';
    const url = isBundled || isDiscordOnly ? '' : urlPart;

    entries.push({ name: baseName, platform, url, isBundled, isDiscordOnly, type: currentType });
  }

  console.log(`[Discord] Parsed ${entries.length} entries`);
  return entries;
};

// ─────────────────────────────────────────────────────────────
// 2. Parse Drive XLSX
// ─────────────────────────────────────────────────────────────

interface DrivePlayableGame {
  name: string;
  stability: string;
  prStatus: string;
  isAdultContent: boolean;
  notes: string;
  downloadUrl: string;
}

interface DriveTool {
  name: string;
  type: GameType;
  downloadUrl: string;
}

interface DriveData {
  playable: DrivePlayableGame[];
  coreVerifiedNames: string[];
  coreVerified: Set<string>;
  tools: DriveTool[];
}

/** Extract the hyperlink URL from a worksheet cell address, if present. */
const getCellLink = (ws: XLSX.WorkSheet, addr: string): string => {
  const cell = ws[addr];
  return cell?.l?.Target ?? '';
};

const parseDrive = (filePath: string): DriveData => {
  const wb = XLSX.readFile(filePath);

  const getRows = (sheetName: string): string[][] =>
    XLSX.utils.sheet_to_json<string[]>(wb.Sheets[sheetName], { header: 1, defval: '' }) as string[][];

  // Playable Worlds: 5 description rows → col header row at index 5 → data from index 6
  // Col D (index 3) = Links & Downloads — hyperlink target is the download URL
  const playableWs = wb.Sheets['Playable Worlds'];
  const playableRows = getRows('Playable Worlds');
  const playable: DrivePlayableGame[] = playableRows
    .slice(6)
    .filter((row) => row[0] && String(row[0]).trim())
    .map((row, i) => ({
      name: String(row[0]).trim(),
      stability: String(row[1] ?? '').trim(),
      prStatus: String(row[2] ?? '').trim(),
      isAdultContent: String(row[4] ?? '').trim() === '1',
      notes: String(row[5] ?? '').trim(),
      // Row offset: 6 header rows + 1-based Excel rows
      downloadUrl: getCellLink(playableWs, `D${i + 7}`),
    }));

  // Core-Verified Worlds: description at 0 → col header at 1 → data from 2
  const coreRows = getRows('Core-Verified Worlds');
  const coreVerifiedNames: string[] = coreRows
    .slice(2)
    .map((row) => String(row[0] ?? '').trim())
    .filter(Boolean);
  const coreVerified = new Set<string>(coreVerifiedNames.map(normalise));

  // Tools, Meta Games, & Hint Games: 2 description rows → col header at 2 → data from 3
  // Col C (index 2) = Links & Downloads
  const toolsWs = wb.Sheets['Tools, Meta Games, & Hint Games'];
  const toolRows = getRows('Tools, Meta Games, & Hint Games');
  const tools: DriveTool[] = toolRows
    .slice(3)
    .filter((row) => row[0] && String(row[0]).trim())
    .map((row, i) => {
      const rawType = String(row[1] ?? '').trim();
      const type: GameType = rawType === 'Meta Game' ? 'Meta Game' : rawType === 'Hint Game' ? 'Hint Game' : 'Tool';
      return {
        name: String(row[0]).trim(),
        type,
        // Row offset: 3 header rows + 1-based Excel rows
        downloadUrl: getCellLink(toolsWs, `C${i + 4}`),
      };
    });

  console.log(`[Drive] Parsed ${playable.length} playable, ${coreVerified.size} core-verified, ${tools.length} tools`);
  return { playable, coreVerifiedNames, coreVerified, tools };
};

// ─────────────────────────────────────────────────────────────
// 3. Parse CSV
// ─────────────────────────────────────────────────────────────

interface CsvGame {
  name: string;
  status: string;
  platform: string;
  emulator: string;
  isArchipelagoTool: boolean;
}

const parseCsv = (filePath: string): CsvGame[] => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  const games: CsvGame[] = result.data
    .filter((row) => row.Game)
    .map((row) => ({
      name: row.Game,
      status: row.Status ?? '',
      platform: row.Platform ?? '',
      emulator: row.Emulator ?? '',
      isArchipelagoTool: row.IsArchipelagoTool === 'true',
    }));

  console.log(`[CSV] Parsed ${games.length} games`);
  return games;
};

// ─────────────────────────────────────────────────────────────
// 4. Merge
// ─────────────────────────────────────────────────────────────

const mergeAll = (driveData: DriveData, discordEntries: DiscordEntry[], csvGames: CsvGame[]): BlendOutput => {
  interface WorkingGame {
    name: string;
    type: GameType;
    platform: string;
    emulator: string;
    stability: string;
    prStatus: string;
    downloadUrl: string;
    isBundled: boolean;
    isDiscordOnly: boolean;
    isCoreVerified: boolean;
    isAdultContent: boolean;
    notes: string;
    sources: Set<string>;
  }

  const map = new Map<string, WorkingGame>();

  const getOrCreate = (name: string, type: GameType): WorkingGame => {
    const key = normalise(name);
    if (!map.has(key)) {
      map.set(key, {
        name,
        type,
        platform: '',
        emulator: '',
        stability: '',
        prStatus: '',
        downloadUrl: '',
        isBundled: false,
        isDiscordOnly: false,
        isCoreVerified: false,
        isAdultContent: false,
        notes: '',
        sources: new Set(),
      });
    }
    return map.get(key)!;
  };

  const driveUnmatched: string[] = [];
  const discordUnmatched: string[] = [];
  const csvUnmatched: string[] = [];

  // ── Seed from Drive Playable Worlds ──
  for (const g of driveData.playable) {
    const rec = getOrCreate(g.name, 'Game');
    rec.stability = g.stability;
    rec.prStatus = g.prStatus;
    rec.isAdultContent = g.isAdultContent;
    if (g.notes) {
      rec.notes = g.notes;
    }
    if (g.downloadUrl) {
      rec.downloadUrl = g.downloadUrl;
    }
    rec.isCoreVerified = driveData.coreVerified.has(normalise(g.name));
    rec.sources.add('drive');
  }

  // ── Seed from Drive Core-Verified (bundled games not in Playable Worlds) ──
  for (const name of driveData.coreVerifiedNames) {
    const rec = getOrCreate(name, 'Game');
    rec.isCoreVerified = true;
    rec.isBundled = true;
    if (!rec.stability) {
      rec.stability = 'Stable';
    }
    rec.sources.add('drive');
  }

  // ── Seed from Drive Tools ──
  for (const t of driveData.tools) {
    const rec = getOrCreate(t.name, t.type);
    if (t.downloadUrl) {
      rec.downloadUrl = t.downloadUrl;
    }
    rec.sources.add('drive');
  }

  // ── Enrich from Discord ──
  for (const entry of discordEntries) {
    const key = normalise(entry.name);
    const rec = map.get(key);

    if (rec) {
      if (!rec.downloadUrl && entry.url) {
        rec.downloadUrl = entry.url;
      }
      if (!rec.platform && entry.platform) {
        rec.platform = entry.platform;
      }
      if (entry.isBundled) {
        rec.isBundled = true;
      }
      if (entry.isDiscordOnly) {
        rec.isDiscordOnly = true;
      }
      if (rec.type === 'Game' && entry.type !== 'Game') {
        rec.type = entry.type;
      }
      rec.sources.add('discord');
    } else {
      discordUnmatched.push(entry.name);
      const newRec = getOrCreate(entry.name, entry.type);
      newRec.platform = entry.platform;
      newRec.downloadUrl = entry.url;
      newRec.isBundled = entry.isBundled;
      newRec.isDiscordOnly = entry.isDiscordOnly;
      newRec.sources.add('discord');
    }
  }

  // ── Enrich from CSV ──
  for (const g of csvGames) {
    const key = normalise(g.name);
    const rec = map.get(key);

    if (rec) {
      if (!rec.platform && g.platform) {
        rec.platform = g.platform;
      }
      if (!rec.emulator && g.emulator) {
        rec.emulator = g.emulator;
      }
      if (!rec.stability && g.status) {
        rec.stability = g.status;
      }
      if (g.isArchipelagoTool && rec.type === 'Game') {
        rec.type = 'Tool';
      }
      if (g.status === 'Official') {
        rec.isBundled = true;
      }
      rec.sources.add('csv');
    } else {
      csvUnmatched.push(g.name);
      const newRec = getOrCreate(g.name, g.isArchipelagoTool ? 'Tool' : 'Game');
      newRec.platform = g.platform;
      newRec.emulator = g.emulator;
      newRec.stability = g.status;
      newRec.isBundled = g.status === 'Official';
      newRec.sources.add('csv');
    }
  }

  // Track Drive entries that had no URL or platform info from other sources
  for (const g of driveData.playable) {
    const key = normalise(g.name);
    const rec = map.get(key);
    if (rec && rec.sources.size === 1 && rec.sources.has('drive')) {
      driveUnmatched.push(g.name);
    }
  }

  const games: BlendedGame[] = Array.from(map.values())
    .map((g) => ({
      name: g.name,
      type: g.type,
      platform: g.platform,
      emulator: g.emulator,
      stability: g.stability,
      prStatus: g.prStatus,
      downloadUrl: g.downloadUrl,
      isBundled: g.isBundled,
      isDiscordOnly: g.isDiscordOnly,
      isCoreVerified: g.isCoreVerified,
      isAdultContent: g.isAdultContent,
      notes: g.notes,
      sources: Array.from(g.sources).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    games,
    metadata: {
      count: games.length,
      generatedAt: new Date().toISOString().split('T')[0],
      sourceCounts: {
        csv: csvGames.length,
        discord: discordEntries.length,
        drive: driveData.playable.length + driveData.tools.length,
      },
      unmatched: {
        csv: csvUnmatched.sort(),
        discord: discordUnmatched.sort(),
        drive: driveUnmatched.sort(),
      },
    },
  };
};

// ─────────────────────────────────────────────────────────────
// 5. Main
// ─────────────────────────────────────────────────────────────

const main = (): void => {
  console.log('[Blend] Starting data blend...');

  const discord = parseDiscord(DISCORD_PATH);
  const drive = parseDrive(DRIVE_PATH);
  const csv = parseCsv(CSV_PATH);

  const output = mergeAll(drive, discord, csv);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  const { count, unmatched, sourceCounts } = output.metadata;
  const sizekb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);

  console.log('\n[Blend] ✓ Complete!');
  console.log(`[Blend]   Total unique entries     : ${count}`);
  console.log(`[Blend]   Sources                  : CSV=${sourceCounts.csv}  Discord=${sourceCounts.discord}  Drive=${sourceCounts.drive}`);
  console.log(`[Blend]   Output                   : ${OUTPUT_PATH} (${sizekb} KB)`);
  console.log(`[Blend]   Discord-only (new games) : ${unmatched.discord.length}`);
  console.log(`[Blend]   CSV-only (no Drive match) : ${unmatched.csv.length}`);
  console.log(`[Blend]   Drive-only (no URL/plat) : ${unmatched.drive.length}`);

  if (unmatched.discord.length > 0) {
    console.log('\n[Blend] Discord-only entries (in Discord but not Drive/CSV):');
    for (const n of unmatched.discord) {
      console.log(`  + ${n}`);
    }
  }
  if (unmatched.csv.length > 0) {
    console.log('\n[Blend] CSV-only entries (in CSV but not Drive/Discord):');
    for (const n of unmatched.csv) {
      console.log(`  + ${n}`);
    }
  }
};

main();
