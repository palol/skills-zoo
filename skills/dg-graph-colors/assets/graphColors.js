// graphColors.js - post-process the DG graph object to add a per-node `color`
// derived from each node's top-level folder. Build-time, read-only transform.
//
// Drop-in: place at src/helpers/graphColors.js (new file). Called from the
// graph data hook in src/site/_data/eleventyComputed.js (see SKILL.md), so
// linkUtils.js and every plugin-core file stay untouched.
//
// The stock DG Pixi renderer (graphScript.njk) already honors `node.color`
// (falls back to the theme var when absent) and colors links by their source
// node's color. So injecting `color` here is the ONLY wiring needed - no
// renderer edit.
//
// Input shape (from linkUtils.getGraph): { nodes: { "<url>": { url, ... } },
// homeAlias, ... } OR { nodes: [ { url, ... } ] }. Handles both.

const { getFolderColorFromUrl, groupFromUrl } = require('./folderColors');

function decorateNode(node) {
  if (!node || typeof node !== 'object') return node;
  const url = node.url || node.id || '';
  // Non-destructive: only set if not already present, so a color baked in
  // upstream (or a manual per-note override) always wins.
  if (node.color == null) node.color = getFolderColorFromUrl(url);
  if (node.group == null) node.group = groupFromUrl(url);
  return node;
}

// Accepts the graph object, returns the SAME object with colors added.
// Safe to call on null/undefined (returns it unchanged).
function addGraphColors(graph) {
  if (!graph || typeof graph !== 'object' || !graph.nodes) return graph;

  if (Array.isArray(graph.nodes)) {
    graph.nodes.forEach(decorateNode);
  } else {
    // nodes keyed by url
    Object.values(graph.nodes).forEach(decorateNode);
  }
  return graph;
}

module.exports = { addGraphColors, decorateNode };
