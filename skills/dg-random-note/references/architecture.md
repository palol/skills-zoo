# How the random route works

## One file, build-time list + runtime pick

```
src/site/~random.njk   →   /random/   (single self-contained page)
```

There is no separate layout and no build script. The whole feature is one Eleventy
template that does two things:

1. **Build time (Nunjucks/Eleventy).** The `{% for note in collections.note %}` loop
   runs during `npm run build` and inlines a JS array of published note URLs directly
   into the page's `<script>`:

   ```js
   const publishedNotes = ["/swamp/foo/", "/mire/bar/", ...];
   ```

   Only notes with `dg-publish: true` are included, and (in this skill) notes flagged
   `dg-hide` are skipped so utility/index pages stay out of the pool.

2. **Runtime (browser).** On load, a two-line script picks one entry at random and
   calls `window.location.replace(randomUrl)`. `replace()` (not `href =`) keeps
   `/random/` out of the back-button history, so "back" returns to wherever the visitor
   came from instead of re-rolling.

If the published list is empty, it redirects to `FALLBACK_URL` (default `/`).

## Why a root page, not a `components/user/` slot

Unlike component-based DG skills (e.g. `dg-floating-tray`), the random route is a
**new top-level page**, not a slot component — it needs its own permalink (`/random/`),
which a footer/header slot can't provide. `src/site/~random.njk` is safe because it is a
**new file you own**: the oleeskild plugin ships no `~random.njk`, so upstream `git pull`
never touches it. The `~` prefix also avoids clashing with a potential `random.md` note.
It sits outside the `components/user/**` convention only because a page route must live
at the site root.

## Data source: `collections.note`

`collections.note` is the DG plugin's collection of all imported notes. The
`dg-publish` frontmatter flag is the same one the rest of the site uses to decide what
ships, so the random pool always matches what's actually published — no separate
manifest to maintain.

## Relationship to the floating tray

The `dg-floating-tray` skill already ships a "random" (shuffle) action that links to
`/random`. That button is the *entry point*; this skill provides the *destination route*.
Install this route whenever anything links to `/random` — the tray, a nav link, or a
plain `<a href="/random">`.
