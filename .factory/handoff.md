# Shelf Bridge repair handoff — perfection loop 1

Work order: `bgg-import-normalizer-polish-1`  
Repair commit: `cb8ef28b0a25477a0768987b9c13e50ab40ecb2a`  
Base review: `2803a4149954a8ab8c3828ef7ef6584134ff812d`  
Completed: 2026-08-28

## What changed

- Replaced the metaphorical first-screen copy with **Convert a BGG collection CSV**, an audience sentence, and a visible mobile-safe sample action.
- Added direct `/demo` and `?demo=1` sandbox entry. It immediately loads Catan, Gloomhaven, and Terraforming Mars, uses only `demo:shelf-bridge:sample` session storage, and has persistent Reset demo and Start for real controls.
- Added `.factory/claims.json`, eight tagged observable Playwright claim tests, `.factory/demo.md`, and `.factory/copy-audit.md`.
- Added real SPA route rendering for Demo, Privacy, Terms, and a product-styled not-found page. Route changes and history navigation now update title/metadata, focus the page h1, and announce the route.
- Added canonical, Open Graph, Twitter, favicon/Apple touch metadata, route-specific titles, a 1200×630 original-art social image, `/demo` sitemap entry, and expanded static fallback exclusions.
- Preserved the handwritten collector-notebook visual system while tightening mobile spacing; the first-screen sample action is within the 390×844 viewport.
- Updated README, catalog description, service-worker cache, and footer legal/build links. The artifact remains Vite + vanilla TypeScript, static output in `dist/`.

## Exact clean-clone evidence

Fresh clone: `/tmp/shelf-bridge-clean` at `cb8ef28`.

```sh
npm ci --include=dev             # pass; 65 packages, 0 vulnerabilities
npm test                         # pass; 8/8
npm run build                    # pass; dist/index.html created
npm run test:browser             # pass; 11/11 Playwright route/demo/mobile/privacy/offline tests
npm run preview -- --port 4173
npm run test:a11y                # pass; Axe 0 violations across 5 states
npm audit --omit=dev             # pass; 0 vulnerabilities
```

Every declared claim command also passed independently from that clean clone:

```sh
npm run test:claims -- --grep @claim:demo-isolation
npm run test:claims -- --grep @claim:local-processing
npm run test:claims -- --grep @claim:offline-reload
npm run test:claims -- --grep @claim:downloads
npm run test:claims -- --grep @claim:file-size-limit
npm run test:claims -- --grep @claim:status-review
npm run test:claims -- --grep @claim:keyboard-operation
npm run test:claims -- --grep @claim:in-memory-clearing
```

All eight passed. Their observable evidence is encoded in `tests/claims.spec.mjs`: direct demo storage/reset/start-real, same-origin interception during download, service-worker offline reload, four output contents, a 20 MB plus one byte rejection, preserved simultaneous statuses, keyboard operation, and real-file clearing/reload.

Lighthouse on local production `/demo` scored **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. Lab metrics: FCP 0.9 s, LCP 1.4 s, CLS 0. Build output is 28.26 KB JavaScript (10.14 KB gzip) and 15.90 KB CSS (4.46 KB gzip), below the static-product budgets. Accessibility smoke testing exercised skip-link focus, demo screen, populated mobile and desktop states, keyboard mapping focus, export guard, download, legal pages, and offline state with no console errors.

## Privacy and known limits

The browser claim test intercepted only same-origin requests during the demo download flow. No remote fonts, analytics, third-party scripts, or collection upload were added. Demo sample state is isolated to the `demo:` session namespace; real working data remains page memory only.

No blocking findings from `review-1.md` remain. The known product limitation is unchanged: Yamtrack and NeoDB import conventions can change, so users should review profile CSVs before importing.

## Deploy and live verification

`/opt/fleet/lib/deploy-static.sh bgg-import-normalizer /work/repo/dist` deployed the repair on 2026-08-28 to `sf-bgg-import-normalizer` in `eastus2`. The product host is serving the repaired `index-BfCE_a7K.js`; its SHA-256 matches the local `dist` artifact:

```text
28d2727b529ce1e33d266dce33b3a95843370fcf5f67918a73045d0c53ca4d02
```

Live `https://bgg-import-normalizer.sociobot.in/demo` returned 200 with HSTS, the same-origin CSP, no-referrer policy, nosniff, and denied camera/microphone/geolocation permissions. Live sitemap includes `/`, `/demo`, `/privacy`, and `/terms`.

The production `SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:a11y` pass reported Axe 0 violations across five states and no browser errors. It covered skip focus, direct demo, status guard, JSON download, legal pages, and cached offline reload against the live deployment.
