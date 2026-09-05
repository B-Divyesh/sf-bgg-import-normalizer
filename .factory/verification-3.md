# Shelf Bridge verification 3 — PASS

Verified on 2026-09-05 against the live product at <https://bgg-import-normalizer.sociobot.in>.

## Verdict

**PASS — zero findings and zero untested public claims.**

Shelf Bridge completes the intended job: board-game collectors can load a BGG collection CSV, review status and duplicate decisions, and download neutral, Yamtrack, and NeoDB-style files without uploading their collection.

- Implementation candidate reviewed: `b976f172ab8a78c0e408d16656b43638fc327bf4` (`b976f17`).
- Documentation baseline reviewed: `2509f0f3c2d79f0bfecea0254585559a688a23fb` (`2509f0f`), a later documentation-only commit.
- The candidate's fresh production build exactly matched live `index.html`, `404.html`, `assets/index-_PkL90bN.js`, and `assets/index-Dpsr0vV4.css` byte-for-byte.

## First screen and demo

Fresh 1366×900 desktop and 390×844 phone browser contexts opened at scroll position zero with no console errors. Before scrolling, both showed:

- Job: **Convert a BGG collection CSV**.
- Audience: **For board-game collectors changing trackers**.
- First action: **Try it with sample data**, with **Loads three BGG games for review.**

The phone action ended at y=366 in an 844px viewport. It was visible without scrolling. Selecting it opened `/demo` with the persistent **Demo — sample data, nothing is saved.** label, Reset demo, Use my BGG CSV, named Catan/Gloomhaven/Terraforming Mars sample cards, mapped output, and the Catan duplicate marker in the first viewport.

A separate fresh-context round trip imported `Real Collection Game`, entered demo, reset it, then selected Use my BGG CSV. The real row remained visible and the demo storage namespace was empty after leaving. This confirms that the sample neither reads nor changes real working data.

## Clean-checkout quality gates

A separate clone was checked out detached at the implementation candidate and set up with the documented `npm ci --include=dev` command. Its tree stayed clean.

| Check | Result |
| --- | --- |
| Every 12 declared claim commands, each run independently | Pass |
| `npm test` | Pass: 8 tests |
| `npm run build` | Pass; generated `dist/index.html` |
| `npm run test:browser` | Pass: 18 local tests; deployed-only check correctly skipped for a local URL |
| `npm run test:a11y` | Pass |

The independently run claim commands were `demo-isolation`, `local-processing`, `offline-reload`, `free-to-use`, `downloads`, `file-size-limit`, `status-mapping`, `status-review`, `status-edit-preserves-secondary`, `duplicate-handling`, `keyboard-operation`, and `in-memory-clearing`. Each is present once in `.factory/claims.json` and has one matching `@claim:` outcome test. No public claim found in the landing page, demo, or README lacked an entry and test.

## Live runtime checks

| Check | Result |
| --- | --- |
| `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:live` | Pass: styled unknown route returns HTTP 404 |
| Same URL with `npm run test:browser` | Pass: 19/19 |
| Same URL with `npm run test:a11y` | Pass: axe 0 violations across 5 states |
| `/`, `/demo`, `/privacy`, `/terms` | HTTP 200 and the browser applies their correct route titles |
| Unknown route | HTTP 404, `Page not found — Shelf Bridge`, visible return link, and styled 404 document |
| Links | All content destinations returned HTTP 200, including the identified external source link; the 404 page's `#main` skip link intentionally remains in the current HTTP-404 document |
| Headers | HTTPS/HSTS, same-origin CSP, `no-referrer`, `nosniff`, and camera/microphone/geolocation restrictions present |

Normal, invalid, boundary, and recovery paths all ran in the deployed browser suite: a valid CSV populated the review UI; a non-CSV and unclosed quote gave specific next-step errors; a 20 MiB plus one-byte CSV was rejected; a valid CSV recovered the converter. The suite also exercises all four downloads, status Ignore guarding, duplicate policies, keyboard operation, offline reload after caching, route focus/announcement, metadata, and direct `?demo=1` entry.

Keyboard and accessibility checks passed through the native controls and download action. Route navigation and Back focused the new h1 and announced the route. The skip link targets main. Reduced-motion emulation reported a `0.00001s` transition. The live axe command reported zero violations, and no console errors were observed in either fresh first-screen session.

The privacy request claim passed by recording the complete demo flow and accepting only same-origin requests. No uploads, analytics, cookies, third-party scripts, or remote fonts were observed. Offline reload works after the initial cached visit; the versioned service worker supplies the update path. This static local-first product has no backend tenant, persistence, health, or rate-limit surface, so backend-only checks are not applicable.

## Earlier findings disposition

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Review 1: no isolated demo/direct route | Fixed: `/demo` and `?demo=1` load the populated sandbox; fresh real-data round trip preserved the real row. |
| Review 1: no claim registry/tests | Fixed: 12 declared claims, 12 independently passing commands, and complete copy cross-check. |
| Review 1: soft/missing 404 | Fixed: live unknown route is a styled HTTP 404. |
| Review 1: route title, focus, and announcement | Fixed: deployed route-focus test passed for forward and Back navigation. |
| Review 1: missing metadata | Fixed: deployed metadata test passed for landing, demo, legal, and 404 routes. |
| Review 1: metaphorical copy and hidden mobile sample action | Fixed: plain job/audience/action appeared in both fresh first viewports. |
| Earlier verification: skip link did not focus main | Fixed: browser keyboard checks passed; skip link is visible and targets main. |
| F-2-1 demo discarded real work | Fixed: real collection survived demo entry, reset, and exit in a fresh context. |
| F-2-2 styled 404 returned 200 | Fixed: live `test:live` passed HTTP 404 plus page/title assertions. |
| F-2-3 demo lacked immediate realistic output | Fixed: phone first viewport showed named source statuses, output, and duplicate marker. |
| F-2-4 duplicate claim unlisted | Fixed: listed `duplicate-handling` claim command passed both policies. |
| F-2-5 status mapping claim unlisted | Fixed: listed `status-mapping` command passed mappings and Ignore guard. |
| F-2-6 row edit lost secondary statuses | Fixed: listed `status-edit-preserves-secondary` command passed JSON outcome. |
| F-2-7 destination details untested | Fixed: listed `downloads` command passed all files and transformations. |
| F-2-8 first screen lacked privacy/offline/price facts | Fixed: all three facts were visible in both fresh first viewports. |
| F-2-9 Start-for-real wording | Fixed: action is **Use my BGG CSV**. |
| F-2-10 download control wording | Fixed: controls use **Download** plus the result type. |
| F-2-11 filter control wording | Fixed in the shipped review controls; no ambiguous filter action was found. |
| F-2-12 status/state terminology | Fixed: user copy consistently says BGG status and neutral status. |
| F-2-13 keyboard implementation jargon | Fixed: README says **Works with a keyboard**. |
| F-2-14 storage implementation jargon | Fixed: demo copy says sample data is separate and nothing is saved. |
| F-2-15 vague demo link | Fixed: README says **Open the three-game sample** and links `/demo`. |
| F-2-16 internal footer provenance jargon | Fixed: visitor copy uses plain original-illustration provenance. |
| F-2-17 external source link was unidentified | Fixed: the source link identifies GitHub as external. |

`verification-2.md` recorded a prior PASS with no open finding; this check found no regression from that accepted state.

## Remaining validation work

There are no release findings. The brief's success measure still needs consented trials with real BGG exports and user-controlled imports into services whose conventions may change. That is product validation, not a defect in this verified static converter.
