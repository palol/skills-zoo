---
name: dg-graph-colors
description: "Color an Obsidian Digital Garden's graph nodes and links by their top-level folder. Use when the user wants the oleeskild/Eleventy Digital Garden graph view (local + full) to distinguish content areas by color instead of one flat theme color. Ships a build-time color injector plus optional footer legend, driven by a single folder->color map. No plugin-core edits: the stock Pixi renderer already honors node.color, so this only populates it via a one-line wrap in the user-owned _data graph hook. Trigger on: colored graph, graph colors, folder colors, color graph by folder, graph legend, digital garden graph colors."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L2 — two additive drop-in helpers plus one wrapping edit to a user-owned _data graph hook. Build-time, read-only transform on the graph object; no network, no plugin-core edits. Fully reversible via git."
---

# Digital Garden Graph Colors

Color the Digital Garden graph by folder. Each node gets a `color` from its
top-level folder (`Maps`, `Notes`, `Log`, root, …); links inherit their source
node's color. Applies to both the local (per-note) graph and the full
`/graph/` view.

Original work — not a tribute. Faithful to the "colored obsidian graph" build
on the source site, re-implemented as a **cleaner, lower-risk** install that
avoids editing the shared `linkUtils.js` build helper.

## When to Use This Skill

Use when the user has an oleeskild/Eleventy Digital Garden and wants:

- graph nodes colored by content area instead of one theme color,
- links colored by their source folder,
- an optional folder→color legend in the footer.

Not for Obsidian's in-app graph (this is the published-site graph) and not for
Quartz. DG-specific.

## How it works (one sentence)

The stock DG Pixi renderer (`graphScript.njk`) **already draws `node.color`**
and colors links by source-node color — it just has no color to draw until you
add one, so this skill injects `color` per node at build time and changes
nothing in the renderer. Full data flow in `references/architecture.md`.

## Prerequisites (verify first)

- oleeskild DG fork (Eleventy) with the Pixi graph (`graphScript.njk` present).
- The graph global built via `linkUtils.getGraph` — stock DG wires this in
  `src/site/_data/eleventyComputed.js`. Confirm with:
  ```bash
  grep -rn "getGraph(" src/site/_data/
  ```
- User-component autoloading (only needed for the optional legend).

## Quick Install

1. **Drop in two helpers** (both new files — no overwrite in a stock fork):
   - `assets/folderColors.js` → `src/helpers/folderColors.js`
   - `assets/graphColors.js`  → `src/helpers/graphColors.js`

2. **Edit the color map.** Open `src/helpers/folderColors.js` and replace the
   PLACEHOLDER folder names/hexes with your vault's top-level folders. `root` =
   top-level pages, `default` = fallback. (`references/tuning.md`)

3. **Wrap the graph hook** — the ONLY edit to an existing file. In
   `src/site/_data/eleventyComputed.js` (user-owned `_data` path):
   ```diff
    const { getGraph } = require("../../helpers/linkUtils");
   +const { addGraphColors } = require("../../helpers/graphColors");
    …
   -  graph: async (data) => await getGraph(data),
   +  graph: async (data) => addGraphColors(await getGraph(data)),
   ```
   If your fork builds the graph elsewhere, apply the same wrap there — see
   `references/eleventyComputed.graph-hook.md`.

4. **(Optional) legend.** Copy `assets/zz-graph-legend.njk` →
   `src/site/_includes/components/user/common/footer/zz-graph-legend.njk` and
   append `assets/graph-colors.scss` to your `custom-style.scss`. Keep the
   legend's inline map in sync with `folderColors.js`. Skip this for coloring
   only.

5. **Build and verify** with `references/verify.md`.

## Key Design Points

- **No plugin-core edits.** `linkUtils.js` and `graphScript.njk` (renderer)
  stay untouched. Only additive new files + one wrap line in user-owned `_data`.
- **Single source of truth.** `folderColors.js` drives node color, link color,
  and (manually mirrored) the legend.
- **Non-destructive & idempotent.** `color`/`group` set only when absent, so
  upstream or per-note overrides win; running twice is safe.
- **Theme-aware.** Current-page node keeps the theme's main color (core
  behavior); legend swatches carry explicit hex, text/border use theme tokens.
- **Fully reversible.** Revert one line + delete new files → back to flat color.

## Risk Level

**L2.** Two additive drop-in files plus one wrapping edit to a user-owned
`_data` file. No writes at runtime, no network, no plugin-core modification.
The transform recursively reads the already-built graph object in memory to add
a color field — build-time and read-only. Reversible via git. Rated above L1
because it inserts a step into the graph build pipeline; kept below L3 by
avoiding any edit to shared build helpers or the renderer.

## Reference Files

- `references/architecture.md` — renderer support, data flow, why L2 not L3.
- `references/tuning.md` — palette, color-by-something-else, legend knobs.
- `references/verify.md` — post-install checks and gotchas.
- `references/eleventyComputed.graph-hook.md` — the exact one-line wrap + fallback.

## Assets

- `assets/folderColors.js` — the folder→color map (edit this).
- `assets/graphColors.js` — build-time color injector (`addGraphColors`).
- `assets/zz-graph-legend.njk` — optional footer legend (autoloaded).
- `assets/graph-colors.scss` — optional legend styles (TUNING KNOBS on top).

## Validate & Package

```bash
npx skills-ref validate skills/dg-graph-colors/
zip -rq dg-graph-colors.zip dg-graph-colors
```
