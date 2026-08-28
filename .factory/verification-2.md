# Independent release verification — PASS

Verified 2026-08-28 from a clean checkout at candidate `d9b333f414b9d815875be3a78dc7546571a5a957` against <https://bgg-import-normalizer.sociobot.in>.

## Verdict

**PASS.** Shelf Bridge meets the researched brief's smallest useful product: a local-only BGG collection CSV converter with reviewable neutral mappings, duplicate handling, status-drop prevention, and normalized/Yamtrack/NeoDB-style exports. The prior deployment-only keyboard concern is resolved in the candidate and is live.

No Critical, High, Medium, or Low defects were found in the verified scope.

## Clean-checkout quality gates

| Check | Fresh result |
| --- | --- |
| Commit and tree before QA | `d9b333f414b9d815875be3a78dc7546571a5a957`; clean |
| `npm ci` | Pass; 65 packages audited, 0 vulnerabilities |
| `npm test` | Pass; 1 file, 8 tests |
| `npm run build` | Pass; `tsc --noEmit` plus Vite production build; `dist/` produced |
| Available lint/type checks | No separate lint script is declared; the production build runs the available TypeScript check |
| `npm audit --omit=dev` | Pass; 0 vulnerabilities |
| Local production browser suite: `npm run test:a11y` | Pass; axe 0 violations across empty, populated, privacy, terms, and offline states |
| Same suite against live URL | Pass; axe 0 violations across the same five states |
| Lighthouse, local production preview | Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 905 ms, LCP 1,508 ms, TBT 54 ms, CLS 0 |

## End-to-end evidence

An independent Playwright run against the local production preview exercised a representative six-row BGG-shaped CSV with quoted commas, escaped quotes, a quoted newline, owned/past-owned/wishlist flags, a duplicate BGG ID, an uncategorized row, a missing title, and an out-of-range rating.

- The parser retained quoted and multiline values. It surfaced both duplicate positions, uncategorized status, missing title, and invalid rating for review.
- Switching duplicate handling from keep-first to keep-all restored the duplicate while keeping the title-less row excluded.
- Mapping an active `own` flag to Ignore disabled exports, retained keyboard focus on the changed mapping control, and re-enabled exports after mapping it back to Owned.
- A row-level Wishlist primary-state override retained the existing Previously Owned status.
- Normalized CSV/JSON, Yamtrack profile, and NeoDB-style profile each downloaded with the expected extension and schema/content marker.
- Invalid extension, empty CSV, unterminated quote, absent Name/Title column, header-only CSV, and a file one byte above 20 MiB all produced specific user-facing errors; a valid CSV then recovered the flow.
- Clear-file cancellation preserved the loaded collection; accepting the named confirmation returned to the import state.
- Desktop (1366×900) and 390×844 mobile runs were visually inspected. The mobile review cards fit a 390px viewport with no horizontal overflow; body text is 16px. No console or page errors occurred.

## Accessibility, privacy, and PWA

- Both local and live axe scans had **0 serious/critical findings** (0 findings total in the project suite). The live independent scan also had 0 WCAG 2 A/AA violations.
- The document has `lang="en"`, the correct title, exactly one `h1`, one `main`, and no images lacking `alt`. The first Tab reaches the visible skip link; Enter produces live `{ active: "MAIN#main", hash: "#main" }`.
- Local keyboard checks covered the skip link, mapping select focus preservation, native radio selection, row-state select, filters, and explicit download buttons. Reduced motion changed the observed panel transition duration to `0.00001s`.
- Local browser requests remained same-origin. The live browser made requests only to `https://bgg-import-normalizer.sociobot.in`; there are no runtime third-party scripts, fonts, analytics, uploads, cookies, localStorage, sessionStorage, or IndexedDB data.
- The only persistence after live import was the documented Cache Storage shell (`shelf-bridge-v3`). Live service-worker registration is `/sw.js`; an offline reload after a successful visit displayed the offline notice and rendered the converter. The inspected worker uses a versioned cache plus `skipWaiting()` and `clients.claim()` for updates.
- `/privacy` and `/terms` both returned 200 and accurately describe the local-only behavior.

## Deployment identity, policy, and budgets

The live `index.html` SHA-256 exactly matches local `dist/index.html`:

`52cacfcc42b45b8edb2a44ef21fd0acb25b597d43aa8f81079e89330cd31fe5d`

The deployed candidate assets also exactly match the production build:

| Asset | SHA-256 |
| --- | --- |
| `index-C0EMHamh.js` | `d40df257aacb50a06ebe842b5f64281b0330e99b9c2330a6a521ca6133bb5a4c` |
| `index-CvRcjaiu.css` | `70703764bafeb82cbd0cd37422ff2553a2fc814261c43a1d2206ac2fefa3d7e4` |
| `sw.js` | `e5b564edbd8831aa80921fd566c8d62ba132b29948088c20e0c626a61ee1693e` |
| mobile `notebook-bridge-560.webp` | `8453cb3fa5f29b00a17059ba2cbc6be256839f77ffa0500f219b69248ab4ae79` |

- Initial JS: 25,639 B (9,550 B gzip), within the 200 KB budget.
- Initial CSS: 14,616 B (4,260 B gzip), within the 50 KB budget. There are no font downloads.
- Mobile hero: 16,048 B WebP (and the available 960px AVIF is 38,034 B), within the 300 KB budget. Total `dist/`: 255,105 B.
- Live HTML uses `public, must-revalidate, max-age=30`; hashed JS/CSS, image assets, and service worker carry `public, max-age=31536000, immutable`.
- Live HTTPS response headers include HSTS, same-origin CSP (`default-src`, `script-src`, `style-src`, and `connect-src`), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a Permissions-Policy denying camera, microphone, and geolocation.

## Scope notes

This is a static PWA, not a library, CLI, or backend, so consumer-package, concurrency, server persistence, and health-endpoint checks do not apply. No product code was changed during this verification. The brief's pilot success metric still requires consented testing with ten real BGG exports; it is a product-validation next step, not a release defect.
