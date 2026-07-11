# Verification

## Build

- [ ] `npm run build` completes without Nunjucks, Sass, or missing-asset errors.
- [ ] Built HTML contains the `__dgSummonCatsLoaded` guard.
- [ ] `/img/user/greta-neko.png` and `/img/user/nigel-neko.png` return 200.
- [ ] Exactly two `.dg-summoned-cat` elements exist after page load.

## Interaction

- [ ] Greta appears cream/spirit and Nigel appears gray.
- [ ] A click or tap directs both cats toward that point without blocking the underlying control.
- [ ] Nigel travels faster than Greta and they stop on opposite sides of the target.
- [ ] Idle cats eventually show sleeping or scratching frames.
- [ ] Repeated navigation or component initialization does not create duplicate cats.

## Viewport and accessibility

- [ ] Resize desktop and mobile viewports; neither cat remains outside the visible bounds.
- [ ] Keyboard navigation is unaffected because the cats are decorative and not focusable.
- [ ] With `prefers-reduced-motion: reduce`, cats do not walk continuously; a tap relocates them
      in an idle frame.
- [ ] Cats remain visible in both light and dark themes.
- [ ] Print preview omits the cats.

## Upstream safety

- [ ] Only the user footer component, user stylesheet, and `src/site/img/user/` were changed.
- [ ] No plugin-core layout or component was edited.
