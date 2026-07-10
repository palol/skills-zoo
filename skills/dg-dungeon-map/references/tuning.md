# Dungeon Map — Tuning Knobs

Every safe-to-edit value, where it lives, and what it changes.

## Layout / spiral (`scripts/generate-dungeon-data.js` + `hex-spiral.js`)

| Knob | Location | Default | Effect |
|------|----------|---------|--------|
| Hex width / height | `generateHexSpiral(totalSlots, 28, 24)` in `generate-dungeon-data.js`; same defaults in `hex-spiral.js` `axialToPixel` | `28 × 24` | Size & spacing of every hex. Change both call sites together. |
| π source | `getPiDigits` string in `generate-dungeon-data.js` | 100 digits of π | The digit sequence that sets the content/ambient rhythm. Swap for another constant (e) to change the "feel" of the path. |
| Rhythm rule | `createVirtualTileList` | pairs `(content, ambient)` | How digits map to real vs. empty hexes. Edit to change pacing (e.g. cap ambient runs). |
| Note ordering | `sortContentItemsByDate` | ascending `date created` | First hex = oldest note. Reverse the comparator for newest-first. |
| Icon default | `extractItemFromFile` `icon = 'tree-1'` | `tree-1` | Fallback icon when `noteIcon` is absent. |

## SVG rendering (`scripts/generate-static-dungeon.js`)

| Knob | Location | Default | Effect |
|------|----------|---------|--------|
| Padding | `const padding = 20` | 20 | Whitespace around the map bounds. |
| Hex gradients | `<defs>` `contentHex` / `homeHex` / `exitHex` / `voidHex` | greens / gold / bronze / black | Fill gradients per hex type. |
| Ambient tones | `.ambient-*` CSS in the SVG `<style>` | theme tokens | Empty-hex colors; already track `--background-primary/secondary`, `--text-muted`. |
| Spiral path | `generateMeditationPath` | thin white line | The connecting "meditation" path stroke/opacity. |
| Icon box | `renderIcon` `<image width/height>` | 16×16 | On-hex icon size. |

## Runtime config (`common/footer/zz-dungeon-map-init.njk`, top of file)

| Knob | Default | Effect |
|------|---------|--------|
| `DUNGEON_HIDDEN_PREFIXES` | `['/logs/']` | Path prefixes whose backlinks/mentions are hidden in overlays unless you're already in that section. `[]` disables. |
| `DUNGEON_CURRENT_NOTE_COLOR` | `#E255FF` | Current-note outline + glow color. |
| Backlinks default | `setBacklinksToggle(false, state)` | Overlay starts off; set `true` to default on. |
| Icons default | `setIconsToggle(true)` | Icons start on. |
| Current-node dot radius | `renderCurrentOverlayNode` `r: 6.8` | Size of the "you are here" dot. |
| Overlay node radius | `renderDirectionalOverlay` `r: 4.6` | Size of backlink/mention dots. |

## Component gate (`notes/header/dungeon.njk`)

| Knob | Default | Effect |
|------|---------|--------|
| Render gate | `{% if pageMode == "map" %}` | Where the map shows. `{% if true %}` = every note; or gate on your own page-mode value. |
| Toolbar toggles | the two `<button data-map-toggle>` | Remove one to drop that control. |

## Styles (`custom-style.scss`, TUNING KNOBS block)

| Var | Default | Effect |
|-----|---------|--------|
| `--dungeon-map-max-width` | `500px` | Max render width of the map block. |
| `--dungeon-btn-radius` | `6px` | Overlay toggle button corner radius. |
| `--dungeon-hint-size` | `0.78rem` | Hint text size. |

Colors are intentionally **not** knobs — they inherit DG theme tokens so light/dark just works.
