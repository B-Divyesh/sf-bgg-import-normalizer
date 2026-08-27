export const SOURCE_FLAGS = ['own', 'prevowned', 'wishlist', 'wanttoplay', 'wanttobuy', 'fortrade', 'preordered'] as const;
export type SourceFlag = typeof SOURCE_FLAGS[number];
export const STATUSES = ['owned', 'previously_owned', 'wishlist', 'want_to_play', 'want_to_buy', 'for_trade', 'preordered', 'uncategorized'] as const;
export type NeutralStatus = typeof STATUSES[number];

export type CsvRow = Record<string, string>;
export interface ParsedCsv { headers: string[]; rows: CsvRow[] }
export interface MappingConfig {
  flags: Record<SourceFlag, NeutralStatus | 'ignore'>;
  ratingColumn: string;
  ratingScale: '10' | '5' | '100';
  notesColumn: string;
  duplicatePolicy: 'first' | 'all';
}
export interface ReviewIssue { code: 'missing-title' | 'status-drop' | 'uncategorized' | 'invalid-rating' | 'duplicate'; message: string }
export interface NormalizedRow {
  sourceRow: number;
  bggId: string;
  title: string;
  year: string;
  statuses: NeutralStatus[];
  primaryStatus: NeutralStatus;
  rating: number | null;
  notes: string;
  issues: ReviewIssue[];
  included: boolean;
}

const aliases: Record<string, string[]> = {
  id: ['objectid', 'bggid', 'bgg_id', 'id'],
  title: ['name', 'title'],
  year: ['yearpublished', 'year', 'publicationyear'],
  rating: ['rating', 'userrating'],
  notes: ['comment', 'comments', 'notes', 'privatecomment'],
  own: ['own', 'owned'],
  prevowned: ['prevowned', 'previouslyowned'],
  wishlist: ['wishlist', 'wishlisted'],
  wanttoplay: ['wanttoplay'],
  wanttobuy: ['wanttobuy'],
  fortrade: ['fortrade', 'trade'],
  preordered: ['preordered', 'preorder'],
};

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function findColumn(headers: string[], key: keyof typeof aliases): string {
  const wanted = (aliases[key] ?? []).map(normalizeHeader);
  return headers.find((header) => wanted.includes(normalizeHeader(header))) ?? '';
}

export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, '');
  if (!text.trim()) throw new Error('This file is empty. Choose the CSV from your BGG collection export.');
  const matrix: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') {
      if (cell.length) throw new Error(`Unexpected quote near character ${index + 1}. Export the file again as CSV.`);
      quoted = true;
    } else if (char === ',') {
      row.push(cell); cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, '')); matrix.push(row); row = []; cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('A quoted field is not closed. Export the file again as CSV.');
  if (cell.length || row.length) { row.push(cell.replace(/\r$/, '')); matrix.push(row); }
  while (matrix.length && matrix[matrix.length - 1]?.every((value) => !value.trim())) matrix.pop();
  const headers = (matrix.shift() ?? []).map((header) => header.trim());
  if (!headers.length || headers.every((header) => !header)) throw new Error('No column headers were found. Choose a BGG collection CSV.');
  const duplicateHeader = headers.find((header, i) => header && headers.indexOf(header) !== i);
  if (duplicateHeader) throw new Error(`The column “${duplicateHeader}” appears more than once.`);
  const rows = matrix.map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ''])));
  return { headers, rows };
}

export function defaultMapping(headers: string[]): MappingConfig {
  return {
    flags: {
      own: 'owned', prevowned: 'previously_owned', wishlist: 'wishlist', wanttoplay: 'want_to_play',
      wanttobuy: 'want_to_buy', fortrade: 'for_trade', preordered: 'preordered',
    },
    ratingColumn: findColumn(headers, 'rating'),
    ratingScale: '10',
    notesColumn: findColumn(headers, 'notes'),
    duplicatePolicy: 'first',
  };
}

const truthy = (value: string | undefined) => ['1', 'true', 'yes', 'y', 'x'].includes((value ?? '').trim().toLowerCase());
const rowValue = (row: CsvRow, column: string) => column ? (row[column] ?? '').trim() : '';

export function normalizeRows(parsed: ParsedCsv, config: MappingConfig, overrides: Map<number, NeutralStatus> = new Map()): NormalizedRow[] {
  const columns = {
    id: findColumn(parsed.headers, 'id'), title: findColumn(parsed.headers, 'title'), year: findColumn(parsed.headers, 'year'),
    own: findColumn(parsed.headers, 'own'), prevowned: findColumn(parsed.headers, 'prevowned'), wishlist: findColumn(parsed.headers, 'wishlist'),
    wanttoplay: findColumn(parsed.headers, 'wanttoplay'), wanttobuy: findColumn(parsed.headers, 'wanttobuy'), fortrade: findColumn(parsed.headers, 'fortrade'),
    preordered: findColumn(parsed.headers, 'preordered'),
  };
  if (!columns.title) throw new Error('No Name or Title column was found. Choose an unmodified BGG collection CSV.');
  const normalized = parsed.rows.map((source, index): NormalizedRow => {
    const issues: ReviewIssue[] = [];
    const statuses: NeutralStatus[] = [];
    for (const flag of SOURCE_FLAGS) {
      const column = columns[flag];
      if (!column || !truthy(source[column])) continue;
      const mapped = config.flags[flag];
      if (mapped === 'ignore') issues.push({ code: 'status-drop', message: `${column} is set but mapped to Ignore` });
      else if (!statuses.includes(mapped)) statuses.push(mapped);
    }
    if (!statuses.length && !issues.some((issue) => issue.code === 'status-drop')) {
      statuses.push('uncategorized');
      issues.push({ code: 'uncategorized', message: 'No source collection status is set' });
    }
    const title = rowValue(source, columns.title);
    if (!title) issues.push({ code: 'missing-title', message: 'Title is missing' });
    let rating: number | null = null;
    const rawRating = rowValue(source, config.ratingColumn);
    if (rawRating && rawRating !== 'N/A') {
      const number = Number(rawRating);
      const scale = Number(config.ratingScale);
      if (!Number.isFinite(number) || number < 0 || number > scale) issues.push({ code: 'invalid-rating', message: `Rating “${rawRating}” is outside 0–${scale}` });
      else rating = Math.round((number * 10 / scale) * 100) / 100;
    }
    const override = overrides.get(index + 2);
    if (override && !statuses.includes(override)) statuses.unshift(override);
    return {
      sourceRow: index + 2,
      bggId: rowValue(source, columns.id), title, year: rowValue(source, columns.year), statuses,
      primaryStatus: override ?? statuses[0] ?? 'uncategorized', rating, notes: rowValue(source, config.notesColumn), issues,
      included: Boolean(title),
    };
  });
  const seen = new Map<string, number[]>();
  normalized.forEach((row, index) => {
    const key = row.bggId ? `id:${row.bggId}` : `name:${row.title.toLowerCase()}|${row.year}`;
    if (row.title) seen.set(key, [...(seen.get(key) ?? []), index]);
  });
  for (const indexes of seen.values()) {
    if (indexes.length < 2) continue;
    indexes.forEach((index, position) => {
      const row = normalized[index];
      if (!row) return;
      row.issues.push({ code: 'duplicate', message: `Duplicate ${position + 1} of ${indexes.length}` });
      if (config.duplicatePolicy === 'first' && position > 0) row.included = false;
    });
  }
  return normalized;
}

const csvCell = (value: unknown): string => {
  const string = String(value ?? '');
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
};
const toCsv = (headers: string[], records: Record<string, unknown>[]) => [headers.join(','), ...records.map((record) => headers.map((header) => csvCell(record[header])).join(','))].join('\r\n');

export function createExport(rows: NormalizedRow[], profile: 'neutral-csv' | 'neutral-json' | 'yamtrack' | 'neodb'): { content: string; type: string; extension: string } {
  const included = rows.filter((row) => row.included);
  const base = included.map((row) => ({
    bgg_id: row.bggId, title: row.title, year: row.year, statuses: row.statuses.join('|'), primary_status: row.primaryStatus,
    rating_10: row.rating ?? '', notes: row.notes, source_row: row.sourceRow,
    review_flags: row.issues.map((issue) => issue.code).join('|'),
  }));
  if (profile === 'neutral-json') return { content: JSON.stringify({ schema: 'shelf-bridge/v1', exportedAt: new Date().toISOString(), games: base }, null, 2), type: 'application/json', extension: 'json' };
  if (profile === 'yamtrack') {
    const records = included.map((row) => ({ title: row.title, year: row.year, bgg_id: row.bggId, status: row.primaryStatus, source_statuses: row.statuses.join('|'), rating: row.rating ?? '', notes: row.notes }));
    const headers = ['title', 'year', 'bgg_id', 'status', 'source_statuses', 'rating', 'notes'];
    return { content: toCsv(headers, records), type: 'text/csv', extension: 'yamtrack.csv' };
  }
  if (profile === 'neodb') {
    const shelf: Record<NeutralStatus, string> = { owned: 'complete', previously_owned: 'complete', wishlist: 'wishlist', want_to_play: 'wishlist', want_to_buy: 'wishlist', for_trade: 'complete', preordered: 'wishlist', uncategorized: 'wishlist' };
    const records = included.map((row) => ({ title: row.title, category: 'game', shelf: shelf[row.primaryStatus], source_statuses: row.statuses.join('|'), rating: row.rating ?? '', comment: row.notes, external_id: row.bggId ? `bgg:${row.bggId}` : '' }));
    const headers = ['title', 'category', 'shelf', 'source_statuses', 'rating', 'comment', 'external_id'];
    return { content: toCsv(headers, records), type: 'text/csv', extension: 'neodb.csv' };
  }
  const headers = ['bgg_id', 'title', 'year', 'statuses', 'primary_status', 'rating_10', 'notes', 'source_row', 'review_flags'];
  return { content: toCsv(headers, base), type: 'text/csv', extension: 'csv' };
}

export function makeSampleCsv(): string {
  return 'objectid,name,yearpublished,own,prevowned,wishlist,wanttoplay,wanttobuy,fortrade,preordered,rating,comment\r\n13,Catan,1995,1,0,0,0,0,0,0,7.5,"Family copy, 5–6 player expansion"\r\n174430,Gloomhaven,2017,0,1,0,0,0,0,0,9,"Campaign complete"\r\n167791,Terraforming Mars,2016,0,0,1,1,0,0,0,8,"Try before buying"\r\n';
}
