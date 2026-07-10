---
name: dg-indieweb
description: "Add IndieWeb support to an Obsidian Digital Garden (oleeskild digital-garden plugin + Eleventy) site: h-card + h-entry microformats2, webmention discovery + IndieAuth/rel-me links, build-time webmention fetch with a /webmentions/ display page and per-note facepiles, and GitHub Actions that fetch received mentions and send outgoing ones. Upstream-safe — user-owned paths + runtime microformat decoration, no plugin-core edits. Use when a user wants to make their digital garden part of the IndieWeb, add webmentions, microformats, h-card/h-entry, rel-me identity, or finish a half-done IndieWeb setup. Trigger on: indieweb, webmention, webmentions, microformats, h-card, h-entry, rel-me, indieauth, POSSE, add webmentions to my digital garden, finish my indieweb setup."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L2 — adds build-time data fetching and two GitHub Actions that execute Node scripts, read your notes/sitemap, and make env-gated network calls to webmention.io. No secrets in code (token read from env only). No plugin-core edits. Reversible via git."
---

# Digital Garden — IndieWeb Kit

Makes an Obsidian [Digital Garden](https://github.com/oleeskild/digital-garden)
(Eleventy) site a first-class [IndieWeb](https://indieweb.org/) citizen:
microformats2 identity + content markup, webmention send/receive, and a
`/webmentions/` display page — all without editing plugin core.

## When to Use This Skill

Use when a DG user wants to join the IndieWeb: add **webmentions** (send and/or
receive), **microformats** (`h-card`, `h-entry`), **discovery** links,
**rel-me** identity, or **finish a partially-done IndieWeb setup** (a common
state: h-card + data fetcher present, but no display page, no h-entry, dead npm
scripts, or a token accidentally hardcoded).

Do **not** use on non-DG stacks (Quartz, Astro, plain Eleventy) — the note
markup shape, autoloader slots, and theme tokens are DG-specific.

## DG invariants respected

1. **User-owned paths + runtime decoration.** Everything lands in user
   territory: `components/user/**`, `_data/webmentions.mjs`, root page
   `webmentions.njk`, `scripts/**`, `.github/workflows/**`, and appended
   `custom-style.scss`. h-entry needs classes on core-rendered elements, so a
   `notes/head` script adds them at runtime — **no `note.njk`/layout edit**.
   See `references/architecture.md` §1.
2. **Autoload, don't wire.** Components use slot + filename-prefix
   (`aa-` head first, `zz-` footer/afterContent late). No layout edit.
3. **Theme via tokens.** All webmention styling inherits DG theme variables;
   light/dark automatic. Colors are never a knob.
4. **Accessibility / graceful degradation.** JS-off pages stay valid HTML;
   real `alt`/labels on faces; `prefers-reduced-motion` respected.
5. **No secrets in code.** The webmention.io token is read from
   `process.env.WEBMENTION_IO_TOKEN` only — never hardcoded. (The reference
   implementation this was derived from had the token hardcoded; this skill
   fixes that. If you copied that pattern, rotate the exposed token.)

## Prerequisites (verify first)

- An Obsidian Digital Garden (oleeskild plugin + Eleventy) repo with the
  user-component autoloader (`_data/dynamics.js` globbing
  `components/user/<ns>/<slot>/`) and a `components/pageheader.njk` include.
- `@11ty/eleventy-fetch` available (add if missing) for build-time fetch.
- A [webmention.io](https://webmention.io/) account + token to **receive**
  mentions. Sending works without it.
- Your identity domain(s) known (apex + `www` if both resolve).

Abort with a plain explanation if the target isn't DG+Eleventy with the
autoloader.

## Install workflow

Pick the pieces you need (all optional except where noted). Full kit:

1. **Identity (h-card).** Copy `assets/zz-hcard-footer.njk` →
   `src/site/_includes/components/user/common/footer/zz-hcard-footer.njk`.
   Fill in name/bio/photo, or wire to `meta.author` etc.
2. **Microformats + discovery.** Copy `assets/aa-microformats.njk` →
   `.../components/user/notes/head/aa-microformats.njk`. Set `WEBMENTION_DOMAIN`
   (or `meta.webmentionDomain`). This adds discovery `<link>`s, rel-me, and the
   runtime h-entry decoration.
3. **Build-time receive.** Copy `assets/webmentions.mjs` →
   `src/site/_data/webmentions.mjs`. Templates read `webmentions.mentions`.
4. **Display page.** Copy `assets/webmentions.njk` → `src/site/webmentions.njk`
   (route `/webmentions/`). Set `WEBMENTION_DOMAIN`.
5. **Per-note facepile (optional).** Copy `assets/zz-note-webmentions.njk` →
   `.../components/user/notes/afterContent/zz-note-webmentions.njk`.
6. **Styles.** Append `assets/indieweb.scss` to
   `src/site/styles/custom-style.scss` (TUNING KNOBS block at top).
7. **Send + archive automation (optional).**
   - `assets/fetch-webmentions.js` → `scripts/fetch-webmentions.js`
   - `assets/send-webmentions.js` → `scripts/send-webmentions.js`
   - `assets/fetch-webmentions.yml` / `send-webmentions.yml` →
     `.github/workflows/`
   - Add repo **secret** `WEBMENTION_IO_TOKEN`; repo **variables**
     `WEBMENTION_DOMAINS`, `SITE_URL`, `SITE_TITLE`.
8. **Build and verify** with `references/verify.md`. Test markup at
   [indiewebify.me](https://indiewebify.me/) and functionality at
   [webmention.rocks](https://webmention.rocks/).

## Key design points

- **Fixes the classic half-done setup.** Adds the missing `/webmentions/` page,
  real h-entry (no core edit), and removes any hardcoded token — the three
  things most DG IndieWeb attempts get wrong.
- **Two receive paths.** Build-time (`webmentions.mjs`, live but needs token in
  build env) and committed-JSON archive (`fetch-webmentions.js` + workflow, lands
  on a `webmentions` branch). Use either or both — see `references/architecture.md`.
- **Send is sitemap-driven with backoff.** Dedupe log avoids re-pinging; min 7
  days between sends, re-send on update, 30-day refresh.

## Risk Level

**L2.** Beyond writing user-owned files, this adds build-time data fetching and
two GitHub Actions that execute Node scripts, read your notes/sitemap, and make
env-gated network calls to webmention.io. No secrets in code; no plugin-core
edits; reversible via git. Review `scripts/*.js` before enabling the workflows.

## Reference files

- `references/architecture.md` — the three layers, why runtime h-entry, both
  receive paths, and the full config surface.
- `references/tuning.md` — every SCSS/template/env knob.
- `references/verify.md` — mf2, discovery, receive, send, security, and
  upstream-safety checks.

## Assets

`zz-hcard-footer.njk`, `aa-microformats.njk`, `webmentions.mjs`,
`webmentions.njk`, `zz-note-webmentions.njk`, `indieweb.scss`,
`fetch-webmentions.js`, `send-webmentions.js`, `fetch-webmentions.yml`,
`send-webmentions.yml`.
