# Shelf Bridge

Convert a BGG collection CSV into reviewable files before importing it into another tracker.

Shelf Bridge is for board-game collectors changing trackers. It lets you review BGG statuses before downloading files.

Open the three-game sample: <https://bgg-import-normalizer.sociobot.in/demo>

## What it does

- Maps each active BGG status to a neutral status. (`status-mapping`)
- Keeps multiple active BGG statuses visible for review. (`status-review`)
- Lets you change a primary status without removing other BGG statuses. (`status-edit-preserves-secondary`)
- Keeps the first duplicate or keeps all copies for review. (`duplicate-handling`)
- Downloads normalized CSV, JSON, Yamtrack CSV, and NeoDB-style CSV. (`downloads`)
- Accepts CSV files up to 20 MB. (`file-size-limit`)
- Processes your CSV in this browser and does not upload it. (`local-processing`)
- Works offline after a first visit. (`offline-reload`)
- Is free to use. (`free-to-use`)
- Works with a keyboard. (`keyboard-operation`)
- Clears a real working collection when you clear or reload the page. (`in-memory-clearing`)

The demo loads four rows for Catan, Gloomhaven, and Terraforming Mars. The demo keeps its sample separate and removes it when you choose **Use my BGG CSV**. (`demo-isolation`)

See [privacy](/privacy) and [terms](/terms) in the running app. Shelf Bridge is independent and not endorsed by BoardGameGeek, Yamtrack, or NeoDB.

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

## Verify

```sh
npm test
npm run build
npm run test:browser
```

After deployment, check the intentional 404 response:

```sh
SHELF_BRIDGE_URL=https://bgg-import-normalizer.sociobot.in npm run test:live
```

Run every declared claim from a clean build:

```sh
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
```

`npm run build` produces `dist/` with `dist/index.html` at its root for Azure Static Web Apps. For the standalone accessibility smoke test, start `npm run preview -- --port 4173`, then run `npm run test:a11y`.

## Project files

- Product scope: [.factory/brief.json](.factory/brief.json)
- Demo contract: [.factory/demo.md](.factory/demo.md)
- Claims and tests: [.factory/claims.json](.factory/claims.json)
- Visual system and image provenance: [.factory/design.md](.factory/design.md)
- License: [MIT](LICENSE)
