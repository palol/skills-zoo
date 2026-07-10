# Dungeon Map — Architecture

Read this when you need to understand or adapt the pipeline. Files and their jobs, top to bottom.

## Build-time

### `assets/hex-spiral.js` → `src/helpers/hex-spiral.js`
Axial-coordinate hex math (Red Blob Games ring/spiral approach). No dependencies.
- `axialToPixel(q, r, w, h)` — flat-top hex → pixel center.
- `hexRing(center, radius)` / `hexRingFrom(...)` — one ring; `From` starts at a hex so the path is
  continuous between rings.
- `generateHexSpiral(total, w=28, h=24)` — returns `[{q,r,x,y,ring}]` for `total` hexes, spiraling
  out from center, each ring joined to the previous for a continuous walk.

### `assets/generate-dungeon-data.js` → `scripts/generate-dungeon-data.js`
Enumerates notes and builds the data model. Deps: `node-html-parser`, `gray-matter`.
- **Sources:** tries `dist/sitemap.xml` first (URLs containing `/notes/`), falls back to scanning
  `src/site/notes/**/*.md`.
- **Per note** → `extractItemFromFile`: returns the tuple
  `[icon, url, title, height, createdDate, isHomePage]`.
  - `noteIcon` mapping: number `N` → `tree-N`; numeric string → `tree-N`; other string → used as-is;
    missing → `tree-1`. `permalink` frontmatter wins for the URL. `dg-home: true` or `home.md` →
    home page. Files literally named `hidden` are skipped.
- **Order:** `sortContentItemsByDate` — earliest created = first hex.
- **π rhythm:** `getPiDigits(100)` returns π's digits; `createVirtualTileList` walks them in pairs
  `(content_count, ambient_count)` — place that many real notes, then that many empty "ambient"
  hexes, repeat. Leftover notes are appended without ambient padding.
- **Placement:** `generateHexSpiral(totalSlots, 28, 24)` gives positions; each slot becomes a
  `hexData` entry `{q,r,x,y,ring,item|null,isAtmosphere}`.
- **Legends:** counts per icon type from the notes present.
- **Writes:** `dist/data/dungeon-data.json` and `src/site/_data/dungeonData.json`
  (`{ hexGridData, dungeonItems, legends, generatedAt, itemCount }`).

### `assets/generate-static-dungeon.js` → `scripts/generate-static-dungeon.js`
Calls `generateDungeonData()`, then renders the SVG. No extra deps.
- `generateDungeonSVG` — computes bounds, emits `<defs>` gradients (content/home/exit/void +
  theme-driven ambient), draws the continuous "meditation" spiral path, then content hexes wrapped
  in `<a href="permalink" target="_top">` (so each hex links to its note), then ambient hexes
  (alternating dark/light by ring parity). Icons come from `src/site/img/` via a directory-derived
  `name → /img/name.svg` map; `void` renders no icon.
- **Writes:** `dist/img/dungeon-map.svg` and `dist/data/dungeon-coordinates.json`.
- Hooked via `package.json` `"postbuild"`.

## Runtime (browser)

### `assets/aa-graph-helpers.njk` → `common/head/aa-graph-helpers.njk`
Defines `window.DgGraphHelpers` once: `normalizePath`, `slugFromUrl`, cached `loadGraphData`
(`/graph.json`) and `loadBacklinkIndex` (`/data/backlink-map-index.json`), node lookups,
`getBacklink/Outbound/NeighborUrlsFromGraph`, and `buildLocalNeighborhood` (BFS neighborhood).
`aa-` prefix ensures it loads before the footer init.

### `assets/dungeon.njk` → `notes/header/dungeon.njk`
Renders the map container `#dungeon-map-static.dungeon-map-root` with `data-page-url`, the overlay
toggle buttons (Backlinks / Icons), a live hint region, an `<img>` SVG fallback, and a legends
container. Gated by `pageMode == "map"` by default (see the top comment to change).

### `assets/zz-dungeon-map-init.njk` → `common/footer/zz-dungeon-map-init.njk`
The controller. On DOM ready, for each `.dungeon-map-root`:
1. Fetch `/img/dungeon-map.svg`, inline it.
2. Build a position lookup by reading each `<a href>` hex center (rendered CTM, or transform matrix
   fallback).
3. **Current hex:** clone the current page's hex group, apply the magenta outline
   (`DUNGEON_CURRENT_NOTE_COLOR`) + gold current-node dot. Derived from `data-page-url`; independent
   of overlay toggles.
4. Load `graph.json` (+ optional backlink index), compute backlink & mention path sets (minus
   `DUNGEON_HIDDEN_PREFIXES`), and draw connected-room highlights + directional lines/nodes on
   layered `<g>` groups.
5. Toggle buttons show/hide overlay layers; Backlinks defaults **off**, Icons **on**; Backlinks
   disables itself if nothing is mappable.
6. Render legends from `dungeon-data.json`.

### `assets/dungeon-map.scss` → append to `custom-style.scss`
Core map + overlay-control styles, a footer variant (`--footer`), and map-page spacing/leak guards.
TUNING KNOBS `:root` block on top; colors inherit DG theme tokens.

## Data shapes (quick reference)

- `dungeon-data.json`: `{ hexGridData:{ hexData:[{q,r,x,y,ring,item,isAtmosphere}], pathwayConnections:[] }, dungeonItems:[[icon,url,title,height,date,isHome]], legends:[{label,count,icon}], itemCount }`
- `graph.json` (DG-provided): `{ homeAlias, nodes: { "<url>": { url, title, noteIcon, backLinks:[], outBound:[], neighbors:[], hide? } } }`
