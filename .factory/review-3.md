# Review BGG collection CSV conversion — PASS

Reviewed 2026-09-05. Live URL: <https://bgg-import-normalizer.sociobot.in>

## Verdict

**PASS — zero findings and zero untested public claims.**

Implementation reviewed: `b976f172ab8a78c0e408d16656b43638fc327bf4` (`b976f17`).

Documentation baseline reviewed: `d9dd5f5a9c9f9a33e3fe2b176875bad125bee109` (`d9dd5f5`). The only changes after the implementation candidate were `.factory/handoff.md` and `.factory/verification-3.md`; no new product image was required. A fresh candidate build hash-matched the live `index.html`, `404.html`, JavaScript, and CSS.

## First screen and sample

Fresh Chromium contexts opened the live page at 390×844 and 1366×900 with scroll position zero and no console errors. Before scrolling, both showed:

- Job: **Convert a BGG collection CSV**.
- Audience: **For board-game collectors changing trackers**.
- First action: **Try it with sample data**; it says **Loads three BGG games for review.**

The phone action occupied y=320–366, so it was visible in the first viewport. Selecting it opened `/demo` and immediately showed the persistent **Demo — sample data, nothing is saved.** label, **Reset demo**, **Use my BGG CSV**, named Catan output, and its duplicate marker. The separate `@claim:demo-isolation` run loaded a real CSV, entered, reset, and left demo, then proved that the real row and mapping remained while demo storage was removed. No real collection was changed.

## Clean-checkout checks

A clean clone at `d9dd5f5` ran `npm ci --include=dev` with the documented Node 20-or-newer prerequisite. It was then built from the unchanged implementation sources.

| Check | Result |
| --- | --- |
| 12 declared claim commands, run independently | Pass: one matching outcome test for every registry entry |
| `npm test` | Pass: 8 tests |
| `npm run build` | Pass; `dist/index.html` produced |
| `npm run test:browser` locally | Pass: 18 passed; one deployed-only test skipped as intended |
| `npm run test:a11y` locally | Pass: axe 0 violations across 5 states |
| `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:live` | Pass: true styled HTTP 404 |
| `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:browser` | Pass: 19/19 |
| `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:a11y` | Pass: axe 0 violations across 5 states |

The independently executed claims were `demo-isolation`, `local-processing`, `offline-reload`, `free-to-use`, `downloads`, `file-size-limit`, `status-mapping`, `status-review`, `status-edit-preserves-secondary`, `duplicate-handling`, `keyboard-operation`, and `in-memory-clearing`. Each is listed once in `.factory/claims.json` and has one corresponding `@claim:` outcome test. The landing page, demo, legal pages, and README were cross-checked against the registry and copy audit; no public claim was missing a test.

## User paths and site checks

The deployed browser suite exercised a valid collection import; non-CSV and unclosed-quote errors; the 20 MiB plus one-byte rejection; recovery with a valid CSV; all four downloads; Ignore blocking export; both duplicate policies; row-status editing; keyboard controls; offline reload after first visit; route focus and announcements; and direct `?demo=1` entry.

The live page has one `h1`, `main`, `lang="en"`, visible skip-link focus, route-specific titles and metadata, and labelled native form controls. Keyboard route changes and Back focus the new h1 and update the polite announcement. The live axe scan found no violations. Reduced-motion handling is covered by the deployed suite. The privacy claim’s request recording accepted only same-origin requests through a complete sample download flow. No uploads, analytics, third-party scripts, remote fonts, or payment path were observed.

`/`, `/demo`, `/privacy`, and `/terms` returned HTTP 200 with their route titles. The internal links and the identified external GitHub source link returned 200. An unknown route returned HTTP 404, the styled `Page not found — Shelf Bridge` page, and the return link. Its response includes HSTS, `nosniff`, `no-referrer`, a same-origin CSP, `frame-ancestors 'none'`, and camera/microphone/geolocation restrictions. Offline and update behaviour are present through the versioned service worker. This is a static local-first product, so backend-only tenant, restart-persistence, health, and rate-limit checks do not apply.

## Earlier findings

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Review 1: no isolated demo/direct demo URL | Fixed: `/demo` and `?demo=1` seed the isolated sample; the independent real-data round trip passed. |
| Review 1: no claims registry or tests | Fixed: all 12 declared claims passed independently and no public claim is unlisted. |
| Review 1: missing/broken 404 | Fixed: live unknown route is styled and returns HTTP 404. |
| Review 1: title, focus, and route announcement | Fixed: deployed route/Back test passed. |
| Review 1: metadata absent | Fixed: deployed metadata test passed for home, demo, legal, and 404 routes. |
| Review 1: unclear headline and hidden mobile sample action | Fixed: job, audience, action, and result text are visible in both fresh first screens. |
| Earlier verification: skip link left focus on body | Fixed: local and live accessibility checks move focus to `main`. |
| F-2-1: demo discarded real work | Fixed: the independent demo-isolation claim preserves real row and mapping. |
| F-2-2: styled 404 returned 200 | Fixed: live deployed-only test passed HTTP 404 and page assertions. |
| F-2-3: demo did not show useful output first | Fixed: Catan, output status, and duplicate marker are visible without scrolling on phone. |
| F-2-4: duplicate claim unlisted | Fixed: `duplicate-handling` passed both keep-first and keep-all outcomes. |
| F-2-5: status-mapping claim unlisted | Fixed: `status-mapping` passed all active mappings and the Ignore guard. |
| F-2-6: primary-status edit dropped secondary statuses | Fixed: `status-edit-preserves-secondary` passed JSON output assertions. |
| F-2-7: destination details untested | Fixed: `downloads` passed record, destination transform, and source-status assertions. |
| F-2-8: missing first-screen privacy, offline, and price facts | Fixed: all three facts appear in both fresh first screens. |
| F-2-9: start-real wording | Fixed: action says **Use my BGG CSV**. |
| F-2-10: download controls did not name results | Fixed: each begins with **Download** and names its file. |
| F-2-11: filter controls were unclear | Fixed: controls now say Show all/issues/ready/excluded. |
| F-2-12: inconsistent status terms | Fixed: visitor copy uses BGG status and neutral status consistently. |
| F-2-13: keyboard implementation jargon | Fixed: README says **Works with a keyboard**. |
| F-2-14: storage implementation jargon | Fixed: demo copy says sample data is separate and nothing is saved. |
| F-2-15: vague demo link | Fixed: README says **Open the three-game sample** and links `/demo`. |
| F-2-16: footer production jargon | Fixed: footer uses plain original-illustration provenance. |
| F-2-17: external source link unidentified | Fixed: link says GitHub and external. |
| Verification 2 | It reported PASS with no open finding; this review found no regression. |

## Remaining work

There are no release findings. The brief’s pilot success measure still needs consented trials with real BGG exports and user-controlled target imports. That is product validation, not a defect in this static converter.
