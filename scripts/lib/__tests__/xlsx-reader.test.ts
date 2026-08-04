import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { parseXlsx } from '../xlsx-reader';

/**
 * Workbooks are assembled in memory rather than checked in as binary fixtures —
 * the real source file lives in the gitignored `data/` directory, so tests must
 * not depend on it.
 */

interface SheetSpec {
  name: string;
  xml: string;
  rels?: string;
}

const relsFor = (targets: Record<string, string>): string =>
  `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${Object.entries(targets)
    .map(
      ([id, target]) =>
        `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${target}" TargetMode="External"/>`,
    )
    .join('')}</Relationships>`;

const buildWorkbook = (sheets: SheetSpec[], sharedStrings: string[] = []): Uint8Array => {
  const files: Record<string, Uint8Array> = {};

  files['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
      .map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
      .join('')}</sheets></workbook>`,
  );

  files['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
      .join('')}</Relationships>`,
  );

  if (sharedStrings.length > 0) {
    files['xl/sharedStrings.xml'] = strToU8(
      `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${sharedStrings.map((s) => `<si>${s}</si>`).join('')}</sst>`,
    );
  }

  sheets.forEach((s, i) => {
    files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(
      `<?xml version="1.0" encoding="UTF-8"?><worksheet><sheetData>${s.xml}</sheetData></worksheet>`,
    );
    if (s.rels) {
      files[`xl/worksheets/_rels/sheet${i + 1}.xml.rels`] = strToU8(s.rels);
    }
  });

  return zipSync(files);
};

describe('parseXlsx', () => {
  it('reads sheets by name', () => {
    const wb = parseXlsx(
      buildWorkbook([
        { name: 'First', xml: '' },
        { name: 'Second', xml: '' },
      ]),
    );
    expect([...wb.sheets.keys()]).toEqual(['First', 'Second']);
  });

  it('resolves shared strings, including rich-text runs split across elements', () => {
    const wb = parseXlsx(
      buildWorkbook(
        [{ name: 'S', xml: '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' }],
        ['<t>Plain</t>', '<r><t>Rich </t></r><r><t>Text</t></r>'],
      ),
    );
    expect(wb.sheets.get('S')?.rows[0]).toEqual(['Plain', 'Rich Text']);
  });

  it('preserves booleans as booleans rather than 0/1', () => {
    // The blend script stringifies this column; a boolean must not become "1".
    const wb = parseXlsx(buildWorkbook([{ name: 'S', xml: '<row r="1"><c r="A1" t="b"><v>1</v></c><c r="B1" t="b"><v>0</v></c></row>' }]));
    expect(wb.sheets.get('S')?.rows[0]).toEqual([true, false]);
  });

  it('reads numbers, inline strings, and formula results', () => {
    const wb = parseXlsx(
      buildWorkbook([
        {
          name: 'S',
          xml: '<row r="1"><c r="A1"><v>42</v></c><c r="B1" t="inlineStr"><is><t>Inline</t></is></c><c r="C1" t="str"><v>Computed</v></c></row>',
        },
      ]),
    );
    expect(wb.sheets.get('S')?.rows[0]).toEqual([42, 'Inline', 'Computed']);
  });

  it('decodes XML entities in cell text', () => {
    const wb = parseXlsx(buildWorkbook([{ name: 'S', xml: '<row r="1"><c r="A1" t="s"><v>0</v></c></row>' }], ['<t>Mario &amp; Luigi &lt;3</t>']));
    expect(wb.sheets.get('S')?.rows[0][0]).toBe('Mario & Luigi <3');
  });

  it('pads sparse rows and columns into a dense grid', () => {
    // Row 2 is absent entirely and column B is empty on row 3.
    const wb = parseXlsx(
      buildWorkbook(
        [{ name: 'S', xml: '<row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="3"><c r="C3" t="s"><v>1</v></c></row>' }],
        ['<t>top</t>', '<t>bottom</t>'],
      ),
    );
    expect(wb.sheets.get('S')?.rows).toEqual([
      ['top', '', ''],
      ['', '', ''],
      ['', '', 'bottom'],
    ]);
  });

  it('ignores style-only cells that carry no value', () => {
    const wb = parseXlsx(buildWorkbook([{ name: 'S', xml: '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" s="29"/></row>' }], ['<t>only</t>']));
    expect(wb.sheets.get('S')?.rows[0]).toEqual(['only']);
  });

  describe('hyperlinks', () => {
    it('resolves a cell hyperlink through the sheet relationships', () => {
      const wb = parseXlsx(
        buildWorkbook(
          [
            {
              name: 'S',
              xml: '<row r="7"><c r="D7" t="s"><v>0</v></c></row><hyperlinks><hyperlink r:id="rId1" ref="D7"/></hyperlinks>',
              rels: relsFor({ rId1: 'https://example.com/release' }),
            },
          ],
          ['<t>Download</t>'],
        ),
      );
      expect(wb.sheets.get('S')?.links.get('D7')).toBe('https://example.com/release');
    });

    it('decodes entities in hyperlink targets', () => {
      // Regression: leaving &amp; encoded produced URLs with a literal "amp;" parameter.
      const wb = parseXlsx(
        buildWorkbook([
          {
            name: 'S',
            xml: '<hyperlinks><hyperlink r:id="rId1" ref="D7"/></hyperlinks>',
            rels: relsFor({ rId1: 'https://example.com/releases?q=Game&amp;expanded=true' }),
          },
        ]),
      );
      expect(wb.sheets.get('S')?.links.get('D7')).toBe('https://example.com/releases?q=Game&expanded=true');
    });

    it('appends the fragment held in the location attribute', () => {
      const wb = parseXlsx(
        buildWorkbook([
          {
            name: 'S',
            xml: '<hyperlinks><hyperlink r:id="rId1" location="/" ref="A1"/></hyperlinks>',
            rels: relsFor({ rId1: 'https://example.com/app/' }),
          },
        ]),
      );
      expect(wb.sheets.get('S')?.links.get('A1')).toBe('https://example.com/app/#/');
    });

    it('anchors a ranged hyperlink to the first cell of the range', () => {
      const wb = parseXlsx(
        buildWorkbook([
          {
            name: 'S',
            xml: '<hyperlinks><hyperlink r:id="rId1" ref="D7:D9"/></hyperlinks>',
            rels: relsFor({ rId1: 'https://example.com/x' }),
          },
        ]),
      );
      expect(wb.sheets.get('S')?.links.get('D7')).toBe('https://example.com/x');
    });

    it('leaves links empty when the sheet has no relationships part', () => {
      const wb = parseXlsx(buildWorkbook([{ name: 'S', xml: '<hyperlinks><hyperlink r:id="rId1" ref="D7"/></hyperlinks>' }]));
      expect(wb.sheets.get('S')?.links.size).toBe(0);
    });
  });

  it('handles multi-letter column references', () => {
    const wb = parseXlsx(buildWorkbook([{ name: 'S', xml: '<row r="1"><c r="AA1" t="s"><v>0</v></c></row>' }], ['<t>far</t>']));
    expect(wb.sheets.get('S')?.rows[0]).toHaveLength(27);
    expect(wb.sheets.get('S')?.rows[0][26]).toBe('far');
  });

  it('throws when the archive is not a workbook', () => {
    const notAWorkbook = zipSync({ 'random.txt': strToU8('nope') });
    expect(() => parseXlsx(notAWorkbook, 'bad.xlsx')).toThrow(/not a valid \.xlsx/);
  });
});
