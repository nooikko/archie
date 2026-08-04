/**
 * Minimal XLSX reader — cell values and embedded hyperlinks.
 *
 * Replaces the `xlsx` (SheetJS) package, which is unmaintained on npm and
 * carries an unpatchable advisory there (CVE-2023-30533). We need a narrow
 * slice of the format, so we read it directly: an .xlsx is a ZIP of XML parts,
 * and `fflate` handles the ZIP layer.
 *
 * Only what the data blend actually uses is implemented:
 *   - sheets addressed by name
 *   - cell values as a dense row/column grid
 *   - the hyperlink *target* attached to a cell, which is stored in the sheet's
 *     relationship file rather than in the cell itself
 *
 * Cell values are returned with the same JavaScript types SheetJS produced
 * (string | number | boolean), so callers that stringify them keep behaving
 * identically.
 */

import * as fs from 'node:fs';
import { unzipSync } from 'fflate';

export type CellValue = string | number | boolean;

export interface Worksheet {
  /** Rows of cell values. Index 0 is spreadsheet row 1; gaps are filled with ''. */
  readonly rows: CellValue[][];
  /** Cell address (e.g. "D7") → hyperlink target. */
  readonly links: ReadonlyMap<string, string>;
}

export interface Workbook {
  /** Sheet name → parsed worksheet. */
  readonly sheets: ReadonlyMap<string, Worksheet>;
}

// ─────────────────────────────────────────────────────────────
// XML helpers
//
// The parts we read are machine-generated and shallow, so targeted regex
// extraction is sufficient — and avoids pulling in an XML parser.
// ─────────────────────────────────────────────────────────────

const XML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** Decode the XML entities that appear in spreadsheet text. */
const unescapeXml = (s: string): string =>
  s.replace(/&(?:(#x?[0-9a-fA-F]+)|([a-zA-Z]+));/g, (match, numeric: string | undefined, named: string | undefined) => {
    if (numeric) {
      const code = numeric[1] === 'x' || numeric[1] === 'X' ? Number.parseInt(numeric.slice(2), 16) : Number.parseInt(numeric.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return (named && XML_ENTITIES[named]) ?? match;
  });

/** Extract an attribute value from a start tag. */
const attr = (tag: string, name: string): string => {
  const m = tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return m ? unescapeXml(m[1]) : '';
};

/** Column letters → zero-based index. "A" → 0, "D" → 3, "AA" → 26. */
const columnToIndex = (letters: string): number => {
  let n = 0;
  for (const ch of letters) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
};

/** Split a cell address into its column index and one-based row number. */
const parseAddress = (ref: string): { col: number; row: number } | null => {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  return m ? { col: columnToIndex(m[1]), row: Number.parseInt(m[2], 10) } : null;
};

// ─────────────────────────────────────────────────────────────
// Part parsers
// ─────────────────────────────────────────────────────────────

/**
 * Shared strings table. Each <si> is one string, but rich text splits it across
 * multiple <r><t> runs that must be concatenated to rebuild the cell's text.
 */
const parseSharedStrings = (xml: string): string[] => {
  const out: string[] = [];
  for (const si of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    let text = '';
    for (const t of si[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) {
      text += unescapeXml(t[1]);
    }
    out.push(text);
  }
  return out;
};

/** Relationship id → target, from a `_rels` part. */
const parseRelationships = (xml: string): Map<string, string> => {
  const rels = new Map<string, string>();
  for (const rel of xml.matchAll(/<Relationship\b[^>]*\/?>/g)) {
    const id = attr(rel[0], 'Id');
    if (id) {
      rels.set(id, attr(rel[0], 'Target'));
    }
  }
  return rels;
};

/**
 * Resolve one cell's value.
 *
 * The `t` attribute selects how <v> is interpreted. Types are preserved rather
 * than stringified so that callers see what SheetJS gave them — notably `t="b"`
 * yields a boolean, not "0"/"1".
 */
const cellValue = (cellXml: string, tag: string, sharedStrings: string[]): CellValue => {
  const type = attr(tag, 't');

  if (type === 'inlineStr') {
    let text = '';
    for (const t of cellXml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) {
      text += unescapeXml(t[1]);
    }
    return text;
  }

  const v = cellXml.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/);
  if (!v) {
    return '';
  }
  const raw = unescapeXml(v[1]);

  switch (type) {
    case 's': {
      // Shared string: <v> holds an index into the table.
      const idx = Number.parseInt(raw, 10);
      return sharedStrings[idx] ?? '';
    }
    case 'b':
      return raw !== '0';
    case 'str': // formula result, already a string
    case 'e': // error value, surfaced verbatim
      return raw;
    default: {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
  }
};

const parseSheet = (xml: string, relsXml: string | null, sharedStrings: string[]): Worksheet => {
  // Collect cells keyed by row, tracking the widest row so the grid can be
  // squared off afterwards.
  const byRow = new Map<number, Map<number, CellValue>>();
  let maxRow = 0;
  let maxCol = 0;

  for (const cell of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const tag = `<c${cell[1]}>`;
    const body = cell[2] ?? '';
    const addr = parseAddress(attr(tag, 'r'));
    if (!addr) {
      continue;
    }

    const value = cellValue(body, tag, sharedStrings);
    // Self-closing cells (<c r="F7" s="29"/>) carry styling but no value; they
    // must not widen the row, matching SheetJS's used-range behaviour.
    if (value === '') {
      continue;
    }

    let row = byRow.get(addr.row);
    if (!row) {
      row = new Map<number, CellValue>();
      byRow.set(addr.row, row);
    }
    row.set(addr.col, value);
    maxRow = Math.max(maxRow, addr.row);
    maxCol = Math.max(maxCol, addr.col);
  }

  const rows: CellValue[][] = [];
  for (let r = 1; r <= maxRow; r++) {
    const src = byRow.get(r);
    const row: CellValue[] = new Array(maxCol + 1).fill('');
    if (src) {
      for (const [col, value] of src) {
        row[col] = value;
      }
    }
    rows.push(row);
  }

  // Hyperlinks live in the sheet XML only as relationship ids; the actual URL
  // is in the sibling _rels part.
  const links = new Map<string, string>();
  if (relsXml) {
    const rels = parseRelationships(relsXml);
    for (const link of xml.matchAll(/<hyperlink\b[^>]*\/?>/g)) {
      const ref = attr(link[0], 'ref');
      const id = attr(link[0], 'r:id');
      const target = id ? rels.get(id) : undefined;
      if (!ref || !target) {
        continue;
      }
      // A URL fragment is stored separately, in the `location` attribute.
      const location = attr(link[0], 'location');
      // A hyperlink may span a range (e.g. "D7:D9"); anchor it to the start.
      links.set(ref.split(':')[0], location ? `${target}#${location}` : target);
    }
  }

  return { rows, links };
};

// ─────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────

/** Parse an .xlsx already in memory. `label` only appears in error messages. */
export const parseXlsx = (data: Uint8Array, label = '<buffer>'): Workbook => {
  const zip = unzipSync(data);
  const decoder = new TextDecoder();
  const text = (name: string): string | null => (zip[name] ? decoder.decode(zip[name]) : null);

  const workbookXml = text('xl/workbook.xml');
  if (!workbookXml) {
    throw new Error(`${label}: not a valid .xlsx (missing xl/workbook.xml)`);
  }

  const workbookRels = parseRelationships(text('xl/_rels/workbook.xml.rels') ?? '');
  const sharedStrings = parseSharedStrings(text('xl/sharedStrings.xml') ?? '');

  const sheets = new Map<string, Worksheet>();
  for (const sheet of workbookXml.matchAll(/<sheet\b[^>]*\/?>/g)) {
    const name = attr(sheet[0], 'name');
    const relId = attr(sheet[0], 'r:id');
    const target = workbookRels.get(relId);
    if (!name || !target) {
      continue;
    }

    // Targets are relative to xl/ and may be written with a leading slash.
    const path = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
    const sheetXml = text(path);
    if (!sheetXml) {
      continue;
    }

    const relsPath = path.replace(/([^/]+)$/, '_rels/$1.rels');
    sheets.set(name, parseSheet(sheetXml, text(relsPath), sharedStrings));
  }

  return { sheets };
};

export const readXlsx = (filePath: string): Workbook => parseXlsx(new Uint8Array(fs.readFileSync(filePath)), filePath);
