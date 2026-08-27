# Independent release verification — FAIL

Verified 2026-08-27 against candidate `44dcd856ab3c5efa928a025d725e672a18a02da0` and the deployed URL <https://bgg-import-normalizer.sociobot.in>.

## Verdict

**FAIL.** The deployed site is healthy and exactly matches the candidate, and the converter is otherwise a strong functional match for the researched brief. It does not meet the supplied non-negotiable keyboard baseline: activating the first-focusable “Skip to converter” link leaves focus on `BODY`, not on `main`.

## Release-blocking defect

### Medium — skip link does not move keyboard focus to main

- Reproduction: load `/`, press `Tab` (focus is correctly on “Skip to converter”), then press `Enter`.
- Actual evidence from Chromium 145: `{ active: "BODY#", hash: "#main", scrollY: 0 }`.
- Expected: focus moves to the `<main id="main">` landmark (normally by making it programmatically focusable and focusing it on skip-link activation). This is explicitly required by the accessibility acceptance contract, and without it keyboard/screen-reader users cannot reliably begin at application content.
- Severity is Medium, but it is release-blocking because the product contract makes the keyboard baseline non-negotiable.

No Critical or High defects found. No other Medium or Low defects found in the exercised scope.

## Fresh clean-checkout evidence

I created a detached clean worktree at the candidate commit, installed with `npm ci`, and ran:

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 64 packages audited, 0 vulnerabilities |
| `npm test` | Pass; 1 file / 8 tests |
| Exact production build: `npm run build` | Pass; TypeScript `--noEmit` and Vite production build completed; `dist/` produced |
| Repository lint/type check | No separate lint command is declared; build runs the available type check |
| `npm audit --omit=dev` | Pass; 0 vulnerabilities |
| Project Playwright/axe check, local preview | Pass; 0 violations across empty, populated, privacy, terms, and offline states; checks status-drop guard, JSON download, focus preservation after mapping, and offline reload |
| Same project Playwright/axe check against live URL | Pass; 0 violations across the same five states |

An attempt to run Lighthouse 13.0.1 independently could not connect to the supplied Chrome-for-Testing binary in this container (`Unable to connect to Chrome`), so no Lighthouse score is claimed in this report. This does not affect the direct Playwright and build measurements below.

## End-to-end exercise

Using a representative BGG-shaped CSV with quoted commas/quotes/newlines, owned + past-owned + wishlist states, duplicate BGG IDs, an unclassified row, a missing title, and an out-of-range rating:

- The parser preserved quoted/multiline title and note data; multiple active states remained available.
- Duplicate records were surfaced as “Duplicate 1 of 2” / “Duplicate 2 of 2”; changing from keep-first to keep-all restored the duplicate while the missing-title row remained excluded.
- Unclassified, missing-title, and rating-out-of-range rows were visibly marked for review.
- Mapping active `own` to Ignore disabled export; returning it to Owned re-enabled export.
- A row primary-state override to Wishlist preserved the row’s existing `previously_owned` status in the normalized JSON.
- Normalized JSON contained schema `shelf-bridge/v1` and four included records. Normalized CSV, Yamtrack profile, and NeoDB-style profile all downloaded with their expected extensions.
- Invalid file extension, empty CSV, unterminated quoted CSV, and CSV lacking a Name/Title column each showed a specific error, after which the built-in sample successfully recovered the workflow.
- A CSV 21 bytes over the 20 MiB limit was rejected before parsing.
- Local and live page runs produced no browser console errors or page errors.

Visual inspection of the populated workflow at 1366×900 and 390×844 found the required desktop table/mobile review-card reflow intact and controls legible. The 390px request selected a 38,034-byte AVIF hero asset. `prefers-reduced-motion: reduce` reduced the tested panel transition from `0.18s` to `0.00001s`.

## Accessibility and privacy

- Local and deployed axe scans found **0 serious/critical (indeed 0 total) WCAG 2 A/AA violations** in five app/legal/offline states.
- Live page has one `<h1>` and one `<main>`, correct document title and `lang="en"`; the first Tab reaches the visible-focus skip link. The focus-transfer defect above makes the overall keyboard result fail.
- The deployed interaction made requests only to `https://bgg-import-normalizer.sociobot.in`; the local run made only same-origin application/image requests. There are no runtime third-party scripts, remote fonts, analytics, or uploads.
- After importing the sample on the live site: cookies, localStorage, sessionStorage, and IndexedDB were empty. The only browser persistence was the documented `shelf-bridge-v3` Cache Storage application shell.
- `/privacy` and `/terms` both returned 200 and accurately describe local-only conversion/cache behavior.

## Build, caching, and deployment identity

- Initial JS: **25,385 bytes** (9,460 gzip), within the 200 KB budget.
- Initial CSS: **14,616 bytes** (4,260 gzip), within the 50 KB budget. No font payload is downloaded.
- Total `dist/`: 254,119 bytes. Largest shipped image is 61,702 bytes; AVIF is 38,034 bytes.
- Live document HTML exactly matched the candidate build and referenced the same hashed JS/CSS. SHA-256 matches were confirmed for the live JS, CSS, and `sw.js` against `dist/`.
- Live response policy: HTTPS/HSTS; `Content-Security-Policy` restricts scripts/styles/connect to self; `Referrer-Policy: no-referrer`; `X-Content-Type-Options: nosniff`; camera/microphone/geolocation denied by Permissions-Policy.
- Live HTML uses 30-second must-revalidate caching; hashed JS/CSS and images use `public, max-age=31536000, immutable`.
- Service worker registered at `/sw.js`; the project’s local and live checks both completed an offline reload after a successful visit. Source implements versioned cache activation plus `skipWaiting()`/`clients.claim()` update behavior.

## Scope notes

This is a static web product, not a library, CLI, or backend; consumer-package, concurrency, persistence-server, and health-endpoint checks do not apply. No product code was changed during verification. The previous report is the builder handoff; this independent report is therefore stored as `.factory/verification.md`.
