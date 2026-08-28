# Shelf Bridge review 2 handoff

Work order: `bgg-import-normalizer-review-2`<br>
Reviewed commit: `715fe79963e251ec25a9447941bc6e5fcbbef93e`<br>
Completed: 2026-08-28

## What was done

- Performed a cold first-read review of the live product at 390×844 and 1366×900.
- Exercised `/demo`, Reset, Start for real, browser storage, request origins, offline reload, real-file-to-demo navigation, and all downloads.
- Ran every command in `.factory/claims.json` independently from a fresh clone.
- Rechecked all findings in `.factory/review-1.md` on the live site and in source.
- Audited landing and README copy, route metadata, history/focus, crawl targets, 404 behavior, visual identity, accessibility, and missed leverage.
- Wrote the evidence and FAIL verdict to `.factory/review-2.md`. No product code was modified.

## Verification

Fresh clone: `/tmp/shelf-bridge-review2.z1cSU9` at `715fe79`.

```sh
npm ci --include=dev
# all eight npm run test:claims -- --grep @claim:<id> commands
npm test
npm run build
npm run test:browser
SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:a11y
```

All listed claim commands passed. Unit tests passed 8/8, browser tests passed 11/11, the build produced `dist/`, and the live axe suite reported zero violations across five states. Live request logging observed only the Shelf Bridge origin. All crawled intended links returned 200.

## Findings left for repair

The verdict is FAIL with 17 findings. Blocking issues are: demo navigation discards a loaded real collection; the first demo viewport shows no named sample row or result and the seed has no review problem; and unknown routes return HTTP 200. Four groups of visible demo behavior claims are unlisted. The remaining findings cover the missing first-screen trust facts and exact plain-word/control/link rewrites.

See `.factory/review-2.md` for exact evidence, rewrites, and required tests. No deployment was performed.
