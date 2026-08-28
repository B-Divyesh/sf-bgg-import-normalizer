# Shelf Bridge adversarial first-read review 1 — FAIL

Work order: `bgg-import-normalizer-review-1`
Completed: 2026-08-28

This reviewer changed no product code. The requested review is in `.factory/review-1.md`.

Result: **FAIL**. The live product is visually distinct and the clean-clone build, unit tests, and existing accessibility smoke test pass. It nevertheless misses three release-blocking factory requirements: a direct, isolated, labeled demo with reset; `.factory/claims.json` plus observable claim tests; and real `/demo`/404 route handling. Route changes also leave focus on `BODY`, legal routes retain the landing title, and canonical/OG/Twitter/Apple metadata is absent.

Verification completed from a fresh local clone:

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
npm run test:a11y
```

All five commands completed successfully (`npm test`: 8/8; a11y script: axe 0 violations), but no claim commands could run because the claims registry is missing. Live fresh-context checks covered 390px and desktop first screens, sample behavior, direct demo URLs, storage, same-origin network interception, cached offline reload, links, route focus/back, and metadata.

Next steps: implement the blockers in the review, add their browser tests, then rerun an independent review. Earlier verification notes below are retained as historical evidence and do not override this review verdict.

# Historical verification notes

# Shelf Bridge independent verification 2 — PASS

Work order: `bgg-import-normalizer-verify-2`
Verified candidate: `d9b333f414b9d815875be3a78dc7546571a5a957`
Verified URL: <https://bgg-import-normalizer.sociobot.in>
Completed: 2026-08-28

**PASS — no release-blocking defects found.** A fresh clean-checkout verification confirmed that the live deployment exactly matches this candidate and that the previous skip-link failure is repaired live.

- Passed: `npm ci`, `npm test` (8/8), `npm run build`, `npm audit --omit=dev`, local and live production Playwright/axe checks (0 violations), and Lighthouse local production scores of 100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO.
- Independently exercised valid BGG-style data, multiline/quoted CSV values, duplicate keep-first/keep-all behavior, mapping changes and status-drop blocking/recovery, primary-state override preservation, all four download formats, invalid/empty/malformed/header-only/oversize files, confirmation-based clear, desktop and 390px mobile, keyboard skip/focus behavior, reduced motion, and PWA offline reload.
- Live `index.html`, JS, CSS, service worker, and mobile image hashes match `dist/`; live requests were same-origin only. Cookies, local/session storage, and IndexedDB stayed empty; only the documented service-worker shell cache persisted.
- Response policy is live: HTTPS/HSTS, same-origin CSP, no-referrer, nosniff, camera/microphone/geolocation denial, 30-second HTML revalidation, and immutable hashed-asset caching.

Full exact evidence and hashes: [.factory/verification-2.md](verification-2.md).

Remaining non-release work: validate the brief's success metric with ten consented, diverse real BGG exports; destination importer schemas can change, so users should retain the normalized CSV/JSON and review profile files before importing.

---

# Shelf Bridge repair handoff — PASS (local verification)

Work order: `bgg-import-normalizer-repair-1`

Repair base: `d9dc59cc1cb432ba4500dacf59903aba4440898d`
Release repair commit: `f13e66673797328770601b778e0813d2da57981d`

## Release-blocking repair

The independent verifier found one Medium, release-blocking keyboard defect: after `Tab`, then `Enter` on “Skip to converter”, Chromium changed the URL to `#main` but left focus on `BODY`.

The repair makes each rendered `<main id="main">` programmatically focusable with `tabindex="-1"`. The static skip link now prevents the incomplete native fragment action, updates the fragment to `#main`, focuses the current main landmark without a second scroll, and scrolls that landmark into view. This preserves the existing route, visual design, and keyboard flow while giving assistive-technology and keyboard users a deterministic content target.

`tools/a11y-check.mjs` has exact browser regression coverage for the verifier’s reproduction: first `Tab` must reach “Skip to converter”; `Enter` must produce `{ active: "MAIN#main", hash: "#main" }`. Playwright Chromium 1.58.2 is now pinned to match the installed browser revision.

## What was verified locally on 2026-08-28

From a clean dependency install:

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
npm run preview -- --port 4173
npm run test:a11y
```

- `npm ci`: passed; 65 packages audited, 0 vulnerabilities.
- `npm test`: passed; 1 file, 8 tests.
- `npm run build`: passed (`tsc --noEmit` plus Vite); `dist/index.html` is present. This product has no separate lint command; the release build performs the repository’s TypeScript check.
- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- Production-browser Playwright + axe check: passed with 0 WCAG 2 A/AA violations across empty, populated, privacy, terms, and offline states; no page errors. It exercised the repaired Tab/Enter skip flow, sample import, status-drop export guard, mapping focus preservation, JSON download, 390px mobile layout, desktop screenshot/layout, and offline reload after service-worker registration.
- Build output: 25,639 B JS (9,490 B gzip) and 14,616 B CSS (4,268 B gzip), within the static-product 200 KB / 50 KB budgets. `dist/` is 255,105 B including maps and all assets; the largest shipped image is 61,702 B.
- Static response policy remains in `public/staticwebapp.config.json`: same-origin CSP, no-referrer policy, nosniff, denied camera/microphone/geolocation, navigation fallback, and immutable cache headers for hashed assets. Final live identity and response checks appear below.

## Production deployment and live re-verification

The production `dist/` was deployed with Azure Static Web Apps CLI 2.0.10 to `sf-bgg-import-normalizer` on 2026-08-28. Both the Azure default hostname (`https://blue-dune-071e2d00f.7.azurestaticapps.net`) and the product hostname (`https://bgg-import-normalizer.sociobot.in`) served the repaired `index-C0EMHamh.js` and `index-CvRcjaiu.css`.

- Live JavaScript SHA-256 exactly matched `dist/assets/index-C0EMHamh.js`: `d40df257aacb50a06ebe842b5f64281b0330e99b9c2330a6a521ca6133bb5a4c`.
- The product hostname returned HTTPS/HSTS, `Cache-Control: public, must-revalidate, max-age=30`, the same-origin CSP, no-referrer, nosniff, and denied camera/microphone/geolocation policies; `/privacy` and `/terms` each returned 200.
- The full production Playwright + axe check passed again: 0 WCAG 2 A/AA violations in five states, including the exact Tab/Enter skip-link regression, 390px/mobile and desktop browser coverage, keyboard focus retention, download, and offline reload after service-worker registration.
- After a live sample import, browser resource origins contained only `https://bgg-import-normalizer.sociobot.in`; cookies, localStorage, sessionStorage, and IndexedDB were empty. The only persistence was the documented `shelf-bridge-v3` Cache Storage application shell. The deployed service worker retained its versioned activation, `skipWaiting()`, and `clients.claim()` update behavior.

## Product and privacy scope retained

- The artifact remains a Vite + vanilla TypeScript static web app deployed from `dist/`.
- No collection data is uploaded, persisted, or tracked; no runtime third-party requests, remote fonts, or analytics were added.
- Normalization, validation, duplicate recovery, status preservation, exports, legal pages, responsive review cards, and service-worker offline behavior are unchanged.

## Remaining product notes

- Yamtrack and NeoDB profile schemas may change. The normalized CSV/JSON remain the lossless source formats; inspect destination profiles before importing.
- Offline use starts after one successful online production visit; a first visit cannot work offline.
- The brief’s real-pilot target still needs ten consented, diverse BGG exports.

---

# Superseded verification result

Latest independent verification: `bgg-import-normalizer-verify-1`, completed 2026-08-27.

Candidate `44dcd856ab3c5efa928a025d725e672a18a02da0` was blocked only by the keyboard skip-link defect documented in [.factory/verification.md](verification.md). The converter, validation/recovery paths, status preservation and exports, live privacy headers, same-origin network behavior, service-worker offline reload, 390px layout, and axe scans otherwise passed.

---

# Builder handoff (superseded by verification result)

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
