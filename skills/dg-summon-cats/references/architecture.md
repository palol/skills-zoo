# Architecture

## Runtime flow

`zzz-summon-cats.njk` is autoloaded from the user footer slot. Its script:

1. Exits if the global single-instance guard is already set.
2. Creates one fixed, decorative element for Greta and one for Nigel.
3. Maps named movement and idle states to frames in each 256×128 sprite atlas.
4. Runs each cat at a 100 ms simulation interval inside `requestAnimationFrame`.
5. Converts each `pointerdown` into offset targets so the cats arrive side by side.
6. Clamps cats and targets into the viewport after movement and resize.

The elements use `pointer-events: none`, so they never block links or controls beneath them.

## Sprite atlases

Both PNGs are 8 columns × 4 rows of 32 px frames. The frame-coordinate table follows the classic
Neko atlas layout popularized by [WebNeko](https://webneko.net/) (walk, idle, sleep, scratch).
Greta uses the cream/spirit atlas and moves at 7 px per simulation step; Nigel uses the gray
atlas and moves at 13 px per step.

The skill stores the atlases as PNGs instead of embedding large base64 strings in the component.
Digital Garden passes `src/site/img` through to `/img`, so no runtime network dependency is
introduced.

## Reduced motion

When `prefers-reduced-motion: reduce` is active, animation frames stop. A pointer press places
each cat at its requested destination in the idle frame. If the preference changes at runtime,
the controllers stop or resume without duplicating elements or event listeners.

## Source adaptation

Behavior and sprite-atlas conventions are inspired by [WebNeko](https://webneko.net/) (first
encountered via [chardidath.ing](https://chardidath.ing/)). This package separates code, styles,
and binary assets; replaces duplicate click/touch listeners with Pointer Events; adds
viewport-resize handling; adds a duplicate-init guard; and restores a reduced-motion path
suitable for a reusable public skill. Local sprite sheets ship with the skill; WebNeko is not
loaded at runtime.
