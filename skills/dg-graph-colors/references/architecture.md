# Architecture - folder-based graph coloring

## The insight

The stock oleeskild Digital Garden Pixi renderer (`graphScript.njk`) **already
supports per-node color**. It reads `node.color` at draw time and colors links
by their source node's color:

```js
function resolveNodeColor(n) {
  if (n.current) return mainColor;   // current page always theme color
  if (n.color)   return resolveColor(n.color);  // ← group color, if present
  return mainColor;                  // fallback: theme color
}
// links: linkColor = active ? srcNode._nodeColor : mutedColor
```

So the graph nodes are already "colorable" - they just have no `color` field
until you add one. **This skill never touches the renderer.** All it does is
populate `node.color` at build time.

## Data flow

```
src/site/_data/eleventyComputed.js
    graph: async (data) => addGraphColors(await getGraph(data))
                           └────────────┬───────────────────┘
                                        │  (ONLY edit - user-owned _data path)
                                        ▼
src/helpers/graphColors.js   addGraphColors(graph)
    for each node: node.color ??= getFolderColorFromUrl(node.url)
                   node.group ??= groupFromUrl(node.url)
                                        │
                                        ▼
src/helpers/folderColors.js  { Maps:#…, Notes:#…, root:#…, default:#… }
                                        │
                                        ▼
src/site/graph.njk           {{ graph | jsonify }} → /graph.json
                                        │
                                        ▼
graphScript.njk (PLUGIN CORE, unedited)  reads node.color → Pixi fill + link color
```

## Why this is L2, not L3

The original site achieved coloring by editing `src/helpers/linkUtils.js` - a
shared build helper that generates the graph (two edits: fix group detection,
add `color:`). Editing that file works but is fragile: it is closer to core and
any DG update that ships a new `linkUtils.js` would clobber the change.

This skill instead **wraps** `getGraph`'s output in a user-owned `_data` file
and does the color injection in a **new, additive** helper (`graphColors.js`).
Result:

- `linkUtils.js` - untouched
- `graphScript.njk` (renderer) - untouched
- one-line wrap in `_data/eleventyComputed.js` - user-owned, safe
- two new drop-in files - additive, no overwrite

Fully reversible: revert the one wrap line and delete the two new files.

## Non-destructive by design

`decorateNode` only sets `color`/`group` when absent (`?? `). A color baked in
upstream, or a manual per-note override, always wins. Running the transform
twice is idempotent.
