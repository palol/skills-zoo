# How the obsifetch tribute fits together

A neofetch-style vault readout, in two surfaces, from one build-time data
source. Tribute to [tabibyte/obsifetch](https://github.com/tabibyte/obsifetch)
(the Obsidian plugin that does this inside the app).

```
_data/vaultStats.js   → build-time scan → `vaultStats` in templates
neofetch.txt.njk      → /neofetch.txt (plain text: ASCII + stats)  [curl-able]
common/footer/zz-obsifetch.njk → HTML card (ASCII + stats + swatches) [visual]
obsifetch.scss        → card styling (theme tokens + knobs)
```

## The data engine — `vaultStats.js`

Runs once per Eleventy build. Recursively scans `src/site/notes`,
`src/site/files`, and `src/site/img`, then computes:

- **file counts + human-readable sizes** — total / markdown / attachments
  (attachments = jpg/jpeg/png/gif/webp/pdf/svg).
- **internal links** — count of `[[wikilinks]]` across all markdown.
- **orphan files** — markdown with neither incoming nor outgoing wikilinks
  (handles `[[a]]`, `[[a\|alias]]`, `[[a|alias]]`, and path-style targets).
- **theme** — name + appearance from `THEME` / `BASE_THEME` env (the vars DG
  already sets from your plugin config).
- **domain** — from `SITE_DOMAIN` env or the fallback string.

Pure read-only: no network, no writes. Exposed to every template as
`vaultStats`.

## Two surfaces, same data

- **`/neofetch.txt`** — a plain-text route (`neofetch.txt.njk`). The obsifetch
  ASCII mushroom, the domain rule, the stat lines, 8 `■` squares, and the
  tribute credit. Meant to be `curl`ed, embedded, or shared like a real
  neofetch dump.
- **HTML card** (`zz-obsifetch.njk`) — the same stats rendered as a styled card
  in the footer slot: ASCII on the left, a `<dl>` of stats on the right, 8 live
  theme-color swatches, and a link to the raw route. Rendered **inline** from
  `vaultStats` at build time — no client fetch, so no loading flash and it works
  with JS off. (The site's original plan fetched `/neofetch.txt` into a `<pre>`;
  this finishes it as a proper inline card instead.)

## Swatches from theme tokens

The 8 squares map to DG theme variables (`--text-normal`, `--text-accent`,
`--interactive-accent`, `--text-error/success/warning`, …) via `--ob-c1..c8` in
the SCSS. They track the active theme and light/dark automatically. Override any
`--ob-cN` to curate the palette.

## Config surface

| Where | Value | Source |
|---|---|---|
| `SITE_DOMAIN` | published domain shown in the readout | env / edit fallback in `vaultStats.js` |
| `THEME`, `BASE_THEME` | theme name + appearance | env (DG already sets these) |
| ASCII logo | the mushroom | edit the `ascii` block in **both** `.njk` files; keep the credit line |
| `--ob-*` knobs | sizes, radius, swatch palette | `:root` in `obsifetch.scss` |
