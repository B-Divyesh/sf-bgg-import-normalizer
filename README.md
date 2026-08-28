# Shelf Bridge

Convert a BGG collection CSV into reviewable files before importing it into another tracker.

Shelf Bridge is for board-game collectors changing trackers. It lets you review BGG statuses before downloading files.

Try it now: <https://bgg-import-normalizer.sociobot.in/demo>

## What it does

- Keeps multiple active BGG states visible for review. (`status-review`)
- Downloads normalized CSV, JSON, Yamtrack profile CSV, and NeoDB-style profile CSV. (`downloads`)
- Accepts CSV files up to 20 MB. (`file-size-limit`)
- Processes your CSV in this browser and does not upload it. (`local-processing`)
- Works offline after a first visit. (`offline-reload`)
- Uses native controls that work with a keyboard. (`keyboard-operation`)
- Clears a real working collection when you clear or reload the page. (`in-memory-clearing`)

The demo loads Catan, Gloomhaven, and Terraforming Mars. It uses separate `demo:` browser-session storage and clears when you choose **Start for real**. (`demo-isolation`)

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
