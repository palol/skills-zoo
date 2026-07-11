---
name: dg-obsifetch
description: "Add a neofetch-style vault stats readout to an Obsidian Digital Garden (oleeskild digital-garden plugin + Eleventy) site — a tribute to the tabibyte/obsifetch plugin. Ships a build-time vault analytics engine (file counts + sizes, orphan detection, internal-link count, theme info), a curl-able /neofetch.txt plain-text route with ASCII art, and an autoloaded HTML card component (ASCII logo + stats + live theme-color swatches) for the footer. Upstream-safe: user-owned paths only, read-only build scan, no plugin-core edits. Use when a user wants obsifetch, neofetch, a vault-stats card, a colophon/site-stats readout, a /neofetch.txt route, or an about/colophon page showing file counts and theme info for their digital garden. Trigger on: obsifetch, neofetch, vault stats, vaultStats, /neofetch.txt, colophon, site stats, fastfetch, screenfetch."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L2 — adds a build-time data file that recursively reads your notes/files/img trees to compute stats. Read-only, no network, no writes, no plugin-core edits. Reversible via git."
---

# Digital Garden — obsifetch Tribute

A neofetch for your vault. Renders a build-time stats readout of an Obsidian
[Digital Garden](https://github.com/oleeskild/digital-garden) as both a
`curl`-able `/neofetch.txt` route and a styled HTML card — a tribute to the
[tabibyte/obsifetch](https://github.com/tabibyte/obsifetch) Obsidian plugin,
which does the same thing inside the app.

## When to Use This Skill

Use when a DG user wants an **obsifetch / neofetch-style vault readout**: a
site-stats **colophon**, a `/neofetch.txt` route, or a footer **stats card**
showing file counts, sizes, orphan files, internal links, and theme. Common
state on real sites: the text route + data engine work, but the HTML embed was
left unfinished — this ships the finished card.

Do **not** use on non-DG stacks (Quartz, Astro, plain Eleventy) — the notes
layout, theme env vars, and theme tokens are DG-specific.

## DG invariants respected

1. **User-owned paths only.** Everything lands in user territory:
   `_data/vaultStats.js`, root page `neofetch.txt.njk`, footer component
   `components/user/common/footer/zz-obsifetch.njk`, and appended
   `custom-style.scss`. No layout / plugin-core edits.
2. **Autoload, don't wire.** The card uses the footer slot + `zz-` prefix
   (sorts late). No layout edit.
3. **Theme via tokens.** Card + swatches inherit DG theme variables; light/dark
   automatic. Colors are never hardcoded (except documented swatch fallbacks).
4. **Accessibility.** Decorative ASCII is `aria-hidden`; stats are a real `<dl>`;
   card is rendered inline (works with JS off).
5. **Consolidated knobs.** All sizes + the swatch palette live in one `:root`
   block atop the SCSS.

## Prerequisites (verify first)

- An Obsidian Digital Garden (oleeskild plugin + Eleventy) repo with the
  user-component autoloader (`_data/dynamics.js` globbing
  `components/user/common/footer/`).
- Standard DG tree: `src/site/notes`, optional `src/site/files`,
  `src/site/img`.
- `THEME` / `BASE_THEME` env vars set by your DG build (for the theme line) —
  optional; degrades to `default` / `light`.

Abort with a plain explanation if the target isn't DG + Eleventy with the
autoloader.

## Instructions

1. **Data engine.** Copy `assets/vaultStats.js` →
   `src/site/_data/vaultStats.js`. Set `SITE_DOMAIN` (env) or edit the fallback
   domain string.
2. **Text route.** Copy `assets/neofetch.txt.njk` → `src/site/neofetch.txt.njk`
   (route `/neofetch.txt`). Customize the ASCII if you like — keep the
   `tabibyte/obsifetch` credit line.
3. **HTML card.** Copy `assets/zz-obsifetch.njk` →
   `src/site/_includes/components/user/common/footer/zz-obsifetch.njk`. Keep its
   ASCII in sync with the text route.
4. **Styles.** Append `assets/obsifetch.scss` to
   `src/site/styles/custom-style.scss` (TUNING KNOBS block at top).
5. **Build and verify** with `references/verify.md`: `curl /neofetch.txt`, check
   the card renders with matching stats and 8 theme swatches.

Trims (text-only, card-only, hide swatches) are in `references/tuning.md`.

## Key Design Points

- **One data source, two surfaces.** `vaultStats.js` computes once at build;
  both the text route and the card read `vaultStats`. Stats always agree.
- **Finishes the classic unfinished embed.** The common half-done state is a
  working `/neofetch.txt` but no visual embed. This ships a proper **inline**
  card (no client fetch, no loading flash, JS-off safe) instead of a
  fetch-into-`<pre>`.
- **Swatches track the theme.** 8 squares map to DG theme tokens via
  `--ob-c1..c8`; they follow light/dark and any theme swap for free.
- **It's a tribute — keep the credit.** Both surfaces cite
  `tabibyte/obsifetch`.

## Risk Level

**L2.** Beyond writing user-owned files, this adds a build-time data file that
recursively **reads** your `notes`/`files`/`img` trees to compute stats. It is
read-only — no network, no writes, no plugin-core edits — and fully reversible
via git. Review `assets/vaultStats.js` before adding it.

## Reference Files

- `references/architecture.md` — data engine, the two surfaces, swatch mapping,
  config surface.
- `references/tuning.md` — every SCSS/content knob + trims.
- `references/verify.md` — data, text-route, card, theme/a11y, and attribution
  checks.

## Assets

`vaultStats.js`, `neofetch.txt.njk`, `zz-obsifetch.njk`, `obsifetch.scss`.

## Validate & Package

```bash
npx skills-ref validate skills/dg-obsifetch/
zip -rq dg-obsifetch.zip dg-obsifetch
```
