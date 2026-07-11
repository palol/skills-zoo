# Dungeon Map - Post-Build Verification

Run after `npm run build`. Each item should pass before committing.

## Build output exists
- [ ] `dist/img/dungeon-map.svg` was written and is non-empty.
- [ ] `dist/data/dungeon-data.json` exists with a non-empty `hexGridData.hexData` array.
- [ ] Build log shows `[DEBUG] Found N items for dungeon` with the expected note count.
- [ ] No `[ERROR]` lines from `generate-static-dungeon.js` / `generate-dungeon-data.js`.

## Files in the right (user-owned) places
- [ ] `scripts/generate-dungeon-data.js`, `scripts/generate-static-dungeon.js`
- [ ] `src/helpers/hex-spiral.js`
- [ ] `src/site/_includes/components/user/notes/header/dungeon.njk`
- [ ] `src/site/_includes/components/user/common/head/aa-graph-helpers.njk`
- [ ] `src/site/_includes/components/user/common/footer/zz-dungeon-map-init.njk`
- [ ] `dungeon-map.scss` appended to `src/site/styles/custom-style.scss`
- [ ] `package.json` has `"postbuild": "node scripts/generate-static-dungeon.js"`
- [ ] `node-html-parser` and `gray-matter` installed.

## Renders in the browser (on a page where the gate is true)
- [ ] The hex map appears in the note header (not clipped, centered, ≤ max-width).
- [ ] Hexes show icons; the legends row appears when the Icons toggle is off.
- [ ] Clicking a hex navigates to that note (`<a href>` works, opens `_top`).

## Current-note marker
- [ ] The current page's hex has the magenta outline + gold "you are here" dot.
- [ ] The marker stays visible when the Backlinks overlay is toggled **off**.
- [ ] Visiting a different note moves the marker to that note's hex.

## Overlays
- [ ] Backlinks toggle draws lines/nodes from the current hex to linked rooms.
- [ ] The hint shows `mapped/total backlinks · mapped/total mentions` (or "No backlinks/mentions yet").
- [ ] Backlinks button is disabled when nothing is mappable (no `graph.json`, or isolated note).
- [ ] Hidden-section prefixes (e.g. `/logs/`) are suppressed off those pages, present on them.

## Theme + a11y
- [ ] Map looks correct in both light and dark (hex fills + ambient tones follow theme).
- [ ] Toggle buttons are keyboard-focusable and report `aria-pressed`.
- [ ] The SVG fallback `<img>` has alt text; no console errors.

## Upstream safety
- [ ] No edits to `layouts/*.njk` or plugin-core `components/*` - only user-owned paths + scripts.
- [ ] A simulated upstream `git pull` (or reading the diff) touches none of the installed files.
