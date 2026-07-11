# How the IndieWeb kit fits together

Three layers, all upstream-safe (user-owned paths + runtime decoration, no
plugin-core edits).

## 1. Identity & microformats (client + slots)

```
common/footer/zz-hcard-footer.njk   → h-card (owner identity)
notes/head/aa-microformats.njk      → discovery <link>s + rel=me
                                     + runtime h-entry decoration
```

**Why runtime decoration for h-entry.** Core `note.njk` renders
`<article data-page-url>` and `<div class="note-content">` with **no**
`h-entry` / `e-content` classes, and slot components render *inside* the
article - a slot can't add a class to an ancestor it lives within. Editing
`note.njk` would break on upstream `git pull`. So `aa-microformats.njk` ships a
tiny script (in the `notes/head` slot) that, on DOM ready, adds `h-entry` to the
article, `e-content` to `.note-content`, and injects the required hidden
`u-url` / `p-name` / `dt-published` / `p-author h-card` properties. Valid mf2
without touching core; JS-off pages remain valid HTML (just without the hints).

`dt-published` reuses the theme's rendered `.human-date[data-date]` timestamps -
the last one (date modified) preferred, falling back to the first (date created),
matching the site's feed.xml convention.

## 2. Receiving webmentions (build-time + display)

```
_data/webmentions.mjs        → fetch + 1h cache at build (env token; empty if none)
webmentions.njk → /webmentions/  → site-wide facepile + list + send form
notes/afterContent/zz-note-webmentions.njk → per-note facepile (optional)
scripts/fetch-webmentions.js → GH Action: pull to data/webmentions/*.json
.github/workflows/fetch-webmentions.yml → weekly, commits to `webmentions` branch
```

Two independent paths to the same data:
- **Build-time (`webmentions.mjs`)** - templates read `webmentions.mentions`
  live at each build. Fast to set up, needs the token in the build env.
- **Committed JSON (`fetch-webmentions.js` + workflow)** - a durable archive
  under `data/webmentions/`, one file per `wm-id`, landing on a `webmentions`
  branch so `main` stays clean. Merge when you want them permanent.

Use either or both. The display templates read `webmentions.mentions`, so wiring
`webmentions.mjs` to also load the committed JSON is a later enhancement.

## 3. Sending webmentions (outgoing)

```
scripts/send-webmentions.js  → read sitemap, dedupe log + backoff, npx webmention
.github/workflows/send-webmentions.yml → monthly + manual, updates sent log
```

Reads your live `sitemap.xml`, decides which URLs to (re)notify via
`data/webmentions-sent.log` (min 7 days between sends; re-send on update; 30-day
periodic refresh), builds a temp RSS feed, and hands it to the `@remy/webmention`
CLI which crawls each page for external links and pings their endpoints.

## Config surface (no secrets in code)

| Where | Value | Source |
|---|---|---|
| `WEBMENTION_IO_TOKEN` | webmention.io API token | repo **secret** / `.env` |
| `WEBMENTION_DOMAINS` | domains registered at webmention.io | repo **variable** / `.env` |
| `SITE_URL`, `SITE_TITLE` | live base URL + title for sending | repo **variable** / `.env` |
| `meta.webmentionDomain` / `meta.domain` | domain for discovery links + form | your `_data/meta.*` |
| `meta.author`, `meta.authorBio`, `meta.authorPhoto` | h-card fields | your `_data/meta.*` |

The token is read from the environment **only** - never hardcode it; this code
is committed to a public repo.
