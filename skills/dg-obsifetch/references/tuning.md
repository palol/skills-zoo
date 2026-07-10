# Tuning knobs

## SCSS `:root` knobs (top of obsifetch.scss)

| Knob | Default | Effect |
|---|---|---|
| `--ob-max-width` | `640px` | Card max width. |
| `--ob-gap` | `1.5rem` | Gap between ASCII art and the stats column. |
| `--ob-ascii-size` | `0.72rem` | ASCII art font size — shrink if the mushroom wraps. |
| `--ob-stat-size` | `0.85rem` | Stat text size. |
| `--ob-swatch` | `16px` | Color swatch side length. |
| `--ob-radius` | `8px` | Card corner radius. |
| `--ob-accent` | `var(--text-accent)` | Domain + ASCII color. |

## Swatch palette (`--ob-c1..c8`)

Eight squares, each defaulting to a DG theme token so they track the active
theme:

| Var | Default token |
|---|---|
| `--ob-c1` | `--text-normal` |
| `--ob-c2` | `--text-muted` |
| `--ob-c3` | `--text-accent` |
| `--ob-c4` | `--interactive-accent` |
| `--ob-c5` | `--text-error` (fallback `#e06c75`) |
| `--ob-c6` | `--text-success` (fallback `#98c379`) |
| `--ob-c7` | `--text-warning` (fallback `#e5c07b`) |
| `--ob-c8` | `--text-highlight-bg` (fallback `--text-accent`) |

Override any of them to curate an exact 8-color palette.

## Content config

| Knob | Where | Effect |
|---|---|---|
| `SITE_DOMAIN` | env, or fallback in `vaultStats.js` | Domain shown at the top of the readout. |
| `THEME` / `BASE_THEME` | env (DG sets these) | Theme name + light/dark appearance line. |
| ASCII logo | `ascii` block in `neofetch.txt.njk` **and** `zz-obsifetch.njk` | Your logo. Edit both so text + card match. Keep the `tabibyte/obsifetch` credit. |
| stat rows | `<dl>` in `zz-obsifetch.njk` | Add/remove rows; every `vaultStats.*` field is available. |

## Optional trims

- **Text route only** — install just `vaultStats.js` + `neofetch.txt.njk`; skip
  the card component and SCSS.
- **Card only** — install `vaultStats.js` + `zz-obsifetch.njk` + SCSS; skip the
  txt route (drop the `raw` link from the card credit line).
- **Hide swatches** — delete `.obsifetch-swatches` block from the component, or
  `display:none` it in SCSS.
