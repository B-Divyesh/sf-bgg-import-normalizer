# Shelf Bridge

Shelf Bridge turns a BoardGameGeek collection CSV into a reviewable, target-neutral collection, then exports normalized CSV/JSON plus Yamtrack and NeoDB-style CSV profiles. It is for board-game collectors changing trackers without silently losing owned, previously owned, wishlist, intent, preorder, or trade states.

Live product: <https://bgg-import-normalizer.sociobot.in>

## What it does

- Reads user-supplied BGG CSV exports entirely in the browser; nothing is uploaded or persisted.
- Detects BGG `own`, `prevowned`, `wishlist`, `want`, `wanttoplay`, `wanttobuy`, `fortrade`, and `preordered` flags.
- Lets every source flag map to a transparent neutral status. Multiple simultaneous states are kept.
- Normalizes a selected rating column from 5-, 10-, or 100-point scales and carries a selected notes column.
- Finds duplicate BGG IDs (or matching title/year when no ID exists) and makes the keep-first/keep-all policy explicit.
- Shows missing titles, invalid ratings, uncategorized rows, status drops, and duplicates before export.
- Exports normalized CSV, lossless `shelf-bridge/v1` JSON, Yamtrack-profile CSV, and NeoDB-style shelf CSV.
- Works at 390 px, from the keyboard, and offline after the first production visit.

The destination profiles deliberately retain a `source_statuses` column. Yamtrack and NeoDB import conventions can change, so inspect the profile before importing it. The normalized CSV/JSON are the durable source-of-truth formats.

## Privacy

There are no accounts, analytics, cookies, third-party scripts, remote fonts, or collection uploads. Imported data lives only in page memory and disappears when the tab reloads or closes. A service worker caches only the application shell and illustration. See `/privacy` and `/terms` in the running app.

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the shown local URL and either select a BGG collection export or use the built-in three-game sample.

## Verify

```sh
npm test
npm run build
npm audit
```

`npm run build` is the exact deployment build command. It creates `dist/` with `dist/index.html` at its root for Azure Static Web Apps.

For the browser accessibility and download smoke test, start the production preview in one terminal and run the check in another:

```sh
npm run preview -- --port 4173
npm run test:a11y
```

The accessibility check uses the container Chromium path by default. Elsewhere, set `CHROMIUM_PATH` to a local Chromium executable and optionally set `SHELF_BRIDGE_URL` if the preview is not at `http://127.0.0.1:4173`.

The generated illustration can be rebuilt from its reviewed source:

```sh
npm run assets
```

## Project notes

- Product scope: [.factory/brief.json](.factory/brief.json)
- Visual system and image provenance: [.factory/design.md](.factory/design.md)
- Build handoff: [.factory/handoff.md](.factory/handoff.md)
- License: [MIT](LICENSE)

Shelf Bridge is independent and is not affiliated with or endorsed by BoardGameGeek, Yamtrack, or NeoDB.
