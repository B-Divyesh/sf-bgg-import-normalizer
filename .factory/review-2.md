# Shelf Bridge adversarial first-read review 2 — FAIL

Reviewed 2026-08-28 against <https://bgg-import-normalizer.sociobot.in> in fresh Chromium contexts at 390×844 and 1366×900, and against a fresh clone of `715fe79963e251ec25a9447941bc6e5fcbbef93e`.

## First screen, before scrolling

My cold reading was: **this converts a BoardGameGeek collection CSV into files for another tracker; it is for board-game collectors changing trackers; I should click “Try it with sample data.”** Both viewports answer all three questions. On mobile, the action occupied `y=320–366` in an 844 px viewport. The exact text that worked was:

- **“Convert a BGG collection CSV”**
- **“For board-game collectors changing trackers”**
- **“Try it with sample data”** with **“Loads three BGG games for review.”**

The first screen still omits the required three plain facts about privacy, offline use, and price; see F-2-8.

## Verdict

**FAIL.** The demo can silently destroy a loaded real collection, its first post-click viewport does not expose realistic row content, and the designed not-found screen is served as HTTP 200. There are also four unlisted-claim groups and nine copy/structure findings. A PASS requires zero findings and complete claim coverage.

## Findings, ordered by severity

### F-2-1 — BLOCKING — Demo navigation silently discards real work

- **Exact location:** Header **“Demo”** link after a real CSV has been loaded; `src/main.ts:92-94`.
- **Evidence:** In a fresh live context I loaded `real.csv`, confirmed **“Real Collection Game”** was present, clicked **“Demo”**, then used browser Back. The converter returned to the empty **“Add your BGG export”** state and the real row was gone. `startDemo()` and `leaveDemo()` both call `clearWorkingState()` on the one shared application state.
- **Why this fails:** Demo mode is not harmless to real working data. The visitor receives no warning that opening a header link will destroy the collection they were reviewing. This reopens the unnumbered review-1 finding **“No usable isolated demo entry point”** as a half-fix.
- **Concrete fix:** Keep independent real and demo state objects. Entering `/demo` must not mutate real state; Back or **“Use my BGG CSV”** must restore it. If preserving in-memory real state is intentionally impossible, confirm before discarding it. Extend `@claim:demo-isolation` to load a real CSV, enter and leave the demo, and assert that the real row and mappings survive.

### F-2-2 — BLOCKING — The designed 404 is a soft 404

- **Exact location:** `https://bgg-import-normalizer.sociobot.in/missing-route`; `public/staticwebapp.config.json:1-17`.
- **Evidence:** The route renders **“Page not found”** but returns HTTP **200**. The static-host config has only `navigationFallback`; it has no `responseOverrides` 404 rewrite and the build has no `404.html`.
- **Why this fails:** Browsers show the right artwork, but crawlers, monitors, and link checkers are told the missing URL succeeded. This is still broken routing and reopens the unnumbered review-1 finding **“`/demo` is not a route and an unknown URL silently becomes the converter”** as a half-fix.
- **Concrete fix:** Produce a styled `404.html` and add the required Azure Static Web Apps `responseOverrides: {"404":{"rewrite":"/404.html"}}`. Add a deployed test that asserts both the 404 status and the Shelf Bridge not-found content.

### F-2-3 — BLOCKING — The first demo viewport does not show the realistic sample

- **Exact location:** `/demo` at 390×844 and 1366×900 immediately after **“Try it with sample data.”**
- **Evidence:** Mobile shows the banner, repeats the full landing hero and sample CTA, then shows only `shelf-bridge-sample.csv`, **“3 rows · 306 B”**, and the **“Choose status rules”** heading at `y=813`. Zero sample rows are visible. Desktop reaches the receipt and top of the mapping panel, but no named game row. The three game names require scrolling. All three seeded rows are **Ready**, with **0** needing review and **“No duplicates found.”**
- **Why this fails:** The first screen after the click does not visibly demonstrate a mapped game, a changed output, or a review problem. The seed also skips the brief’s duplicate-review behavior, so the demo does not immediately show the product’s central value.
- **Concrete fix:** On `/demo`, collapse the repeated hero and place a compact before/after preview above the fold with at least one named game, its source statuses, and its output status. Seed a duplicate or unresolved status so the review counter and duplicate policy can be tried immediately. Keep all existing banner controls.

### F-2-4 — HIGH — Duplicate-handling promises are unlisted claims

- **Exact quotes:** **“Keep the first; mark later rows excluded”** and **“Keep all; mark every copy for review”** on `/demo`.
- **Why this fails:** `.factory/claims.json` has no duplicate-handling claim, and the demo has no duplicate with which to verify either behavior. A visitor can rely on these promises, and duplicate validation is part of the brief.
- **Concrete fix:** Add a `duplicate-handling` claim and tagged test that uses a duplicate in the shipped demo, changes both policies, and asserts inclusion and review markers. Alternatively remove the promises and control.

### F-2-5 — HIGH — The status-mapping promise is unlisted

- **Exact quotes:** **“Each BGG flag maps to a neutral status.”** and **“Every active status has a destination.”** on `/demo`.
- **Why this fails:** `status-review` proves two simultaneous statuses remain visible for one sample row. It does not list or prove that every recognized BGG flag maps to an output status.
- **Concrete fix:** Add a `status-mapping` claim and demo test covering every enabled source flag and the export guard, or narrow the copy to the specifically tested behavior.

### F-2-6 — HIGH — The row-edit preservation promise is unlisted

- **Exact quote:** **“Change a primary status without removing other statuses.”** on `/demo`.
- **Why this fails:** The existing `status-review` test observes Wishlist plus Want To Play but never changes the primary status and confirms that the secondary status survives.
- **Concrete fix:** Add a `status-edit-preserves-secondary` claim and test that changes Terraforming Mars’s primary status, downloads an output, and checks both original statuses remain.

### F-2-7 — HIGH — Destination transformation details are unlisted and untested

- **Exact quotes:** **“Yamtrack keeps the primary neutral status in a `status` column.”** **“The NeoDB-style profile maps owned and past-owned games to `complete`.”** **“Both keep `source_statuses`.”**
- **Why this fails:** The `downloads` test checks a header marker and row count for each file. It does not assert these three transformations, and none appears as a claim in `.factory/claims.json`.
- **Concrete fix:** Add these guarantees to the `downloads` claim text and assert the `status`, `complete`, and `source_statuses` values for known sample rows, or remove the detailed copy.

### F-2-8 — MEDIUM — The first screen lacks the three required plain facts

- **Exact location:** Mobile and desktop hero after **“Loads three BGG games for review.”**
- **Evidence:** No short privacy, offline, or price facts appear in the first viewport. The privacy sentence begins below the mobile fold; offline use is visible only when offline or in README; the live landing page never says the product is free.
- **Why this fails:** A visitor can identify the job and first action but cannot resolve the basic trust and cost questions within the promised five-second screen.
- **Concrete fix:** Add three short, visible lines beside the primary action: **“Free to use.” “Your CSV is not uploaded.” “Works offline after your first visit.”** Register and test any newly introduced claim.

### F-2-9 — LOW — “Start for real” does not name its result

- **Exact quote/location:** **“Start for real”**, demo banner button and README.
- **Why this fails:** “Real” does not say that the action discards the sample and opens the CSV chooser.
- **Concrete fix:** Rename it **“Use my BGG CSV”** and retain adjacent text that says the sample will be discarded.

### F-2-10 — LOW — Download buttons are nouns, not result-naming verbs

- **Exact quotes/location:** **“Normalized CSV”**, **“Normalized JSON”**, **“Yamtrack profile”**, and **“NeoDB-style profile”** on `/demo`.
- **Why this fails:** The labels name formats but not the result of activation.
- **Concrete fix:** Use **“Download normalized CSV”**, **“Download normalized JSON”**, **“Download Yamtrack CSV”**, and **“Download NeoDB-style CSV.”**

### F-2-11 — LOW — Filter buttons do not name their action

- **Exact quotes/location:** **“All”**, **“Review”**, **“Ready”**, and **“Excluded”** in the demo review filter.
- **Why this fails:** In isolation, the button names can sound like states rather than row filters.
- **Concrete fix:** Use **“Show all”**, **“Show issues”**, **“Show ready”**, and **“Show excluded.”**

### F-2-12 — LOW — “Status” and “state” are inconsistent names for one concept

- **Exact locations:** Landing **“Review every status”**, **“Keep multiple BGG states visible”**; demo **“CSV with source states”**; README **“BGG statuses”** and **“BGG states.”**
- **Why this fails:** A first-time visitor must infer that state and status mean the same imported BGG flag.
- **Concrete fix:** Use **“BGG status”** everywhere, including **“Keep multiple BGG statuses visible”** and **“CSV with source statuses.”**

### F-2-13 — LOW — README uses implementation jargon for keyboard support

- **Exact quote:** **“Uses native controls that work with a keyboard.”**
- **Why this fails:** “Native controls” describes implementation, not the visitor’s result.
- **Concrete fix:** **“Works with a keyboard.”**

### F-2-14 — LOW — README exposes storage jargon in visitor copy

- **Exact quote:** **“It uses separate `demo:` browser-session storage and clears when you choose Start for real.”**
- **Why this fails:** A first-time user should not need to understand storage namespaces, and the action is vague.
- **Concrete fix:** **“The demo keeps its sample separate and removes it when you choose Use my BGG CSV.”** Keep the namespace detail in `.factory/demo.md`.

### F-2-15 — LOW — README’s demo link is vague

- **Exact quote:** **“Try it now:”**
- **Why this fails:** The link does not name the sample result.
- **Concrete fix:** **“Open the three-game sample:”**

### F-2-16 — LOW — The footer uses internal production jargon

- **Exact quote:** **“Notebook illustration generated for Shelf Bridge with the factory image model.”**
- **Why this fails:** “Factory image model” has no meaning for a visitor and reads like an internal implementation note.
- **Concrete fix:** **“Original notebook illustration made for Shelf Bridge.”** Keep full model provenance in `.factory/design.md`.

### F-2-17 — LOW — The external source link is not identified as external

- **Exact quote/location:** Footer link **“Source code”**, which goes to GitHub.
- **Why this fails:** The standard structure requires external links to say so; the label gives no destination or external-site cue.
- **Concrete fix:** Rename it **“Source code on GitHub (external)”** or add equivalent visible and accessible text.

## Copy audit

Counts split on whitespace; hyphenated words and URLs count as one. `F` refers to a finding above. No sentence exceeds 22 words, and no banned marketing adjective appears.

### Landing page sentences, headings, labels, actions, and alt text

| Copy | Words | Result |
| --- | ---: | --- |
| For board-game collectors changing trackers | 5 | Clear audience line |
| Convert a BGG collection CSV | 5 | Clear h1 |
| Review every status before you download files for another tracker. | 10 | Clear |
| Try it with sample data | 5 | Clear action; appears twice |
| Loads three BGG games for review. | 6 | Clear; appears twice |
| Add export | 2 | Clear step label |
| Choose status rules | 3 | Clear step label |
| Review games | 2 | Clear step label |
| Download files | 2 | Clear step label |
| Field note 01 | 3 | Decorative section label |
| Add your BGG export | 4 | Clear h2 |
| In BoardGameGeek, open My Collection → Download, then choose the CSV here. | 12 | Clear |
| CSV files up to 20 MB. | 6 | Listed claim: `file-size-limit` |
| Choose BGG CSV | 3 | Clear action |
| Your CSV is processed in this browser. | 7 | Listed claim: `local-processing`; appears twice |
| Blank catalogue cards crossing a small green cardboard bridge on an open collector’s notebook. | 14 | Clear alt text |
| One CSV. | 2 | Clear |
| Reviewable status rules. | 3 | Clear |
| Downloadable files. | 2 | Clear |
| Read your CSV | 3 | Clear |
| Process it in this browser | 5 | Listed claim: `local-processing` |
| Review each status | 3 | Clear |
| Keep multiple BGG states visible | 5 | Inconsistent term: F-2-12 |
| Use CSV or JSON outputs | 5 | Listed claim: `downloads` |
| What stays on this page | 5 | Clear h2 |
| The converter does not upload it. | 6 | Listed claim: `local-processing` |
| Review BGG collection fields before export. | 6 | Clear footer line |
| Built by Param Factory · Build 2026.08.28-r1 | 7 | Clear provenance/build line |
| Notebook illustration generated for Shelf Bridge with the factory image model. | 11 | Jargon: F-2-16 |

Navigation labels **Shelf Bridge**, **Converter**, **Demo**, **Privacy**, and **Terms** are clear internal links. **“Source code”** lacks an external cue (F-2-17). The heading outline makes sense out of context. Landing actions **“Try it with sample data”** and **“Choose BGG CSV”** name their results.

### README sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Convert a BGG collection CSV into reviewable files before importing it into another tracker. | 14 | Clear |
| Shelf Bridge is for board-game collectors changing trackers. | 8 | Clear |
| It lets you review BGG statuses before downloading files. | 9 | Clear |
| Try it now: [demo URL] | 4 | Vague link: F-2-15 |
| Keeps multiple active BGG states visible for review. | 8 | Inconsistent term: F-2-12; listed claim `status-review` |
| Downloads normalized CSV, JSON, Yamtrack profile CSV, and NeoDB-style profile CSV. | 11 | Listed claim: `downloads` |
| Accepts CSV files up to 20 MB. | 7 | Listed claim: `file-size-limit` |
| Processes your CSV in this browser and does not upload it. | 11 | Listed claim: `local-processing` |
| Works offline after a first visit. | 6 | Listed claim: `offline-reload` |
| Uses native controls that work with a keyboard. | 8 | Jargon: F-2-13; listed claim `keyboard-operation` |
| Clears a real working collection when you clear or reload the page. | 12 | Listed claim: `in-memory-clearing` |
| The demo loads Catan, Gloomhaven, and Terraforming Mars. | 8 | Listed claim: `demo-isolation` |
| It uses separate `demo:` browser-session storage and clears when you choose Start for real. | 14 | Jargon/action: F-2-9 and F-2-14; listed claim `demo-isolation` |
| See privacy and terms in the running app. | 8 | Clear |
| Shelf Bridge is independent and not endorsed by BoardGameGeek, Yamtrack, or NeoDB. | 12 | Clear legal statement |
| Requires Node.js 20 or newer. | 5 | Clear developer requirement |
| Open the shown local URL and either select a BGG collection export or use the built-in three-game sample. | 18 | Clear |
| Run every declared claim from a clean build. | 8 | Clear developer instruction |
| `npm run build` produces `dist/` with `dist/index.html` at its root for Azure Static Web Apps. | 15 | Clear developer instruction |
| For the standalone accessibility smoke test, start `npm run preview -- --port 4173`, then run `npm run test:a11y`. | 18 | Clear developer instruction |

README headings **Shelf Bridge**, **What it does**, **Develop**, **Verify**, and **Project files** all make sense out of context. Project-file list labels are descriptive. No landing or README sentence exceeds the 22-word hard cap.

### Demo-only controls and claim copy

The demo action audit produced F-2-9 through F-2-11. **“Reset demo”** is a clear result-naming verb. The unlisted live claims are recorded individually in F-2-4 through F-2-7.

## Demo and sandbox exercise

| Check | Result |
| --- | --- |
| One-click path | Pass: the first-screen link opens `/demo` in one click. |
| Realistic data immediately visible | **Fail:** zero game rows or names are in either first viewport; see F-2-3. |
| Demo banner | Pass: **“Demo — sample data, nothing is saved.”** remains in the demo DOM. |
| Reset | Pass: restores three rows and the `demo:shelf-bridge:sample` key. |
| Start for real | Pass for clearing demo state and returning to `/`; label fails plain words. |
| Separate namespace | Pass for sample persistence: localStorage is empty and sessionStorage contains only `demo:shelf-bridge:sample`. |
| Real data untouched | **Fail:** entering demo from a loaded real collection deletes that in-memory collection; see F-2-1. |
| Request log | Pass: the complete live exercise contacted only `https://bgg-import-normalizer.sociobot.in`. |
| Offline | Pass: the declared test reloads the populated demo offline after service-worker readiness. |

## Claim test results

Every command below was run independently from fresh clone `/tmp/shelf-bridge-review2.z1cSU9` at the reviewed commit.

| Claim | Command result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | PASS | Three rows, banner, `demo:` session key, Reset, Start for real cleanup |
| `local-processing` | PASS | Request origins equal only the product origin during demo download |
| `offline-reload` | PASS | Offline reload retains the banner and three review rows |
| `downloads` | PASS | Four downloads have expected header/schema markers and three records |
| `file-size-limit` | PASS | 20 MiB plus one byte produces the visible over-limit error |
| `status-review` | PASS | Terraforming Mars retains Wishlist plus Want To Play |
| `keyboard-operation` | PASS | Keyboard changes a mapping, observes export guard, and downloads JSON |
| `in-memory-clearing` | PASS | A real CSV clears by command and remains absent after reload |

The commands themselves did not fail. F-2-4 through F-2-7 are separate, unlisted claim findings.

## Earlier finding audit

`review-1.md` contains unnumbered findings, so the original headings are preserved below rather than inventing old IDs.

| Earlier finding | Live and code confirmation | Round-2 result |
| --- | --- | --- |
| No usable isolated demo entry point | `/demo` loads rows, banner, reset/start controls, and a `demo:` key; shared state still deletes real work | **Half-fixed; BLOCKING again in F-2-1** |
| Claims contract is absent | Registry exists and all eight commands pass; four visible demo promises remain unlisted | Fixed as originally scoped; new findings F-2-4–F-2-7 |
| `/demo` is not a route and unknown URL becomes converter | `/demo` works and unknown path renders designed copy; unknown path still returns 200 | **Half-fixed; BLOCKING again in F-2-2** |
| Route changes leave focus on BODY and retain title | Live Privacy navigation and Back focus the h1, update title, and announce both routes | Fixed |
| Required metadata missing | All five routes have description, canonical, OG, Twitter, favicon, and 180px Apple icon; social image is 1200×630 | Fixed |
| Main headline and labels use metaphors | **“Convert a BGG collection CSV”** and revised step headings are direct | Fixed |
| First-screen try action weak/below mobile fold | Exact action is visible at `y=320–366` on 390×844 and has adjacent outcome text | Fixed |

No `.factory/polish-*.md` exists. The current `.factory/handoff.md` and `verification-2.md` were also read; their previously recorded passing checks were rerun rather than accepted on trust.

## Structure, accessibility, and crawl

| Check | Result |
| --- | --- |
| Titles | Pass: route-specific patterns and all under 60 characters |
| Semantic skeleton | Pass: `lang=en`, one h1 and one main on each tested route, ordered headings, skip link, consistent header/footer |
| Metadata | Pass: descriptions, canonical, OG/Twitter, SVG favicon, 180×180 Apple icon, 1200×630 social image |
| 404 | **Fail:** designed UI but HTTP 200; F-2-2 |
| Deep links/history/focus | Pass: direct routes render; Privacy and Back focus h1 and update the live region |
| Dead links | Pass: `/`, `/demo`, `/privacy`, `/terms`, assets, robots, sitemap, and GitHub source return 200; skip link works. External labeling fails in F-2-17. |
| Accessibility | Pass: live Playwright axe run reports 0 violations across five states; no browser/page errors |
| Reduced motion and keyboard | Pass in the existing browser smoke suite and tagged keyboard claim |
| Visual identity | Pass: ruled paper, taped notebook panels, handwritten accents, original bridge still-life, and rust/forest marks are product-specific rather than a generic SaaS template |
| JavaScript budget | Pass: production JS is 28.26 KB, 10.14 KB gzip |

## Missed leverage

No AI feature is warranted: deterministic CSV parsing, mapping, and local privacy are the job, and a model would add cost and uncertainty. Direct service sync is not implied because the brief calls for target-neutral files and local processing. Import/export already exists. The obvious missed leverage is demonstrating duplicate and review behavior inside the shipped demo; that is included in F-2-3 and F-2-4 rather than proposed as a separate feature.

## Verification commands

From the fresh clone:

```sh
npm ci --include=dev
npm run test:claims -- --grep @claim:demo-isolation
npm run test:claims -- --grep @claim:local-processing
npm run test:claims -- --grep @claim:offline-reload
npm run test:claims -- --grep @claim:downloads
npm run test:claims -- --grep @claim:file-size-limit
npm run test:claims -- --grep @claim:status-review
npm run test:claims -- --grep @claim:keyboard-operation
npm run test:claims -- --grep @claim:in-memory-clearing
npm test
npm run build
npm run test:browser
SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:a11y
```

Results: 8/8 unit tests, 11/11 browser tests, all eight isolated claim commands, build, and live axe checks passed. `dist/` was produced.

## What would make this perfect

Nothing should remain after the next repair: preserve loaded real work across demo navigation; put named, imperfect sample rows above the fold; exercise duplicates in the demo; return a real HTTP 404; register and test every visible mapping/edit/export-detail claim; add the three first-screen trust facts; and apply every exact copy/control/link rewrite in F-2-9 through F-2-17. Then rerun the full cold-read, claim, storage, request-log, route, crawl, mobile, keyboard, and accessibility checks from scratch.
