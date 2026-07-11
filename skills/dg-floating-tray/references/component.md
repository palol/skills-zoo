# Component walkthrough - `zzz-floating-dock.njk`

Read when customizing markup or scripts. The full file is `assets/zzz-floating-dock.njk`.

## Structure

```
<aside id="floating-control">
  <div id="tray-expandable" class="floating-dock floating-dock--tray tray-hidden">   ← secondary links, hidden by default
  <div class="floating-dock floating-dock--primary">                                 ← always visible
</aside>
<script> ... 3 blocks ... </script>
```

Tray is a **sibling above** the primary dock so it stacks upward when opened.

## Item anatomy

Every clickable is `.floating-dock__item`. Two kinds:

- Internal nav: `<a href="/path/">`.
- Action / external: `<button type="button" id="...">`, behavior attached in script.

Each carries an icon (`aria-hidden`) + a `.floating-dock__caption` (shown only in the tray,
hidden in the primary dock via CSS). Real accessible text lives in `aria-label`; `title`
gives a hover tooltip.

`role="button"` spans (`#theme-switch`, `#more-toggle`) get `tabindex="0"` so they're focusable,
and are activated by the keyboard handler in `wireDockAction`.

## Script block 1 - activation helpers

- `wireDockAction(el, fn)` binds **click** and **keydown (Enter/Space)** → one path for mouse,
  touch, keyboard. Calls `e.stopPropagation()` on click so dock clicks don't reach the
  outside-click closer (block 3).
- `wireExternalButton(id, url)` opens `url` in a new tab (`noopener,noreferrer`).
- Search button calls `window.toggleSearch()` (guarded with a `typeof` check) - the global
  exposed by the DG search component.

Customize: change/remove `wireExternalButton(...)` calls; edit or drop the QR handler.

## Script block 2 - theme toggle

- Reads `localStorage['site-theme']` (default `light`), applies `theme-dark`/`theme-light`
  to `<body>`, and swaps the sun/moon icon by toggling `.light`/`.dark` on `.theme-switch`.
- Persists on every toggle. `window.theme` holds current state.

Matches DG's own theme classes, so it cooperates with the plugin's theming.

## Script block 3 - tray + responsive grid

- `updateTrayLayout()` counts `.floating-dock__item` in the tray and sets two CSS custom
  properties on `:root`: `--dg-floating-tray-column-count` and `--dg-floating-tray-row-count`.
  - Desktop: columns = clamp(2..6, itemCount); rows = ceil(count / cols).
  - Mobile (≤600): 4 cols (3 under 380). Collapsed → row-count `0` (frees reserved rail height).
- `setExpanded(bool)` toggles `.tray-visible` / `.tray-hidden`, and syncs `aria-hidden` +
  `#more-toggle`'s `aria-expanded`.
- Outside-click handler closes the tray; guarded so clicks inside the tray or on the toggle
  don't close it.
- Recomputes on `resize`.

Because sizing is derived from item count at runtime, adding/removing tray items needs **no**
config change.

## Customization cheatsheet

| Want to… | Do this |
|---|---|
| Add a nav link | Copy an `<a class="floating-dock__item">` block in `#tray-expandable`, set `href`/label/icon/caption |
| Add an external link | Add a `<button id="x-link">`, then `wireExternalButton('x-link', 'https://…')` |
| Add a custom action | Add a `<button>`, then `wireDockAction(document.getElementById('id'), fn)` |
| Remove search | Delete the `{% if settings.dgEnableSearch %}` block + its `wireDockAction` |
| Change icons | Swap `icon-name="…"` (Lucide) or paste inline `<svg class="footer-icon">` |
| Reorder tray | Reorder the item blocks (visual order = DOM order) |
