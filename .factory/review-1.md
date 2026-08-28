# Shelf Bridge adversarial first-read review 1 — FAIL

Reviewed 2026-08-28 against <https://bgg-import-normalizer.sociobot.in> in fresh Chromium contexts at 390×844 and 1366×900, plus a fresh local clone of `463d167bb68b1fbd0502baef36c6c72d68f0e264`.

## First screen, before scrolling

My cold reading was: **this converts a BoardGameGeek collection CSV into a checked record for importing into another tracker; it is for board-game collectors; I should click “Choose BGG CSV”.** The supporting eyebrow, lead, and visible file action make all three answers available on both sizes.

The headline itself fails the plain-words test: **“Carry your shelf without dropping a state.”** It does not say CSV conversion, BoardGameGeek, or import. On the 390px first screen, the sample action is below the fold; only the real-file chooser is visible. The notebook treatment is distinct and product-specific, not a generic SaaS template.

## Verdict

**FAIL.** There are three BLOCKING findings: no compliant demo sandbox, no claims registry or claim tests, and broken route semantics/no designed 404. The missing plain-language headline and route metadata are additional first-read failures.

## Findings, ordered by severity

### BLOCKING — No usable isolated demo entry point

- **Evidence:** The one-click button is **“Try a 3-game sample instead”** (below the 390px first fold). It loads Catan, Gloomhaven, and Terraforming Mars directly into the normal converter state. That next screen does show realistic rows and mapping controls, but it has no **“Demo — sample data, nothing is saved”** banner, no **“Reset demo”**, and no **“Start for real”** action.
- **Direct-entry check:** `/?demo=1` and `/demo` both returned the empty normal importer; neither loaded sample data or indicated demo mode.
- **Isolation check:** Before and after the sample, localStorage, sessionStorage, and IndexedDB were empty, but the sample uses the same in-memory `state` object as a real import. No `demo:` namespace or separate demo state exists, and there is no documented `.factory/demo.md`.
- **Why this loses or misleads a first-time visitor:** A visitor cannot try the product from a shareable demo URL or know whether the loaded example is safely separate from a real import. “Clear this file” is not a demo reset and does not communicate the guarantee.
- **Concrete fix:** Add `/demo` (and `?demo=1`) that immediately displays the three-row sample and a persistent banner: **“Demo — sample data, nothing is saved.”** Include **“Reset demo”** and **“Start for real”**. Keep demo data in a distinct `demo:` namespace/state, document it in `.factory/demo.md`, and make the first-screen button **“Try it with sample data”** with the adjacent result text **“See three mapped BGG games.”** Add browser tests for direct entry, reset, isolation, and leaving demo.

### BLOCKING — Claims contract is absent; claim-like copy is unlisted and untested

- **Evidence:** `.factory/claims.json` does not exist. `rg '@claim:|claims.json'` found no claim tags or registry. There were therefore no listed claim commands to run from the clean clone.
- **What did pass, but is not claim evidence:** `npm ci`, `npm test` (8/8), `npm run build`, and `npm run test:a11y` passed. An intercepted fresh browser flow made only same-origin requests; after a successful online load, an offline reload could load and use the sample. Those observations do not satisfy the required per-claim registry/tests.
- **Why this loses or misleads a first-time visitor:** Visitors are asked to rely on local processing, no uploads, privacy, offline use, exports, and size limits without a traceable proof contract. The README repeats those promises.
- **Concrete fix:** Create `.factory/claims.json`; list each retained promise below with one `@claim:<id>` observable test from a fresh demo context. At minimum cover local/no-upload network interception, offline-after-first-visit, each export download, 20 MB rejection, keyboard operation, and in-memory clearing. Remove claims that cannot be tested. The sentence audit marks unlisted claims as `U`.

### BLOCKING — `/demo` is not a route and an unknown URL silently becomes the converter

- **Evidence:** `/demo` returned HTTP 200 with the home h1, rather than a demo. `/missing-route` also returned HTTP 200 with **“Carry your shelf without dropping a state.”** rather than a designed 404. The SPA only recognizes `/privacy` and `/terms`.
- **Why this loses or misleads a first-time visitor:** A shared demo link does not do what it says, and a mistyped or stale link appears successful while showing unrelated content. This is broken routing under the site contract.
- **Concrete fix:** Recognize `/demo`; render a product-styled 404 for unknown paths with an explicit **“Return to converter”** link and a distinct 404 title. Add browser tests for direct `/demo`, reload, unknown route, and back/forward.

### HIGH — Route changes leave focus on `BODY` and retain the landing title

- **Evidence:** Clicking Privacy changed the URL and h1, but produced `{ focus: "BODY#", title: "Shelf Bridge — BGG collection import normalizer", live: [""] }`. Browser Back also left focus on `BODY`. Direct `/privacy` and `/terms` use the same landing title.
- **Quote:** Privacy h1: **“Your collection stays yours.”**; Terms h1: **“A bridge, not a guarantee.”**
- **Why this loses or misleads a first-time visitor:** Keyboard and screen-reader users receive neither focus nor a route announcement. The title does not confirm that Privacy or Terms opened; the legal-page headings are metaphors rather than page-purpose headings.
- **Concrete fix:** On every `navigate` and `popstate`, set the route-specific title (for example **“Privacy — Shelf Bridge”**), focus the new `<h1>`/main, and announce the route via the live region. Use legal h1s **“Privacy for Shelf Bridge”** and **“Terms for Shelf Bridge.”** Add an exact forward/back focus-and-announcement test.

### HIGH — Required metadata is missing on every tested route

- **Evidence:** `/`, `/privacy`, and `/terms` each had a meta description and SVG favicon, but no canonical link, Open Graph fields, Twitter card fields, or Apple touch icon. The Privacy and Terms titles do not follow the required per-route pattern.
- **Why this loses or misleads a first-time visitor:** Shared links have no product artwork or route-specific context, and duplicate/canonical identity is undefined.
- **Concrete fix:** Add per-route canonical, title, description, OG and Twitter metadata plus a real 1200×630 Shelf Bridge image and 180px Apple touch icon. Test the complete metadata set for all routes.

### MEDIUM — The main headline and several labels use metaphors or undefined product terms

- **Quote:** **“Carry your shelf without dropping a state.”**
- **Why this loses or misleads a first-time visitor:** It only makes sense after reading the paragraph, and “state,” “translation bench,” “crossing,” “mappings,” “target-neutral,” and “destination” are not defined in a 30-second phone scan.
- **Concrete fix:** Use h1 **“Convert a BGG collection CSV”** and lead **“For board-game collectors moving to another tracker, review every status before you export.”** Rename **“Set the crossing rules”** to **“Choose status rules”**, **“Review the crossing”** to **“Review your games”**, and **“Take the clean copy”** to **“Download your files.”**

### MEDIUM — The first-screen try action is weakly named and below the mobile fold

- **Quote:** **“Try a 3-game sample instead”**
- **Why this loses or misleads a first-time visitor:** The action says “instead,” without saying what will appear. It is not visible in the initial 390px screen, so a visitor sees only an upload requirement.
- **Concrete fix:** Place the primary demo button beside the file chooser in the first mobile screen: **“Try it with sample data”**. Add **“Loads three BGG games for review.”**

## Copy audit

Word counts treat hyphenated/slash terms as one word. `U` means an unlisted visitor-facing claim because no claims registry exists. `J` means jargon/metaphor/marketing language. `L` means over the 22-word hard limit. Each flagged row maps to the concrete fixes above: `U` → add the stated claim and `@claim` test or remove it; `J` → use the plain rewrite in the Medium finding; `L` → split at the semicolon.

### Landing page sentences and text fragments

| Copy | Words | Flag |
| --- | ---: | --- |
| A local translation bench for board-game collectors | 7 | J |
| Carry your shelf without dropping a state. | 7 | J |
| Turn a BoardGameGeek collection CSV into one clean, reviewable record—then take it to Yamtrack, NeoDB, or your next tracker. | 19 | U, J |
| In BoardGameGeek, open My Collection → Download, then bring the CSV here. | 11 | — |
| Up to 20 MB. | 4 | U |
| Choose BGG CSV | 3 | — |
| or drop it onto this page | 6 | — |
| Private by default: parsing and conversion happen only in this browser. | 11 | U |
| Try a 3-game sample instead | 5 | J (button) |
| One source. | 2 | J |
| Clear mappings. | 2 | J |
| More than one destination. | 5 | J |
| Read locally | 2 | U, J |
| No upload or account | 5 | U |
| Keep every state | 3 | U, J |
| Flags stay visible | 3 | U |
| Export twice | 2 | U |
| Reuse one normalized file | 5 | U, J |
| Designed to leave no trace | 5 | J |
| No uploads, accounts, cookies, or game-art copies. | 6 | U |
| Close the tab and your working collection is gone. | 10 | U |
| Built for careful collectors. | 4 | J |
| Local-only, open-source, and free. | 5 | U, J |
| Notebook illustration generated for Shelf Bridge with the factory image model. | 11 | U |

Headings checked separately: **“Add your BGG export”** is clear; **“Field note 01”** and the numbered step labels make sense only with the visual notebook motif, not in a screen-reader heading list.

### README sentences

| Copy | Words | Flag |
| --- | ---: | --- |
| Shelf Bridge turns a BoardGameGeek collection CSV into a reviewable, target-neutral collection, then exports normalized CSV/JSON plus Yamtrack and NeoDB-style CSV profiles. | 22 | U, J |
| It is for board-game collectors changing trackers without silently losing owned, previously owned, wishlist, intent, preorder, or trade states. | 19 | U |
| Reads user-supplied BGG CSV exports entirely in the browser; nothing is uploaded or persisted. | 14 | U |
| Detects BGG `own`, `prevowned`, `wishlist`, `want`, `wanttoplay`, `wanttobuy`, `fortrade`, and `preordered` flags. | 12 | U, J |
| Lets every source flag map to a transparent neutral status. | 10 | U, J |
| Multiple simultaneous states are kept. | 5 | U, J |
| Normalizes a selected rating column from 5-, 10-, or 100-point scales and carries a selected notes column. | 17 | U, J |
| Finds duplicate BGG IDs (or matching title/year when no ID exists) and makes the keep-first/keep-all policy explicit. | 17 | U |
| Shows missing titles, invalid ratings, uncategorized rows, status drops, and duplicates before export. | 11 | U, J |
| Exports normalized CSV, lossless `shelf-bridge/v1` JSON, Yamtrack-profile CSV, and NeoDB-style shelf CSV. | 12 | U, J |
| Works at 390 px, from the keyboard, and offline after the first production visit. | 13 | U |
| The destination profiles deliberately retain a `source_statuses` column. | 7 | U, J |
| Yamtrack and NeoDB import conventions can change, so inspect the profile before importing it. | 14 | J |
| The normalized CSV/JSON are the durable source-of-truth formats. | 9 | U, J |
| There are no accounts, analytics, cookies, third-party scripts, remote fonts, or collection uploads. | 9 | U |
| Imported data lives only in page memory and disappears when the tab reloads or closes. | 15 | U |
| A service worker caches only the application shell and illustration. | 10 | U, J |
| See `/privacy` and `/terms` in the running app. | 8 | — |
| Requires Node.js 20 or newer. | 6 | — |
| Open the shown local URL and either select a BGG collection export or use the built-in three-game sample. | 18 | — |
| `npm run build` is the exact deployment build command. | 9 | — |
| It creates `dist/` with `dist/index.html` at its root for Azure Static Web Apps. | 11 | — |
| For the browser accessibility and download smoke test, start the production preview in one terminal and run the check in another. | 21 | — |
| The accessibility check uses the container Chromium path by default. | 10 | — |
| Elsewhere, set `CHROMIUM_PATH` to a local Chromium executable and optionally set `SHELF_BRIDGE_URL` if the preview is not at `http://127.0.0.1:4173`. | 28 | L |
| The generated illustration can be rebuilt from its reviewed source. | 10 | U |
| Shelf Bridge is independent and is not affiliated with or endorsed by BoardGameGeek, Yamtrack, or NeoDB. | 15 | U |

Proposed rewrite for the one long README sentence: **“Set `CHROMIUM_PATH` to your Chromium executable. Set `SHELF_BRIDGE_URL` when the preview uses another address.”**

## Demo and privacy exercise

| Check | Result |
| --- | --- |
| One-click sample | The click worked and immediately showed Catan, Gloomhaven, Terraforming Mars, status mappings, review rows, and downloads. |
| Direct demo URL | Fail: `/demo` and `?demo=1` opened an empty normal importer. |
| Demo banner/reset/start-real | Fail: none rendered. |
| Separate demo storage | Fail: no demo namespace/state; same in-memory importer state is used. |
| Real browser storage after sample | localStorage/sessionStorage/IndexedDB empty; cache storage contains only `shelf-bridge-v3`. |
| Network interception | Same-origin application requests only; no external origin observed. |
| Offline after cached visit | Pass as an observation: after `setOffline(true)` and reload, the converter and sample worked and showed the offline notice. This remains an unlisted claim until a declared test exists. |

## Structure and crawl checks

| Check | Result |
| --- | --- |
| Landing title, language, one h1, main, description | Pass: title, `lang=en`, one h1, one main, and description found. |
| Per-route title/focus/announcement | Fail: Privacy/Terms retain landing title; forward/back leave focus on BODY; empty live region. |
| Canonical, OG/Twitter, Apple icon | Fail: absent on all tested routes. |
| Favicon | Pass: self-hosted SVG favicon found. |
| Designed 404 | Fail: `/missing-route` returns 200 home content. |
| Sitemap/robots | Pass: robots and sitemap exist; sitemap lists `/`, `/privacy`, `/terms`. |
| Live link crawl | Pass: internal footer/header links returned 200; GitHub source link returned 200. |
| Header/footer | Pass visually and structurally: both include Privacy/Terms. Footer does not contain the required “Built by Param Factory” wording or a version/build id. |
| Visual identity | Pass: the handwritten notebook, bridge mark, paper rules, and original still-life are recognizably specific to this product. |

## Commands and reproducibility

Fresh-clone commands completed:

```sh
git clone /work/repo /tmp/shelf-bridge-review
cd /tmp/shelf-bridge-review
npm ci
npm test                 # 8/8 pass
npm run build            # pass; dist/ produced
npm run preview -- --port 4173
npm run test:a11y        # pass; axe 0 violations
```

There was no `.factory/claims.json`, and therefore no declared claim test command to execute. Browser route, demo, network-interception, storage, offline, screenshot, and link checks were run separately against the live URL in fresh contexts.
