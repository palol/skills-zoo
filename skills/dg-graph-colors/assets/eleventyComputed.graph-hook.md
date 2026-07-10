# eleventyComputed.js — graph color hook

This is the ONE edit the skill makes to an existing file. The file lives at
`src/site/_data/eleventyComputed.js`, a **user-owned `_data/` path** (safe to
edit — not plugin-core). Do not overwrite the whole file; change only the
`graph:` computed key.

The stock DG defines the graph global roughly like this:

```js
const { getGraph } = require("../../helpers/linkUtils");

module.exports = {
  // …other computed keys…
  graph: async (data) => await getGraph(data),
};
```

## Edit

Add the `addGraphColors` require at the top, then wrap the `getGraph` result.

```diff
 const { getGraph } = require("../../helpers/linkUtils");
+const { addGraphColors } = require("../../helpers/graphColors");

 module.exports = {
   // …other computed keys…
-  graph: async (data) => await getGraph(data),
+  graph: async (data) => addGraphColors(await getGraph(data)),
 };
```

That is the entire change. `addGraphColors` mutates and returns the same graph
object, adding `color` (+ `group`) to every node from its top-level folder via
`folderColors.js`. `graph.njk` already serializes this to `/graph.json`, and
`graphScript.njk` already renders `node.color` — so no other file changes.

## If your fork defines `graph` elsewhere

Some forks compute the graph in a standalone `src/site/_data/graph.js` instead
of inside `eleventyComputed.js`. In that case apply the same wrap there:

```js
const { getGraph } = require("../../helpers/linkUtils");
const { addGraphColors } = require("../../helpers/graphColors");

module.exports = async (data) => addGraphColors(await getGraph(data));
```

Grep for `getGraph(` to find the exact site before editing:

```bash
grep -rn "getGraph(" src/site/_data/
```
