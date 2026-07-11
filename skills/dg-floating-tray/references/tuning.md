# Tuning knobs

Everything you can adjust, grouped by where it lives. Most safe tweaks are consolidated in the
`>>> TUNING KNOBS <<<` block at the top of `assets/floating-tray.scss` - edit there and the rest
of the file derives from it.

## CSS knobs (top of `floating-tray.scss`)

| Knob (CSS var) | Default | Controls |
|---|---|---|
| `--dg-ft-item-size` | `48px` | Desktop icon-button size |
| `--dg-ft-gap` | `6px` | Space between tray items (desktop) |
| `--dg-ft-padding` | `8px` | Tray inner padding (desktop) |
| `--dg-ft-item-size-mobile` | `44px` | Icon-button size on phones |
| `--dg-ft-gap-mobile` | `8px` | Tray gap (mobile) |
| `--dg-ft-padding-mobile` | `10px` | Tray padding (mobile) |
| `--dg-ft-icon-size` | `24px` | Icon glyph size (desktop) |
| `--dg-ft-icon-size-mobile` | `22px` | Icon glyph size (mobile) |
| `--dg-ft-caption-size` | `0.62rem` | Tray label text size (desktop) |
| `--dg-ft-caption-size-mobile` | `0.58rem` | Tray label text size (mobile) |
| `--dg-ft-bottom` | `1vmax` | Distance from bottom edge (desktop) |
| `--dg-ft-pill-radius` | `999px` | Dock pill roundness (lower = squarer) |
| `--dg-ft-tray-radius` | `16px` | Expandable tray corner radius |
| `--dg-ft-z` | `9990` | Stacking order (search overlay sits above at 10000) |

Changing any of these needs **no** other edits - the rail-offset math and grid read from them.

## Grid: rows & columns

Column count is **auto-derived at runtime** from how many items are in the tray, clamped by caps.
Rows follow from columns (`ceil(itemCount / columns)`). Two ways to influence it:

1. **Add/remove tray items** → grid resizes automatically. This is the normal way. No config.
2. **Change the caps.** These live in **two places that must stay in sync**: the CSS knobs (for
   documentation) and the actual `matchMedia`/`Math` logic in `assets/zzz-floating-dock.njk`
   (script block 3), which is what really runs.

| Cap | CSS knob (doc) | Real value in `.njk` JS | Default |
|---|---|---|---|
| Desktop max columns | `--dg-ft-cols-desktop-max` | `Math.min(6, ...)` | 6 |
| Desktop min columns | `--dg-ft-cols-desktop-min` | `Math.max(2, ...)` | 2 |
| Mobile columns | `--dg-ft-cols-mobile` | `isNarrowMobile ? 3 : 4` (the `4`) | 4 |
| Narrow-phone columns | `--dg-ft-cols-mobile-narrow` | `isNarrowMobile ? 3 : 4` (the `3`) | 3 |

To **hard-pin** rows/columns instead of auto-sizing: set `--dg-floating-tray-column-count` and
`--dg-floating-tray-row-count` in CSS and delete the `root.style.setProperty(...)` lines in the
`.njk` so JS stops overriding them.

## Breakpoints

Literal values, in **two places** - change both together:

| Breakpoint | In `floating-tray.scss` | In `zzz-floating-dock.njk` |
|---|---|---|
| Mobile | `@media (max-width: 600px)` | `matchMedia('(max-width: 600px)')` |
| Narrow phone | `@media (max-width: 380px)` | `matchMedia('(max-width: 380px)')` |

## Behavior / content knobs (`zzz-floating-dock.njk`)

| Knob | Where |
|---|---|
| Which items exist, order | The `<a>` / `<button>` blocks (DOM order = visual order) |
| Icons | `icon-name="…"` (Lucide) or inline `<svg>` |
| Captions / labels | `.floating-dock__caption` text + `aria-label` |
| External URLs | `wireExternalButton('id', 'url')` calls |
| Show/hide search | `{% if settings.dgEnableSearch === true %}` gate |
| Theme storage key | `'site-theme'` in the theme script |

## Not a knob

Colors are **not** set here - they inherit DG theme tokens (`--background-secondary`,
`--text-muted`, `--text-accent`, `--input-shadow`, `--link-color`), so light/dark follows your
site automatically. To recolor, override those tokens in your own theme, not in this file.

## Gotcha

If you change mobile item size / gap / padding, the **`--dg-floating-rail-offset`** formula
(mobile block) recomputes from the knobs automatically - but if you hand-edit the formula, keep
it consistent or page content will clip behind or float above the dock.
