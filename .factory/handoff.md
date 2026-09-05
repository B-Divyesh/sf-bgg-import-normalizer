# Shelf Bridge repair handoff

Work order: bgg-import-normalizer-repair-2
Completed: 2026-09-05
Implementation SHA: `b976f172ab8a78c0e408d16656b43638fc327bf4`
Verification documentation SHA: recorded in the follow-up documentation commit.

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
