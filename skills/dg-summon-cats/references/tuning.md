# Tuning

## CSS knobs

Edit only the tuning block at the top of `summon-cats.scss`:

- `--dg-cat-scale` — visual scale around each 32 px sprite's center. Default `1`.
- `--dg-cat-opacity` — shared cat opacity. Default `1`.
- `--dg-cat-z-index` — stacking level above site chrome. Lower it if another overlay must win.

Do not change the element's 32 px frame size or 256×128 background size unless replacing both
atlases and the frame-coordinate math.

## Behavior constants

The safe behavior values are grouped at the top of `zzz-summon-cats.njk`:

- `FRAME_MS` — simulation interval; lower is more active and uses more CPU.
- `IDLE_ANIMATION_CHANCE` — chance per idle simulation step of sleeping or scratching.
- `startX` — each cat's initial horizontal center.
- `speed` — pixels moved per simulation step. Greta defaults to `7`; Nigel defaults to `13`.

The initial vertical position is 80 px above the viewport bottom. Search for
`window.innerHeight - 80` to change it.

## Sprite replacement

To use different cats, preserve the 256×128 Neko atlas layout and either keep the filenames or
update `GRETA_SPRITE` and `NIGEL_SPRITE`. If the atlas frame arrangement differs, update
`spriteSets`; do not guess coordinates from an image-generation model.
