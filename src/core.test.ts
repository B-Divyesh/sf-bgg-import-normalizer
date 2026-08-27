import { describe, expect, it, vi } from 'vitest';
import { createExport, defaultMapping, normalizeRows, parseCsv } from './core.ts';

const exportCsv = `objectid,name,yearpublished,own,prevowned,wishlist,wanttoplay,rating,comment\r\n1,"Game, One",2020,1,0,0,0,8,"A note, with comma"\r\n2,"Line\nbreak",2021,0,1,1,0,6,"said ""good"""\r\n`;

describe('parseCsv', () => {
  it('handles BOMs, commas, escaped quotes, and newlines in quoted fields', () => {
    const parsed = parseCsv(`\uFEFF${exportCsv}`);
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0]?.name).toBe('Game, One');
    expect(parsed.rows[1]?.name).toBe('Line\nbreak');
    expect(parsed.rows[1]?.comment).toBe('said "good"');
  });

  it('reports empty and malformed exports clearly', () => {
    expect(() => parseCsv('  ')).toThrow(/empty/i);
    expect(() => parseCsv('name,comment\nGame,"unfinished')).toThrow(/not closed/i);
    expect(() => parseCsv('name,name\nA,B')).toThrow(/appears more than once/i);
  });
});

describe('normalization', () => {
  it('preserves simultaneous statuses, ratings, notes, and source row', () => {
    const parsed = parseCsv(exportCsv);
    const rows = normalizeRows(parsed, defaultMapping(parsed.headers));
    expect(rows[1]).toMatchObject({
      sourceRow: 3,
      bggId: '2',
      statuses: ['previously_owned', 'wishlist'],
      primaryStatus: 'previously_owned',
      rating: 6,
      notes: 'said "good"',
      included: true,
    });
  });

  it('blocks silent status drops and detects duplicate BGG ids', () => {
    const parsed = parseCsv('objectid,name,own\n12,First copy,1\n12,Second copy,1');
    const config = defaultMapping(parsed.headers);
    config.flags.own = 'ignore';
    const rows = normalizeRows(parsed, config);
    expect(rows[0]?.issues.map((issue) => issue.code)).toContain('status-drop');
    expect(rows[1]?.issues.map((issue) => issue.code)).toContain('duplicate');
    expect(rows[1]?.included).toBe(false);
  });

  it('allows row-level primary-state overrides without discarding source states', () => {
    const parsed = parseCsv(exportCsv);
    const rows = normalizeRows(parsed, defaultMapping(parsed.headers), new Map([[3, 'want_to_play']]));
    expect(rows[1]?.primaryStatus).toBe('want_to_play');
    expect(rows[1]?.statuses).toEqual(['want_to_play', 'previously_owned', 'wishlist']);
  });
});

describe('exports', () => {
  it('escapes neutral CSV and emits a versioned JSON schema', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-27T12:00:00Z'));
    const parsed = parseCsv(exportCsv);
    const rows = normalizeRows(parsed, defaultMapping(parsed.headers));
    expect(createExport(rows, 'neutral-csv').content).toContain('"Game, One"');
    const json = JSON.parse(createExport(rows, 'neutral-json').content);
    expect(json.schema).toBe('shelf-bridge/v1');
    expect(json.games).toHaveLength(2);
    vi.useRealTimers();
  });

  it('keeps source statuses in destination profiles', () => {
    const parsed = parseCsv(exportCsv);
    const rows = normalizeRows(parsed, defaultMapping(parsed.headers));
    expect(createExport(rows, 'yamtrack').content).toContain('source_statuses');
    expect(createExport(rows, 'neodb').content).toContain('previously_owned|wishlist');
  });
});
