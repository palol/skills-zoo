// folderColors.js — single source of truth for folder → graph color.
//
// Drop-in: place at src/helpers/folderColors.js (new file, no existing file to
// overwrite in a stock DG fork). Both build-time node coloring and any future
// legend/UI can require() this one module.
//
// ─────────────────────────────────────────────────────────────────────────
//  TUNING KNOBS — edit this map to match YOUR vault's top-level folders.
//  Keys are the first path segment under src/site/notes/ (e.g. notes/Maps/x.md
//  → "Maps"). 'root' colors notes that live directly under notes/ with no
//  subfolder. 'default' is the fallback for any folder not listed here.
//  These are PLACEHOLDER names — rename them to your own folders.
// ─────────────────────────────────────────────────────────────────────────
const folderColors = {
  'Maps':    '#8A784E', // example: index / MOC pages
  'Notes':   '#4CAF50', // example: working notes
  'Log':     '#9C27B0', // example: changelog / dated entries
  'root':    '#648DB3', // top-level pages (about, home, contact …)
  'default': '#666666', // any unmapped folder
};

// Resolve a folder name to a hex color. Root-level and empty groups map to
// the 'root' entry; unknown folders fall back to 'default'.
function getFolderColor(folderName) {
  if (!folderName || folderName === '' || folderName === 'root') {
    return folderColors['root'];
  }
  return folderColors[folderName] || folderColors['default'];
}

// Derive the group (top-level folder) from a node URL/permalink.
// "/maps/career/"      → "maps"   → matched case-insensitively below
// "/about/"            → "root"   (single segment = top level)
// Keeps the mapping keys human-readable while tolerating slugified URLs.
function groupFromUrl(url) {
  if (!url) return 'root';
  const parts = String(url).split('/').filter(Boolean);
  if (parts.length < 2) return 'root'; // top-level page, no folder
  return parts[0];
}

// Case-insensitive lookup so folderColors keys ("Maps") still match
// slugified URL segments ("maps").
function getFolderColorFromUrl(url) {
  const group = groupFromUrl(url);
  if (group === 'root') return folderColors['root'];
  const hit = Object.keys(folderColors).find(
    (k) => k.toLowerCase() === group.toLowerCase()
  );
  return hit ? folderColors[hit] : folderColors['default'];
}

module.exports = {
  folderColors,
  getFolderColor,
  groupFromUrl,
  getFolderColorFromUrl,
};
