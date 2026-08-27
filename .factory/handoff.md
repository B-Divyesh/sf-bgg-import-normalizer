# Shelf Bridge build handoff

Work order: `bgg-import-normalizer-build-1`

Completed: 2026-08-27

Artifact: static web app, Vite + vanilla TypeScript

Deployment output: `dist/`

## What was built

- A client-only BGG collection CSV parser with BOM, CRLF, quoted comma, escaped quote, and quoted newline handling.
- Auto-detection and configurable neutral mappings for BGG ownership, previous ownership, wishlist, generic want, want-to-play, want-to-buy, trade, and preorder flags.
- Multi-status preservation, selectable 5/10/100 rating normalization, selectable notes field, row-level primary-status overrides, and stable source-row references.
- Duplicate detection by BGG ID with title/year fallback, explicit keep-first or keep-all behavior, excluded-row visibility, and review filters.
- Clear validation for empty/malformed files, missing title columns, missing titles, invalid ratings, duplicates, uncategorized games, and active statuses mapped to Ignore. Export remains blocked while a status drop exists.
- Normalized CSV, versioned `shelf-bridge/v1` JSON, Yamtrack-profile CSV, and NeoDB-style CSV downloads. Destination profiles retain `source_statuses` to prevent silent loss.
- Responsive handwritten-lab-notebook UI with a keyboard-operable file input/drop target, 44 px controls, designed focus state, status announcements, confirmation before clearing, offline notice, and mobile review cards.
- Original generated notebook/bridge illustration with source, prompt, review record, AVIF/WebP/JPEG variants, and reproducible Sharp build script. Largest deployed variant is 61 KB.
- Privacy and terms routes, service-worker shell caching, manifest, CSP/security headers, sitemap, and robots file. No collection persistence, analytics, third-party runtime scripts, or remote fonts.

## Verification

Run from a clean clone:

```sh
npm install
npm test
npm run build
```

Results on 2026-08-27:

- `npm test`: 8/8 passing.
- `npm run build`: passing; `dist/index.html` present.
- Initial application bundle: 25.38 KB JS (9.46 KB gzip), 14.61 KB CSS (4.26 KB gzip).
- `npm audit`: 0 vulnerabilities.
- Factory `verify-url.sh`: title/lang/main/alt checks pass, 0 console errors at desktop and 390 px.
- Playwright + axe-core: 0 WCAG 2 A/AA violations across empty, populated, and offline converter states plus privacy and terms; status-drop blocking, normalized JSON download, focus preservation, and offline reload also smoke-tested.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: FCP 0.9 s, LCP 1.5 s, CLS 0, total blocking time 0 ms.
- Visual inspection completed for empty and populated views at 1366×900 and 390×844.

## Known gaps and next steps

- Yamtrack and NeoDB import schemas are not stable cross-service contracts. The profile CSVs are transparent adapters and may need column renaming when those projects change; normalized CSV/JSON remain lossless.
- This v1 intentionally does not scrape BGG, fetch game metadata/art, host a collection, keep play logs, or store mappings between sessions.
- Real-pilot validation against ten diverse BGG exports is still needed to measure the brief’s 80% success target. Add fixtures only with collector permission and remove personal comments from them.
- The service worker provides offline reuse after one successful production visit; it does not make the first visit available offline.
