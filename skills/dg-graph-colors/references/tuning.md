# Tuning — colors, folders, legend

## Change the palette

Edit `src/helpers/folderColors.js`. Keys = your top-level folders under
`src/site/notes/`; values = any CSS-parseable color the renderer accepts (the
build stores the string; the Pixi renderer resolves hex/rgb/hsl/CSS-var).

```js
const folderColors = {
  'Projects': '#e07a5f',
  'Garden':   '#81b29a',
  'Journal':  '#f2cc8f',
  'root':     '#3d405b',  // top-level pages (no folder)
  'default':  '#666666',  // any folder not listed
};
```

- Keys match URL segments **case-insensitively** (`Projects` matches `/projects/…`).
- `root` = notes that live directly under `notes/` with no subfolder.
- `default` = fallback for folders you didn't list. Set it to your theme's
  muted color if you want unmapped notes to blend in.

## Map by something other than folder

`graphColors.js` derives group from the URL's first path segment. To color by a
different signal (tag, note maturity, frontmatter field), edit `decorateNode`:

```js
function decorateNode(node) {
  // e.g. color by a frontmatter "status" you carried into the node:
  if (node.color == null) node.color = statusColors[node.status] || '#666';
  return node;
}
```

The node objects carry whatever `linkUtils.getGraph` put on them — inspect
`/graph.json` in a browser to see available fields.

## The legend (optional)

`zz-graph-legend.njk` + `graph-colors.scss` render a small folder→color key in
the footer. Keep the legend's inline `folderColors` map **in sync** with
`src/helpers/folderColors.js` (the legend is a template, so it can't `require`
the JS module directly). If you don't want a legend, delete both files —
coloring still works.

Legend layout knobs live in the `:root` block of `graph-colors.scss`:

| Knob             | Controls                    |
| ---------------- | --------------------------- |
| `--gl-gap`       | space between items         |
| `--gl-swatch`    | swatch square size          |
| `--gl-radius`    | swatch corner radius        |
| `--gl-font`      | label text size             |
| `--gl-title-font`| "Graph colors" heading size |

## Current-page node

The renderer forces the current page's node to the theme's main color
(`if (n.current) return mainColor`), so it stays recognizable regardless of its
folder. This is core behavior — leave it. If you want the current node to also
use its folder color, that would require a renderer edit (raises risk to L3);
not recommended.
