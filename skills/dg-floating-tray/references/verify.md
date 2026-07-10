# Verify checklist

After `npm run build` (or `npx @11ty/eleventy --serve`):

## Rendering
- [ ] Dock appears bottom-center on desktop; full-width bottom rail on mobile.
- [ ] Only the primary dock (random / theme / search / more) shows by default; tray hidden.
- [ ] Captions appear under icons **only** in the tray, not in the primary dock.

## Tray interaction
- [ ] "More" (`•••`) opens and closes the tray.
- [ ] Clicking outside the tray closes it; clicking a dock item does not.
- [ ] Adding/removing tray items recomputes columns/rows (test wide + narrow widths).

## Theme
- [ ] Theme toggle swaps sun/moon and flips the whole site light/dark.
- [ ] Choice persists across reloads (`localStorage` key `site-theme`).

## Search
- [ ] Search icon opens the DG search overlay.
- [ ] Dock hides while search overlay is open.
- [ ] If `dgEnableSearch` is false, no search icon renders (no dead button).

## Accessibility
- [ ] Tab reaches every item with a visible focus ring.
- [ ] Enter/Space activate `role="button"` items (theme, more).
- [ ] `#more-toggle` `aria-expanded` flips true/false with the tray.
- [ ] Screen reader announces each item via `aria-label`.

## Layout safety
- [ ] Page content and footer clear the dock on mobile (no overlap/clipping).
- [ ] Safe-area insets respected on notched phones.

## Upstream safety
- [ ] Only files under `components/user/**` and the user stylesheet changed.
- [ ] No edits to plugin core or `layouts/*.njk`.
