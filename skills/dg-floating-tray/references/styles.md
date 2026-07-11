# Styles walkthrough - `floating-tray.scss`

Read when tuning layout/sizing. Full file is `assets/floating-tray.scss`.

## Three sections

1. **Base + desktop** (`#floating-control` block)
2. **Mobile** (`@media (max-width: 600px)`)
3. **Search hide + narrow phones** (`.search-active`, `@media (max-width: 380px)`)

## Base + desktop

- `#floating-control` is `position: fixed`, centered bottom (`left:50%` + `translateX(-50%)`),
  `z-index: 9990`. A column flex: tray on top, primary dock below.
- CSS custom props at the top define item size / gap / padding / grid counts. The JS overrides
  the grid counts at runtime.
- `.floating-dock` = the pill: rounded (`999px`), theme background + border + shadow.
- `.floating-dock__item` = 48px hit target, transparent, inherits color. `:focus-visible`
  draws an accent outline (keyboard focus ring).
- Captions hidden by default; **shown only inside `#tray-expandable`** (small, muted, ellipsized).
- `#tray-expandable` is a CSS grid sized by the two custom props. `.tray-hidden{display:none}` /
  `.tray-visible{display:grid}` is the show/hide switch the JS flips.
- `#theme-switch` shows sun or moon based on the `.light`/`.dark` class the JS sets.

**Colors are all DG theme tokens** (`--background-secondary`, `--background-modifier-border`,
`--text-muted`, `--text-accent`, `--input-shadow`, `--link-color`) → no manual dark mode.

## Mobile (≤600px)

- Dock becomes a **full-width bottom rail** (edge-to-edge with safe-area insets), not a
  centered pill.
- The important bit: **`--dg-floating-rail-offset`** computes the dock's total height
  (tray rows + gaps + padding + primary dock + margins + safe-area). Then:
  - `main.content` gets that as `padding-bottom` → content never hides behind the dock.
  - `.custom-footer-bottom` adds it too, so the footer clears the rail.
- Item size drops to 44px, icons to 22px; tray uses `minmax(0,1fr)` columns to fill width.

**If you change item size / gap / padding, keep the offset formula in sync** - otherwise
content clips or floats above the dock.

## Search hide + narrow phones

- `body.search-active #floating-control { visibility:hidden }` hides the dock while the DG
  search overlay is open; the overlay is bumped to `z-index:10000` so it sits above.
- Under 380px: grid becomes 3 columns / 3 rows for readability.

## Integration notes

- Append to your compiled user stylesheet, or `@use`/`@import` as a partial - just ensure it's
  in the build output.
- Uses `:has()` for the rail offset (modern browsers). If you must support old browsers, apply
  the `padding-bottom` to `main.content` unconditionally instead.
