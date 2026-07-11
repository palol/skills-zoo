---
name: dg-dungeon-map
description: "Add an interactive dungeon map to an Obsidian Digital Garden (oleeskild digital-garden plugin + Eleventy) site. Use when a DG user wants a hex-grid map of their garden that renders in the note header, highlights the current page (you-are-here), and can overlay backlinks/mentions pulled from graph.json. The layout is a spiral whose rhythm follows the digits of pi; each note is a hex placed in date order with its noteIcon. Upstream-safe: components go in user-owned slots, styles append to custom-style.scss, and a post-build script writes the static SVG + data. Trigger on: dungeon map, garden map, hex map, pi spiral map, interactive site map, map in header, add a map to my digital garden, brad.quest dungeon, hermitage forest."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L2 - writes user-owned components/styles AND adds two Node build scripts + a helper that run at build time (postbuild) and read your notes/sitemap. No secrets, no network calls; output is generated static files. Reversible via git."
---

# Digital Garden Dungeon Map

Adds an interactive **dungeon map** to a Digital Garden (oleeskild `digital-garden` plugin +
Eleventy) site. Notes become hexes on a spiral whose spacing follows the digits of **π**; the
header component renders the generated SVG, marks the **current page** ("you are here"), and can
toggle a **backlinks / mentions** overlay derived from `graph.json`.

Everything lives in **user-owned paths** (autoloaded components, `custom-style.scss`) plus two
**build scripts** in `scripts/` - upstream `git pull` never overwrites your files.

## Inspirations

Conceptual / visual inspiration (not code provenance):

- [brad.quest's Dungeon view](https://brad.quest/map/#dungeon) - a garden map mode that presents
  notes as a dungeon-style exploration surface.
- [Hermitage's Forest](https://hermitage.utsob.me/writings/technical/how-tos/steal-my-look/#forest)
  (source in [topobon](https://github.com/uroybd/topobon)) - a home-page forest of notes that
  treats the garden as a wanderable landscape.

Technical packaging / implementation sources:

- The official Digital Garden docs tip
  [Creating hex map](https://docs.forestry.md/advanced/tips-and-tricks/#creating-hex-map) points
  readers to the [Digital Garden Map tutorial](https://www.paologabriel.com/swamp/digital-garden-map/)
  this skill packages (π spiral, hex layout, header map).
- Hex ring-walking spiral math follows
  [Red Blob Games](https://www.redblobgames.com/grids/hexagons/#rings-spiral).

## When to Use This Skill

Use when a Digital Garden user wants:

- A visual, wander-friendly map of their whole garden in the note header.
- A "you are here" marker on the current note, visible even with overlays off.
- Optional backlink/mention overlays that connect the current note to related rooms.

Do **not** use for Quartz, Astro, or non-DG sites - the autoload mechanism, theme tokens, and
`graph.json` shape are DG-specific. This skill *installs* the feature; to *author* new DG skills,
use `dg-skill-authoring`.

## How It Works (the pipeline)

```
notes + frontmatter (noteIcon, dates)
   → [build] eleventy build           (produces sitemap + graph.json)
   → [postbuild] generate-static-dungeon.js
         ├─ generate-dungeon-data.js  (sort by date, π virtual-tile list, hex-spiral.js)
         │     → dist/data/dungeon-data.json  (+ src/site/_data/dungeonData.json)
         └─ build SVG (hexes, spiral path, icons)
               → dist/img/dungeon-map.svg
   → [runtime] dungeon.njk header slot renders the SVG;
               zz-dungeon-map-init.njk fetches SVG + graph.json,
               marks current hex, draws backlink/mention overlays;
               aa-graph-helpers.njk provides shared graph lookups.
```

- **π spiral:** `getPiDigits` + `createVirtualTileList` read π in digit pairs - first digit = how
  many content hexes, second = how many empty "ambient" hexes - so the path rhythm is literally π.
  Hex positions come from an axial-coordinate ring-walking spiral (`hex-spiral.js`, per
  [Red Blob Games](https://www.redblobgames.com/grids/hexagons/#rings-spiral)).
- **Current-note marker** is derived from the page URL (gold "you are here" dot + magenta outline)
  and stays visible even when the backlink/mention overlay is toggled off.

## Quick Install (agent-driven)

1. **Verify prerequisites** (below). If the repo doesn't match, say so plainly and stop.
2. **Copy the build scripts:** `assets/generate-dungeon-data.js` and
   `assets/generate-static-dungeon.js` → `scripts/`; `assets/hex-spiral.js` → `src/helpers/`.
3. **Copy the components** into their user-owned slots:
   - `assets/dungeon.njk` → `src/site/_includes/components/user/notes/header/dungeon.njk`
   - `assets/aa-graph-helpers.njk` → `src/site/_includes/components/user/common/head/aa-graph-helpers.njk`
   - `assets/zz-dungeon-map-init.njk` → `src/site/_includes/components/user/common/footer/zz-dungeon-map-init.njk`
4. **Append** `assets/dungeon-map.scss` to `src/site/styles/custom-style.scss`.
5. **Add the postbuild hook** and deps (see step 3 in Instructions).
6. **Add icons** to `src/site/img/` and set `noteIcon` on notes (step 4).
7. **Build**, then walk the user through `references/verify.md`.
8. Only commit/push if the user asks.

## Prerequisites (verify first)

1. Repo uses the DG plugin with Eleventy; site source under `src/site/`.
2. **User-component autoloading** exists: `src/site/_data/dynamics.js` globs
   `components/user/common/<slot>/*.njk` (and `components/user/notes/<slot>/*.njk`), sorts
   alphabetically, injects into layout slots. Confirm the `notes/header`, `common/head`, and
   `common/footer` slots are iterated.
3. **`graph.json` is emitted** at the site root (`/graph.json`) with a `nodes` map whose entries
   carry `backLinks`, `outBound`, and `neighbors` arrays. This is the DG local-graph data; the
   overlays degrade gracefully to no-op if it's absent.
4. A **sitemap** (`dist/sitemap.xml`) or a scannable `src/site/notes/` directory exists so the
   data script can enumerate published notes.
5. `src/site/styles/custom-style.scss` is compiled into the site CSS.

If any path differs, adapt it but keep the structure. If the repo is not DG+Eleventy, stop.

## Instructions

### 1. Install the components (autoloaded, no layout edits)

Filename prefixes matter - the autoloader sorts alphabetically within a slot:

- `aa-graph-helpers.njk` (head) - `aa-` so the helper window global exists before other head scripts.
- `zz-dungeon-map-init.njk` (footer) - `zz-` so it runs after the DOM/SVG is in place.
- `dungeon.njk` (notes/header) - renders the map container.

Copy each to the path in Quick Install step 3. No layout edit is needed.

### 2. Install the styles

Append `assets/dungeon-map.scss` to `src/site/styles/custom-style.scss`. Safe tunables live in the
`>>> TUNING KNOBS <<<` `:root` block at the top; hex/overlay colors inherit DG theme tokens.

### 3. Wire the build

Add the postbuild hook to `package.json`:

```json
"scripts": {
  "postbuild": "node scripts/generate-static-dungeon.js"
}
```

Install the script deps if missing:

```bash
npm install node-html-parser gray-matter
```

`generate-static-dungeon.js` calls `generateDungeonData()` (which uses `hex-spiral.js`) then writes
`dist/img/dungeon-map.svg` and `dist/data/dungeon-data.json`. It also copies data to
`src/site/_data/dungeonData.json`. Ensure the Eleventy build runs first so the sitemap exists.

### 4. Icons + note frontmatter

- Drop icon files in `src/site/img/` (`.svg`/`.png`). The scripts build a `name → /img/name.svg`
  map from the directory automatically.
- Set `noteIcon` in a note's frontmatter to the icon base name (e.g. `tree-1`), or a number
  (`noteIcon: 2` → `tree-2`). Special names: `exit` and `void` get distinct hex styling; `void`
  renders no icon. `dg-home: true` (or a `home.md`) becomes the gold home hex.
- Icon packs that fit the aesthetic: [Tiny Wonder RPG Icons](https://butterymilk.itch.io/tiny-wonder-rpg-icons),
  [Hermitage / topobon](https://github.com/uroybd/topobon).

### 5. Choose where the map renders

By default `dungeon.njk` gates on `pageMode == "map"` (map pages only). To show it on every note,
change the gate to `{% if true %}`; to show it elsewhere, gate on your own page-mode value. See the
comment at the top of `dungeon.njk`.

### 6. Generalize site-specifics

In `zz-dungeon-map-init.njk`, the CONFIG block at the top exposes:

- `DUNGEON_HIDDEN_PREFIXES` - path prefixes whose backlinks/mentions are suppressed in overlays
  unless you're already in that section (default `['/logs/']`; set `[]` to disable).
- `DUNGEON_CURRENT_NOTE_COLOR` - the current-note outline color (magenta by default).

### 7. Build + verify

```bash
npm run build   # eleventy build, then postbuild generates SVG + data
```

Then run `references/verify.md`.

## Key Design Points

- **Autoload, don't wire** - three components in `user/*` slots; alphabetical prefixes control
  order. No layout/core edits, so upstream updates never clobber it.
- **Build-time generation** - the SVG and data are produced by `postbuild`, not committed by hand;
  re-running the build refreshes the map as notes change. This is the L2 part: the scripts read
  your notes/sitemap at build time.
- **Graceful degradation** - if `graph.json` or the SVG is missing, the map hides overlays / the
  backlinks toggle disables itself instead of erroring.
- **Theme-token styling** - hex fills, ambient tones, and overlay colors track DG light/dark
  tokens; only a few sizes are knobs.
- **A11y** - overlay controls are real `<button>`s with `aria-pressed`; the hint uses
  `aria-live="polite"`; the fallback `<img>` has alt text.

## Risk Level

**L2 (moderate).** Beyond user-owned component/style files, this adds two Node build scripts and a
helper that **execute at build time** and **read your notes and sitemap** to generate the SVG and
JSON. No secrets, no network calls, output is static files. Review `assets/*.js` before wiring the
postbuild hook. Fully reversible via git (remove the files + the postbuild line).

## Reference Files

- `references/architecture.md` - annotated tour of the pipeline, data shapes, and each file's job.
- `references/tuning.md` - every adjustable knob (π source, hex size, spiral, config constants, SCSS).
- `references/verify.md` - post-build QA checklist.

## Assets

- `assets/generate-dungeon-data.js` - enumerate notes, sort by date, π virtual-tile list, spiral.
- `assets/generate-static-dungeon.js` - build the SVG (hexes, path, icons) + coordinate map.
- `assets/hex-spiral.js` - axial-coordinate ring-walking spiral generator.
- `assets/dungeon.njk` - notes/header slot: the map container + overlay controls.
- `assets/aa-graph-helpers.njk` - head slot: shared `graph.json` lookups (`window.DgGraphHelpers`).
- `assets/zz-dungeon-map-init.njk` - footer slot: fetch SVG, mark current hex, draw overlays.
- `assets/dungeon-map.scss` - styles (TUNING KNOBS on top; colors inherit theme).

## Validate & Package

```bash
npx skills-ref validate skills/dg-dungeon-map/
zip -rq dg-dungeon-map.zip dg-dungeon-map
```
