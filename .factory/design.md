# Shelf Bridge visual thesis

## Direction: a collector's handwritten lab notebook

Shelf Bridge is a careful translation bench, not a database or dashboard. The interface resembles an open field notebook where a collector has taped in an export, marked uncertain rows in pencil, and drawn a bridge between two catalogues. That makes review—not magic automation—the product's visual center. The paper texture and ruled lines explain provenance and work-in-progress; clipped labels and inspection marks make mappings feel inspectable.

This is a deliberately single-mode, warm-paper treatment. A dark theme would break the physical notebook metaphor and complicate the printed-paper contrast model. The background is explicitly painted in both the browser and application shell.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F4EEDC` | page background |
| `--paper-deep` | `#E8DFC5` | ruled bands / recessed areas |
| `--ink` | `#1F2A24` | primary writing (13.7:1 on paper) |
| `--pencil` | `#5B625A` | secondary writing (5.5:1 on paper) |
| `--forest` | `#245643` | primary action, bridge marks |
| `--forest-dark` | `#173C2E` | pressed action / high-contrast link |
| `--chalk` | `#FFFDF6` | text on forest (8.2:1) |
| `--rust` | `#9D3F2E` | danger and review marks |
| `--ochre` | `#9A681B` | warnings, paired with text/icon |
| `--success` | `#2F6A48` | confirmed mapping |
| `--rule` | `#B7C2B2` | notebook rules and borders |

All informational color is paired with a word, icon, or shape. Focus uses a 3px ochre outline with paper offset.

## Type and spacing

- UI and body: `Aptos`, `Segoe UI`, system sans-serif. It is quiet, sturdy, and requires no font download.
- Notes and display: `Segoe Print`, `Bradley Hand`, `Comic Sans MS`, cursive. Used sparingly for the wordmark, h1, annotations, and counts; the deliberately imperfect line contrasts with the exact data table.
- Scale: 16px body, 18px lead, 20px h3, 25px h2, and fluid 38–58px h1, with 1.5 body leading.
- Spacing follows an 8px rhythm with 4px only inside compact labels. Content width is 1180px; prose is capped at 68 characters.
- On 390px screens, the notebook margin narrows, the hero illustration becomes a quiet header strip, mapping controls stack, and the row table becomes labeled review cards. Nothing essential is dropped.

## Interaction grammar

The product is one linear bench: **1. Add export → 2. Set mapping → 3. Review → 4. Take results**. Completed steps receive a hand-drawn check; the active step has a clipped-paper tab. File drop is also a real keyboard-operable file input. Mapping changes immediately recompute row state. Review filters behave as native buttons with pressed state. Downloads are explicit verbs and explain their target profile.

Errors appear as rust pencil annotations beside the source of the problem, and the live status line announces them. Duplicate rows are never silently dropped: the user chooses keep-first or keep-all. Clearing a loaded file asks for confirmation and only affects in-memory data.

## Motion and depth

Paper panels lift by 2px and fade in over 220ms; mapping changes briefly underline the result, and the review section scrolls from its real page position. Only `transform` and `opacity` animate. Under `prefers-reduced-motion: reduce`, transitions, smooth scrolling, and decorative movement are removed. There are no loops, flashes, or autoplay.

## Original asset plan and provenance

The hero is an original still-life illustration: an overhead collector's notebook with blank index cards flowing across a small handmade bridge, visually explaining local translation without using game boxes, logos, copyrighted art, or metadata. It appears beside the import action with meaningful alt text. A tiny hand-authored SVG bridge mark is used as the wordmark icon; interface icons are typographic or CSS-drawn.

### Prompt sheet

**Subject:** overhead open field notebook on a worn wood desk, neat blank catalogue cards entering from the left, crossing a tiny green cardboard bridge, and emerging as orderly blank cards on the right; a pencil, paperclip, and small status checkmarks nearby. **World/materials:** tactile recycled paper, graphite, ink stamps, book cloth, cut cardboard, subtle fibers. **Light/lens:** soft window light, top-down editorial still life, 50mm-equivalent, crisp center, gentle natural shadows. **Palette words:** oat paper, bottle green ink, oxidized rust pencil, muted ochre tape. **Negative list:** no people or hands, no readable words, no letters or numbers, no logos, no watermarks, no game boxes, no recognizable game art, no screens, no glossy 3D, no gradient background.

Generated with the factory Azure image model (`factory-image`) on 2026-08-27. The asset is original to Shelf Bridge and may be used under the repository's MIT license. Source prompt and generation metadata live beside the source image in `assets/src/`.
