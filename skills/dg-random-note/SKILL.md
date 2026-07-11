---
name: dg-random-note
description: "Add a '/random' route to an Obsidian Digital Garden (oleeskild digital-garden plugin + Eleventy) site that redirects visitors to a randomly chosen published note. Use when a user wants a 'surprise me' / random-note / shuffle link for their digital garden, or a destination for a random button. Installs one self-contained page (src/site/random.njk) — no build scripts, no core edits, upstream-safe. Trigger on: add a random link, random note route, /random page, surprise me link, shuffle to a random note, random page redirect for my digital garden."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L1 — adds a single new page file (src/site/random.njk). No build scripts, no code execution beyond the local `skills-ref validate` check, no secrets, no network calls, no core/layout edits. Fully reversible: delete the one file."
---

# Digital Garden — Random Note Route

Adds a `/random` route to an Obsidian [Digital Garden](https://github.com/oleeskild/digital-garden)
(Eleventy) site. Visiting `/random/` redirects the visitor to a randomly chosen **published** note.

The whole feature is **one file** — `src/site/random.njk`. It builds an inline list of published
note URLs at build time, then a tiny script picks one and redirects. No build scripts, no
dependencies, no plugin-core edits.

## When to Use This Skill

Use when a Digital Garden user wants a "surprise me" / shuffle / random-note link — e.g. "add a
random button destination", "give me a /random page", "let visitors jump to a random note".

This skill installs the **destination route only**. If the user also wants a floating shuffle
*button*, that lives in the `dg-floating-tray` skill (its "random" action links to `/random`).
This route is what that button points at.

Do **not** use to install other DG features, or on non-DG stacks (Quartz, Astro, plain Eleventy) —
the `collections.note` collection and `dg-publish` flag are DG-specific.

## DG invariants respected

1. **User-owned path.** `src/site/random.njk` is a **new** file the plugin never ships, so upstream
   `git pull` never clobbers it. It's a root page (not a `components/user/` slot) because a route
   needs its own permalink — see `references/architecture.md` for why that's still upstream-safe.
2. **No autoloading needed.** A page route is not a slot component, so there's no `dynamics.js`
   glob or filename-prefix ordering to worry about.
3. **Theme via tokens.** The redirect page reuses the site's own `pageheader.njk` and theme body
   classes, so it inherits light/dark automatically. No hardcoded color.
4. **Accessibility / graceful degradation.** `<noscript>` path plus a visible "Go home" link, and
   `meta robots noindex` so the transient redirect page isn't indexed.
5. **One config knob.** `FALLBACK_URL` (inline, top of the `<script>`) — where to send visitors if
   no published notes exist. Nothing else to tune.

## Prerequisites (verify first)

- An Obsidian Digital Garden (oleeskild plugin + Eleventy) repo with a working `collections.note`
  collection and the standard `components/pageheader.njk` include.
- Notes use the `dg-publish` frontmatter flag (the DG default). The random pool = published notes.

## Instructions

1. **Confirm prerequisites** (above). Abort with a plain explanation if the target isn't a DG
   repo.
2. **Copy the route file** into the site root:
   ```
   assets/random.njk  →  src/site/random.njk
   ```
3. **(Optional) Set the fallback.** Edit `FALLBACK_URL` at the top of the `<script>` if `/` isn't
   the desired empty-pool destination.
4. **(Optional) Pool tuning.** By default the pool excludes notes flagged `dg-hide`. If the user
   wants *every* published note eligible, remove `and not note.data['dg-hide']` from the
   `{% if %}`. If they want to exclude more (e.g. a `/logs/` prefix), extend that condition.
5. **Build and verify** with `references/verify.md`.
6. **Wire an entry point** (only if asked): a nav link or `<a href="/random">Surprise me</a>`.
   If `dg-floating-tray` is installed, its shuffle button already targets `/random` — no change
   needed.

## Reference Files

- `references/architecture.md` — how the build-time loop + runtime pick work, and why a root page
  is upstream-safe.
- `references/verify.md` — post-build QA checklist (route, pool correctness, back-button, fallback).

## Assets

- `assets/random.njk` — the single self-contained route (build-time list + runtime redirect).

## Risk Level

**L1 (low).** Adds a single new page file (`src/site/random.njk`). No build scripts, no secrets,
no network calls, no core/layout edits. Fully reversible: delete the one file.

## Validate & Package

```bash
npx skills-ref validate skills/dg-random-note/
zip -rq dg-random-note.zip dg-random-note
```
