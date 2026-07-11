# Verify checklist

After `npm run build` (or `npx @11ty/eleventy --serve`):

## Route
- [ ] `/random/` exists in the build output (`dist/random/index.html` or served at `/random/`).
- [ ] Visiting `/random/` immediately redirects to a note, not a blank page.
- [ ] Reloading `/random/` lands on a **different** note most of the time (randomness works).

## Pool correctness
- [ ] View source of `/random/` before JS runs: `publishedNotes` array contains only
      published note URLs.
- [ ] A note with `dg-publish: false` is **absent** from the array.
- [ ] A note flagged `dg-hide: true` is **absent** from the array (utility/index pages
      stay out of the pool).

## Back-button behaviour
- [ ] After a redirect, pressing **Back** returns to the originating page - not back to
      `/random/` (confirms `location.replace`, not `href =`).

## Fallback
- [ ] With an empty published set (or a fresh garden), `/random/` redirects to
      `FALLBACK_URL` (default `/`) instead of erroring.
- [ ] With JavaScript disabled, the page shows the "Go home" link (noscript path).

## Upstream safety
- [ ] Only `src/site/~random.njk` was added - no edits to plugin core or `layouts/*.njk`.
- [ ] `~random.njk` carries `eleventyExcludeFromCollections: true` so the redirect page
      never appears in `collections.note` (and can't pick itself).
