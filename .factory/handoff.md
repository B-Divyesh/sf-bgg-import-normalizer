# Shelf Bridge handoff

## Review 3 update — PASS

Work order `bgg-import-normalizer-review-3` completed on 2026-09-05 with **zero findings and zero untested public claims**. No product code changed.

- Reviewed implementation: `b976f172ab8a78c0e408d16656b43638fc327bf4` (`b976f17`).
- Reviewed documentation baseline: `d9dd5f5a9c9f9a33e3fe2b176875bad125bee109` (`d9dd5f5`); its only later changes were documentation.
- Fresh 390px phone and desktop live contexts showed the job, audience, and sample action before scrolling. The populated demo showed its persistent label, realistic sample status/output, duplicate marker, reset, and real-data-safe exit.
- From a clean checkout, all 12 declared claim commands, `npm test`, build, local browser tests, and local accessibility checks passed. Live `test:live`, browser (19/19), and accessibility checks passed; axe reported 0 violations.
- The fresh candidate build hash-matched the live HTML, 404 page, JavaScript, and CSS. Internal routes and the labelled external source link worked. The unknown route is intentionally styled and returns HTTP 404.

The full report is `.factory/review-3.md`. The evidence copy is `/work/.evidence/qa-report.md`; `/work/.evidence/qa-result.json` records the matching PASS verdict.

## Verification 3 update — PASS

Verified on 2026-09-05 with **zero findings and zero untested claims**. The implementation reviewed was `b976f172ab8a78c0e408d16656b43638fc327bf4`; the documentation baseline was `2509f0f3c2d79f0bfecea0254585559a688a23fb`.

- A fresh detached checkout at the implementation SHA passed `npm ci --include=dev`, all 12 independently run claim commands, `npm test` (8 tests), `npm run build`, `npm run test:browser` (18 local tests), and `npm run test:a11y`.
- The live product passed `npm run test:live` (true styled HTTP 404), `npm run test:browser` (19/19), and `npm run test:a11y` (axe 0 violations across five states).
- Fresh desktop and 390px-phone checks showed the job, audience, and **Try it with sample data** action before scrolling. The populated demo showed its persistent sample label, named status/output cards, and duplicate marker. Resetting demo and leaving it preserved an imported real row and removed demo storage.
- Live `index.html`, `404.html`, and hashed JavaScript/CSS exactly matched a fresh candidate build. All content links were reachable; security headers, legal pages, offline reload, keyboard paths, reduced motion, route focus, privacy request logging, invalid/boundary/recovery paths, and metadata passed.

The full independent evidence is in `.factory/verification-3.md`. The only remaining work is consented testing with real BGG exports, already noted below as product validation rather than a release defect.

Work order: bgg-import-normalizer-repair-2
Completed: 2026-09-05
Implementation SHA: `b976f172ab8a78c0e408d16656b43638fc327bf4`
Verification documentation SHA: `0ebf1a5f94ff2000c0e2963cd86cfa9ac6dfd617`.

## Product and release

Shelf Bridge converts a BGG collection CSV into reviewable files. It is for board-game collectors changing trackers. The first action is **Try it with sample data**, which opens the isolated three-game sample.

The implementation SHA above was pushed, built, and deployed to <https://bgg-import-normalizer.sociobot.in>. The live root HTML and hashed JavaScript/CSS exactly match its local `dist/` build. The catalog description remains verb-first, 92 characters, and was copied to `/work/.evidence/catalog-description.txt`.

## Repairs completed

| Review finding | Current disposition |
| --- | --- |
| F-2-1: demo destroys real work | Fixed. Real and demo collections now use separate in-memory state. Browser Back and **Use my BGG CSV** restore the real row and mapping. |
| F-2-2: soft 404 | Fixed. Known app routes are explicit static rewrites; unknown routes use the styled `404.html` response override and return HTTP 404. |
| F-2-3: empty first demo viewport | Fixed. The demo opens with named BGG statuses, output statuses, and a Catan duplicate immediately visible. |
| F-2-4: duplicate promise untested | Fixed. The shipped sample includes a duplicate, with an outcome test for both keep-first and keep-all policies. |
| F-2-5: status mapping promise untested | Fixed. An outcome test verifies all active sample mappings in JSON and proves Ignore blocks export. |
| F-2-6: row editing promise untested | Fixed. An outcome test changes Terraforming Mars’s primary status and verifies its other BGG statuses persist in JSON. |
| F-2-7: destination details untested | Fixed. The downloads claim and test verify Yamtrack status, NeoDB complete shelves, and source statuses. |
| F-2-8: missing first-screen facts | Fixed. The landing screen now shows free use, no upload, and offline-after-first-visit facts. |
| F-2-9 through F-2-17 | Fixed. Controls use result-naming verbs; status terminology is consistent; README, footer provenance, and the external GitHub label are plain and specific. |
| Earlier round-1 findings | Remain fixed: direct demo URLs, route focus/announcements, metadata, plain headline, mobile sample action, skip-link focus, PWA/offline behavior, legal pages, and privacy. |

The service-worker cache version changed so existing visitors receive the repaired shell.

## Verification

Fresh clone: `/tmp/shelf-bridge-final-clean.55CrKD` at the implementation SHA.

- `npm ci --include=dev`: passed.
- All 12 commands declared in `.factory/claims.json` ran independently and passed.
- `npm test`: 8/8 passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm run test:browser`: 18 passed; the deployed-only test is intentionally skipped for local base URLs.
- Local `npm run test:a11y`: axe reported 0 violations across empty, populated, legal, and offline states.
- Azure Static Web Apps emulator: `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route returned the styled page with 404. Static 404 axe scan: 0 violations.
- Live `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:browser`: 19/19 passed, including every claim and the true-404 test.
- Live `npm run test:live`: passed. Live `npm run test:a11y`: axe reported 0 violations across five states.
- A fresh desktop and phone cold check confirmed the job, audience, and sample action before scrolling. The phone demo view showed Catan’s source status, output status, and duplicate review marker; Reset and the real-collection round trip were covered in the live suite.

Local mobile Lighthouse, with the production preview:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP was 904 ms, LCP 1,506 ms, TBT 0 ms, and CLS 0. Initial JavaScript is 29,577 bytes (10,530 gzip); CSS is 17,614 bytes (4,770 gzip). The largest mobile hero asset is 16,048 bytes. No remote fonts, third-party scripts, analytics, uploads, or payment flow are present.

## Known gaps and next steps

- The brief’s pilot success measure still needs consented trials with ten real BGG exports.
- Yamtrack and NeoDB import conventions can change. The output transformations are tested, but importing into those external services is a user-controlled next step.
- This is a static local-first converter; backend persistence, tenant isolation, health checks, rate limits, and SQLite are not applicable.
- No AI feature was added. Deterministic CSV mapping and privacy are the core job; a model would add cost and uncertainty without improving it.
