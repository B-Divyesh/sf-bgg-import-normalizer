import './style.css';
import {
  SOURCE_FLAGS, STATUSES, createExport, defaultMapping, findColumn, makeSampleCsv, normalizeRows, parseCsv,
  type MappingConfig, type NeutralStatus, type NormalizedRow, type ParsedCsv, type SourceFlag,
} from './core.ts';

type Filter = 'all' | 'review' | 'ready' | 'excluded';
interface AppState {
  parsed: ParsedCsv | null;
  mapping: MappingConfig | null;
  rows: NormalizedRow[];
  fileName: string;
  fileSize: number;
  error: string;
  filter: Filter;
  overrides: Map<number, NeutralStatus>;
}

const state: AppState = { parsed: null, mapping: null, rows: [], fileName: '', fileSize: 0, error: '', filter: 'all', overrides: new Map() };
const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) throw new Error('Application root is missing.');
const app: HTMLDivElement = appElement;

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const byteSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
const activePath = () => ['/privacy', '/terms'].includes(location.pathname) ? location.pathname : '/';

function shell(content: string): string {
  const path = activePath();
  return `
    <header class="site-header">
      <a class="brand" href="/" data-route><img src="/bridge-mark.svg" alt="" width="42" height="42"><span>Shelf Bridge</span></a>
      <nav aria-label="Site"><a href="/" data-route ${path === '/' ? 'aria-current="page"' : ''}>Converter</a><a href="/privacy" data-route ${path === '/privacy' ? 'aria-current="page"' : ''}>Privacy</a><a href="/terms" data-route ${path === '/terms' ? 'aria-current="page"' : ''}>Terms</a></nav>
    </header>
    <div class="offline-note" id="offline-note" role="status" ${navigator.onLine ? 'hidden' : ''}><span aria-hidden="true">↯</span> You’re offline. The converter still works; exports stay on this device.</div>
    ${content}
    <footer><p><span class="footer-mark">Built for careful collectors.</span> Local-only, open-source, and free.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · <a href="https://github.com/B-Divyesh/sf-bgg-import-normalizer">Source code</a></p><p class="asset-note">Notebook illustration generated for Shelf Bridge with the factory image model.</p></footer>
    <div id="live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = `
    <p class="eyebrow">Plain-language policy · effective 27 August 2026</p>
    <h1>Your collection stays yours.</h1>
    <p class="lede">Shelf Bridge processes your BGG export inside your browser. The file and its contents are never uploaded to us.</p>
    <h2>What we collect</h2><p>Nothing from your collection. There are no accounts, analytics, advertising cookies, trackers, or remote fonts. We do not store your filename, games, ratings, comments, mappings, or exported files.</p>
    <h2>What your browser stores</h2><p>The service worker may cache the application shell and illustration so the converter can work offline. It does not cache your imported file or generated downloads. You can remove this cache through your browser’s site-data controls.</p>
    <h2>Network behavior</h2><p>After the application loads, conversion needs no network connection. Your web host may retain ordinary access logs such as IP address, request path, and timestamp for security and reliability; Shelf Bridge does not add tracking to them.</p>
    <h2>Your choices</h2><p>Reloading or closing the tab clears the working collection from memory. Use “Clear this file” to remove it sooner.</p>`;
  const terms = `
    <p class="eyebrow">Use terms · effective 27 August 2026</p>
    <h1>A bridge, not a guarantee.</h1>
    <p class="lede">Shelf Bridge helps you inspect and reshape a collection export. You remain in control of what you import elsewhere.</p>
    <h2>Permitted use</h2><p>Use Shelf Bridge with exports you are allowed to access. Respect BoardGameGeek’s and each destination service’s terms. Do not use it to redistribute game metadata, artwork, or other people’s reviews.</p>
    <h2>Review before importing</h2><p>Destination import conventions can change. Profile exports are transparent starting points, not a promise that a service will accept every field. Review the downloaded file and keep your source export as a backup.</p>
    <h2>No warranty</h2><p>The software is provided “as is,” without warranty, under the MIT License. We are not liable for lost data, rejected imports, or changes made by a destination service.</p>
    <h2>BoardGameGeek and destination services</h2><p>Shelf Bridge is independent and is not affiliated with or endorsed by BoardGameGeek, Yamtrack, or NeoDB. Names are used only to describe compatible source and profile formats.</p>`;
  return shell(`<main id="main" class="legal-page"><a class="back-link" href="/" data-route>← Back to converter</a><article>${kind === 'privacy' ? privacy : terms}</article></main>`);
}

function stepNav(): string {
  const step = !state.parsed ? 1 : 3;
  const steps = ['Add export', 'Set mapping', 'Review', 'Take results'];
  return `<ol class="steps" aria-label="Conversion progress">${steps.map((name, index) => {
    const number = index + 1;
    const status = number < step ? 'done' : number === step ? 'active' : '';
    return `<li class="${status}" ${number === step ? 'aria-current="step"' : ''}><span>${status === 'done' ? '✓' : number}</span>${name}</li>`;
  }).join('')}</ol>`;
}

function emptyBench(): string {
  return `
    <section class="import-section" aria-labelledby="import-title">
      <div class="drop-wrap">
        <p class="section-number">Field note 01</p><h2 id="import-title">Add your BGG export</h2>
        <p>In BoardGameGeek, open <strong>My Collection → Download</strong>, then bring the CSV here. Up to 20 MB.</p>
        <div class="drop-zone" id="drop-zone">
          <input id="file-input" type="file" accept=".csv,text/csv" aria-describedby="file-help file-error">
          <label class="button primary" for="file-input"><span aria-hidden="true">＋</span> Choose BGG CSV</label>
          <span>or drop it onto this page</span>
        </div>
        <p id="file-help" class="microcopy"><span aria-hidden="true">◉</span> Private by default: parsing and conversion happen only in this browser.</p>
        <p id="file-error" class="error-note" role="alert">${esc(state.error)}</p>
        <button class="text-button" id="sample-button" type="button">Try a 3-game sample instead</button>
      </div>
      <figure class="hero-art">
        <picture>
          <source media="(max-width: 600px)" srcset="/assets/notebook-bridge-560.webp" type="image/webp">
          <source srcset="/assets/notebook-bridge-960.avif" type="image/avif">
          <source srcset="/assets/notebook-bridge-960.webp" type="image/webp">
          <img src="/assets/notebook-bridge-960.jpg" width="960" height="531" fetchpriority="high" decoding="async" alt="Blank catalogue cards crossing a small green cardboard bridge on an open collector’s notebook.">
        </picture>
        <figcaption>One source. Clear mappings. More than one destination.</figcaption>
      </figure>
    </section>
    <section class="why-strip" aria-label="How Shelf Bridge works"><div><b>① Read locally</b><span>No upload or account</span></div><div><b>② Keep every state</b><span>Flags stay visible</span></div><div><b>③ Export twice</b><span>Reuse one normalized file</span></div></section>`;
}

function mappingSelect(flag: SourceFlag): string {
  const column = state.parsed ? findColumn(state.parsed.headers, flag) : '';
  const options = [...STATUSES.filter((status) => status !== 'uncategorized'), 'ignore'] as const;
  return `<div class="mapping-row ${column ? '' : 'missing-source'}">
    <div><span class="source-name">${esc(column || label(flag))}</span><span class="source-state">${column ? 'BGG flag' : 'Not found in file'}</span></div>
    <span class="map-arrow" aria-hidden="true">⟶</span>
    <label><span class="sr-only">Map ${esc(column || flag)} to</span><select data-flag="${flag}" ${column ? '' : 'disabled'}>${options.map((status) => `<option value="${status}" ${state.mapping?.flags[flag] === status ? 'selected' : ''}>${status === 'ignore' ? 'Ignore — requires review' : label(status)}</option>`).join('')}</select></label>
  </div>`;
}

function mapBench(): string {
  if (!state.parsed || !state.mapping) return '';
  const reviewCount = state.rows.filter((row) => row.issues.length).length;
  const includedCount = state.rows.filter((row) => row.included).length;
  const drops = state.rows.filter((row) => row.issues.some((issue) => issue.code === 'status-drop')).length;
  const duplicateRows = state.rows.filter((row) => row.issues.some((issue) => issue.code === 'duplicate')).length;
  const headers = state.parsed.headers;
  const columnOptions = (selected: string, empty: string) => `<option value="">${empty}</option>${headers.map((header) => `<option value="${esc(header)}" ${selected === header ? 'selected' : ''}>${esc(header)}</option>`).join('')}`;
  const filtered = state.rows.filter((row) => state.filter === 'all' || (state.filter === 'review' && row.issues.length) || (state.filter === 'ready' && !row.issues.length && row.included) || (state.filter === 'excluded' && !row.included));
  const exportDisabled = !includedCount || drops > 0;
  return `
    <section class="file-receipt" aria-label="Loaded file"><div class="file-pin" aria-hidden="true">✓</div><div><strong>${esc(state.fileName)}</strong><span>${state.parsed.rows.length.toLocaleString()} rows · ${byteSize(state.fileSize)}</span></div><button id="clear-file" class="text-button danger" type="button">Clear this file</button></section>
    <div class="work-grid">
      <section class="mapping-panel" aria-labelledby="mapping-title">
        <p class="section-number">Field note 02</p><h2 id="mapping-title">Set the crossing rules</h2><p>Each BGG flag can become a neutral state. Multiple active flags are preserved.</p>
        <div class="mapping-list">${SOURCE_FLAGS.map(mappingSelect).join('')}</div>
        <div class="field-pair">
          <label>Rating column<select id="rating-column">${columnOptions(state.mapping.ratingColumn, 'Do not import')}</select></label>
          <label>Source scale<select id="rating-scale"><option value="10" ${state.mapping.ratingScale === '10' ? 'selected' : ''}>0–10 (BGG default)</option><option value="5" ${state.mapping.ratingScale === '5' ? 'selected' : ''}>0–5</option><option value="100" ${state.mapping.ratingScale === '100' ? 'selected' : ''}>0–100</option></select></label>
          <label class="wide">Notes column<select id="notes-column">${columnOptions(state.mapping.notesColumn, 'Do not import')}</select></label>
        </div>
        <fieldset class="duplicate-choice"><legend>When the same game appears twice</legend><label><input type="radio" name="duplicates" value="first" ${state.mapping.duplicatePolicy === 'first' ? 'checked' : ''}> Keep the first; mark later rows excluded</label><label><input type="radio" name="duplicates" value="all" ${state.mapping.duplicatePolicy === 'all' ? 'checked' : ''}> Keep all; mark every copy for review</label>${duplicateRows ? `<p>${duplicateRows} duplicate rows found.</p>` : '<p>No duplicates found.</p>'}</fieldset>
      </section>
      <aside class="ledger" aria-label="Conversion summary"><p class="scribble">Bench tally</p><dl><div><dt>Read</dt><dd>${state.rows.length}</dd></div><div><dt>Ready to export</dt><dd>${includedCount}</dd></div><div><dt>Need a look</dt><dd>${reviewCount}</dd></div><div><dt>Status drops</dt><dd class="${drops ? 'bad' : 'good'}">${drops}</dd></div></dl><p>${drops ? 'Map every active flag to continue.' : 'Every active status has a destination.'}</p></aside>
    </div>
    <section class="review-panel" aria-labelledby="review-title">
      <div class="section-heading"><div><p class="section-number">Field note 03</p><h2 id="review-title">Review the crossing</h2><p>Nothing questionable is hidden. Change a row’s primary state without losing its other states.</p></div><div class="filter-group" aria-label="Filter review rows">${(['all', 'review', 'ready', 'excluded'] as Filter[]).map((filter) => `<button type="button" data-filter="${filter}" aria-pressed="${state.filter === filter}">${label(filter)}</button>`).join('')}</div></div>
      ${filtered.length ? `<div class="table-scroll"><table><caption class="sr-only">Normalized collection rows</caption><thead><tr><th scope="col">Source row</th><th scope="col">Game</th><th scope="col">Primary state</th><th scope="col">Rating</th><th scope="col">Review notes</th></tr></thead><tbody>${filtered.map(reviewRow).join('')}</tbody></table></div>` : `<div class="empty-filter"><span aria-hidden="true">⌁</span><h3>No rows in this view</h3><p>Choose another filter to see the rest of the collection.</p></div>`}
    </section>
    <section class="export-panel" aria-labelledby="export-title">
      <div><p class="section-number">Field note 04</p><h2 id="export-title">Take the clean copy</h2><p>Downloads contain ${includedCount} included ${includedCount === 1 ? 'game' : 'games'}. Your original CSV is never changed.</p>${drops ? '<p class="gate-note" role="alert">Resolve all status drops above before exporting.</p>' : ''}</div>
      <div class="export-grid">
        <button type="button" data-export="neutral-csv" ${exportDisabled ? 'disabled' : ''}><span>CSV</span><strong>Normalized CSV</strong><small>Portable, flat schema</small></button>
        <button type="button" data-export="neutral-json" ${exportDisabled ? 'disabled' : ''}><span>{ }</span><strong>Normalized JSON</strong><small>Lossless status arrays</small></button>
        <button type="button" data-export="yamtrack" ${exportDisabled ? 'disabled' : ''}><span>Y</span><strong>Yamtrack profile</strong><small>CSV with source states</small></button>
        <button type="button" data-export="neodb" ${exportDisabled ? 'disabled' : ''}><span>N</span><strong>NeoDB-style profile</strong><small>Game shelf CSV</small></button>
      </div><details><summary>What do the destination profiles change?</summary><p>Yamtrack keeps the primary neutral state in a <code>status</code> column. The NeoDB-style profile maps owned and past-owned games to <code>complete</code>, and intent states to <code>wishlist</code>. Both retain <code>source_statuses</code> so no distinction disappears silently. Import formats can change—inspect the CSV before using it.</p></details>
    </section>`;
}

function reviewRow(row: NormalizedRow): string {
  const issues = row.issues.length ? row.issues.map((issue) => `<span class="issue issue-${issue.code}">${esc(issue.message)}</span>`).join('') : '<span class="ready-mark">✓ Ready</span>';
  return `<tr class="${row.included ? '' : 'excluded'}"><td data-label="Source row"><span class="row-number">${row.sourceRow}</span>${row.included ? '' : '<span class="excluded-label">Excluded</span>'}</td><td data-label="Game"><strong>${esc(row.title || 'Untitled row')}</strong><span>${row.year ? esc(row.year) : 'Year unknown'}${row.bggId ? ` · BGG ${esc(row.bggId)}` : ''}</span>${row.statuses.length > 1 ? `<small>Also: ${row.statuses.slice(1).map(label).join(', ')}</small>` : ''}</td><td data-label="Primary state"><label class="sr-only" for="status-${row.sourceRow}">Primary state for ${esc(row.title || `row ${row.sourceRow}`)}</label><select id="status-${row.sourceRow}" data-row-status="${row.sourceRow}">${STATUSES.map((status) => `<option value="${status}" ${row.primaryStatus === status ? 'selected' : ''}>${label(status)}</option>`).join('')}</select></td><td data-label="Rating" class="numeric">${row.rating ?? '—'}${row.rating !== null ? '<small>/ 10</small>' : ''}</td><td data-label="Review notes"><div class="issues">${issues}</div></td></tr>`;
}

function homePage(): string {
  return shell(`<main id="main"><section class="hero-copy"><p class="eyebrow">A local translation bench for board-game collectors</p><h1>Carry your shelf<br><em>without dropping a state.</em></h1><p class="lede">Turn a BoardGameGeek collection CSV into one clean, reviewable record—then take it to Yamtrack, NeoDB, or your next tracker.</p></section>${stepNav()}<div class="notebook">${state.parsed ? mapBench() : emptyBench()}</div><section class="trust-note"><span aria-hidden="true">✦</span><div><h2>Designed to leave no trace</h2><p>No uploads, accounts, cookies, or game-art copies. Close the tab and your working collection is gone.</p></div></section></main>`);
}

function render(focusId?: string): void {
  const path = activePath();
  app.innerHTML = path === '/privacy' ? legalPage('privacy') : path === '/terms' ? legalPage('terms') : homePage();
  bindEvents();
  if (focusId) requestAnimationFrame(() => document.getElementById(focusId)?.focus());
}

function announce(message: string): void {
  const region = document.getElementById('live-region');
  if (region) region.textContent = message;
}

function loadText(text: string, name: string, size: number): void {
  try {
    const parsed = parseCsv(text);
    if (!parsed.rows.length) throw new Error('The file has headers but no collection rows. Export a non-empty BGG collection.');
    state.parsed = parsed; state.mapping = defaultMapping(parsed.headers); state.fileName = name; state.fileSize = size; state.error = ''; state.filter = 'all'; state.overrides.clear();
    state.rows = normalizeRows(parsed, state.mapping);
    render('mapping-title');
    announce(`${parsed.rows.length} collection rows loaded. Review the detected mappings.`);
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'The file could not be read.';
    state.parsed = null; state.mapping = null; state.rows = [];
    render('file-input');
  }
}

async function loadFile(file: File): Promise<void> {
  if (file.size > 20 * 1024 * 1024) { state.error = 'That file is over 20 MB. Export a smaller collection CSV.'; render('file-input'); return; }
  if (!file.name.toLowerCase().endsWith('.csv')) { state.error = 'Choose a .csv file from your BGG collection export.'; render('file-input'); return; }
  try { loadText(await file.text(), file.name, file.size); } catch { state.error = 'The browser could not read that file. Try downloading it again.'; render('file-input'); }
}

function recompute(focusId?: string): void {
  if (!state.parsed || !state.mapping) return;
  state.rows = normalizeRows(state.parsed, state.mapping, state.overrides);
  render(focusId);
}

function navigate(path: string): void {
  history.pushState({}, '', path); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); render();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((anchor) => anchor.addEventListener('click', (event) => { event.preventDefault(); navigate(anchor.pathname); }));
  const input = document.querySelector<HTMLInputElement>('#file-input');
  input?.addEventListener('change', () => { const file = input.files?.[0]; if (file) void loadFile(file); });
  document.querySelector('#sample-button')?.addEventListener('click', () => { const sample = makeSampleCsv(); loadText(sample, 'shelf-bridge-sample.csv', new Blob([sample]).size); });
  const drop = document.querySelector<HTMLElement>('#drop-zone');
  drop?.addEventListener('dragover', (event) => { event.preventDefault(); drop.classList.add('dragging'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('dragging'));
  drop?.addEventListener('drop', (event) => { event.preventDefault(); drop.classList.remove('dragging'); const file = event.dataTransfer?.files[0]; if (file) void loadFile(file); });
  document.querySelector('#clear-file')?.addEventListener('click', () => { if (!confirm(`Clear “${state.fileName}” from this tab? Your original file is unchanged.`)) return; Object.assign(state, { parsed: null, mapping: null, rows: [], fileName: '', fileSize: 0, error: '', filter: 'all' }); state.overrides.clear(); render('file-input'); announce('The working file was cleared.'); });
  document.querySelectorAll<HTMLSelectElement>('[data-flag]').forEach((select) => select.addEventListener('change', () => { if (!state.mapping) return; state.mapping.flags[select.dataset.flag as SourceFlag] = select.value as NeutralStatus | 'ignore'; recompute(); announce(`${label(select.dataset.flag ?? '')} now maps to ${label(select.value)}.`); }));
  const ratingColumn = document.querySelector<HTMLSelectElement>('#rating-column');
  ratingColumn?.addEventListener('change', () => { if (state.mapping) { state.mapping.ratingColumn = ratingColumn.value; recompute('rating-column'); } });
  const ratingScale = document.querySelector<HTMLSelectElement>('#rating-scale');
  ratingScale?.addEventListener('change', () => { if (state.mapping) { state.mapping.ratingScale = ratingScale.value as MappingConfig['ratingScale']; recompute('rating-scale'); } });
  const notesColumn = document.querySelector<HTMLSelectElement>('#notes-column');
  notesColumn?.addEventListener('change', () => { if (state.mapping) { state.mapping.notesColumn = notesColumn.value; recompute('notes-column'); } });
  document.querySelectorAll<HTMLInputElement>('input[name="duplicates"]').forEach((radio) => radio.addEventListener('change', () => { if (state.mapping) { state.mapping.duplicatePolicy = radio.value as MappingConfig['duplicatePolicy']; recompute(); } }));
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter as Filter; render(); document.querySelector<HTMLButtonElement>(`[data-filter="${state.filter}"]`)?.focus(); }));
  document.querySelectorAll<HTMLSelectElement>('[data-row-status]').forEach((select) => select.addEventListener('change', () => { const row = Number(select.dataset.rowStatus); state.overrides.set(row, select.value as NeutralStatus); recompute(`status-${row}`); announce(`Primary state for source row ${row} changed to ${label(select.value)}.`); }));
  document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.addEventListener('click', () => download(button.dataset.export as Parameters<typeof createExport>[1])));
}

function download(profile: Parameters<typeof createExport>[1]): void {
  const output = createExport(state.rows, profile);
  const url = URL.createObjectURL(new Blob([output.content], { type: `${output.type};charset=utf-8` }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `shelf-bridge-${new Date().toISOString().slice(0, 10)}.${output.extension}`; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(`${label(profile)} downloaded with ${state.rows.filter((row) => row.included).length} games.`);
}

window.addEventListener('popstate', () => render());
window.addEventListener('online', () => { const note = document.querySelector<HTMLElement>('#offline-note'); if (note) note.hidden = true; announce('You are back online.'); });
window.addEventListener('offline', () => { const note = document.querySelector<HTMLElement>('#offline-note'); if (note) note.hidden = false; announce('You are offline. The converter still works.'); });
render();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
