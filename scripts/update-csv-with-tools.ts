#!/usr/bin/env tsx
/**
 * Update CSV with corrected game names and tool identification
 * Adds IsArchipelagoTool column to distinguish Archipelago-specific tools from actual games
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse, unparse } from 'papaparse';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(PROJECT_ROOT, 'data', 'Archipelago_Master_Game_List.csv');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'data', 'Archipelago_Master_Game_List.csv.backup');

/**
 * Archipelago-specific tools (not standalone video games)
 */
const ARCHIPELAGO_TOOLS = new Set([
  'APQuest',
  'Archipelacode',
  'Archipeladoku (Sudoku)',
  'Archipela-Go!',
  'Autopelago',
  'Blockupelago',
  'Bumper Stickers',
  'ChecksFinder',
  'ChecksMate (Chess)',
  'Clique',
  'CrosswordAP',
  'Elementipelago',
  'Jigsaw Puzzle for Archipelago',
  'Musipelago',
  'Nonograhmm',
  'Nonopelagram',
  'Paint',
  'Password Game',
  'Santa Needs YOU!',
  'Twisty Cube',
  'Unfair Flips',
  'Voltorb Flip (from Pokémon HG & SS)',
  'Watery Words',
  'Word Search',
  'Wordipelago',
  'Yacht Dice',
  'Yacht Dice Bliss',
]);

/**
 * Game name corrections (old name -> new name)
 */
const NAME_CORRECTIONS: Record<string, string> = {
  'A Dance Of Fire And Ice': 'A Dance of Fire and Ice',
  CornKidz64: 'Corn Kidz 64',
  'Mario is Missing (SNES)': 'Mario is Missing!',
  Plok: 'Plok!',
  'Super Mario Land 2: The Golden Coins': 'Super Mario Land 2: 6 Golden Coins',
  'Wario Land 1': 'Wario Land: Super Mario Land 3',
};

const main = () => {
  console.log('[Update] Starting CSV update...');
  console.log(`[Update] Reading from: ${CSV_PATH}`);

  // Create backup
  fs.copyFileSync(CSV_PATH, BACKUP_PATH);
  console.log(`[Update] Backup created: ${BACKUP_PATH}`);

  // Read CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const parseResult = parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  let correctedNames = 0;
  let toolsMarked = 0;

  // Process rows
  const updatedRows = parseResult.data.map((row) => {
    const gameName = row.Game;

    // Correct name if needed
    if (NAME_CORRECTIONS[gameName]) {
      const newName = NAME_CORRECTIONS[gameName];
      console.log(`[Update] Correcting: "${gameName}" → "${newName}"`);
      row.Game = newName;
      correctedNames++;
    }

    // Check if it's an Archipelago tool
    const currentName = row.Game;
    const isTool = ARCHIPELAGO_TOOLS.has(currentName);
    row.IsArchipelagoTool = isTool ? 'true' : 'false';

    if (isTool) {
      toolsMarked++;
    }

    return row;
  });

  // Write updated CSV
  const updatedCSV = unparse(updatedRows, {
    header: true,
    columns: ['Game', 'Status', 'Platform', 'Emulator', 'IsArchipelagoTool'],
  });

  fs.writeFileSync(CSV_PATH, updatedCSV, 'utf-8');

  console.log('\n[Update] ✓ CSV update complete!');
  console.log(`[Update]   - Games corrected: ${correctedNames}`);
  console.log(`[Update]   - Tools marked: ${toolsMarked}`);
  console.log(`[Update]   - Total rows: ${updatedRows.length}`);
  console.log(`[Update]   - Output: ${CSV_PATH}`);
  console.log(`[Update]   - Backup: ${BACKUP_PATH}`);
};

main();
