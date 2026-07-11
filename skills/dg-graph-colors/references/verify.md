# Verify — colored graph

Run after installing. Build first: `npx eleventy` (or your DG build script).

## 1. Files in place

```bash
ls src/helpers/folderColors.js src/helpers/graphColors.js
grep -n "addGraphColors" src/site/_data/eleventyComputed.js
```

Expect both files present and the wrap line matching:
`graph: async (data) => addGraphColors(await getGraph(data))`.

## 2. Colors reached graph.json

```bash
# after build — graph.json is emitted to the output dir (e.g. dist/ or _site/)
grep -o '"color":"#[0-9A-Fa-f]*"' _site/graph.json | sort | uniq -c
```

Expect several distinct hex values (one per mapped folder + default), not a
single color. If every node is the same color, group detection failed — open
`/graph.json` and check a node's `url`/`group` fields against your
`folderColors` keys.

## 3. Nodes/links colored in the browser

- Load any note page → the local graph nodes should show folder colors, not one
  flat theme color.
- Hover a node → connected links should take the source node's folder color;
  unrelated links go muted.
- The current page's node stays the theme's main color (expected — core forces
  it).
- Open the full `/graph/` view → same coloring across the whole vault.

## 4. Legend (if installed)

- Footer shows a "Graph colors" row with one swatch per folder.
- Swatch colors match `folderColors.js`.
- Toggle light/dark theme → legend text/border adapt; swatches keep their hex.

## 5. Reversibility

To fully remove: revert the one wrap line in `eleventyComputed.js`, delete
`folderColors.js`, `graphColors.js`, and (if used) `zz-graph-legend.njk` +
the appended SCSS. Rebuild — nodes return to the single theme color. No
plugin-core file was ever modified.

## Gotchas

- **All nodes one color** → folder keys don't match URL segments. URLs are
  slugified/lowercased; the lookup is case-insensitive, but check for renamed
  or nested folders.
- **No `color` in graph.json** → the wrap line wasn't applied, or your fork
  builds the graph in a different `_data` file. Run `grep -rn "getGraph(" src/`
  and wrap the real site (see `references/eleventyComputed.graph-hook.md`).
- **Legend drifts from graph** → the legend's inline map is separate from
  `folderColors.js`; update both.
