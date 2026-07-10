# Tuning knobs

## SCSS `:root` knobs (top of indieweb.scss)

| Knob | Default | Effect |
|---|---|---|
| `--wm-face-size` | `40px` | Facepile avatar diameter on `/webmentions/`. |
| `--wm-face-overlap` | `-8px` | Negative margin = overlapping avatars; set `0` for a spaced row. |
| `--wm-gap` | `0.75rem` | Gap between webmention list items. |
| `--wm-radius` | `8px` | Card corner radius. |
| `--wm-note-face-size` | `28px` | Per-note facepile avatar diameter. |

Colors are **not** knobs — everything inherits DG theme tokens
(`--background-secondary`, `--background-modifier-border`, `--text-muted`,
`--text-normal`, `--text-accent`, `--interactive-accent`,
`--interactive-accent-hover`, `--text-on-accent`) so light/dark just work.

## Template config (in the `.njk` assets)

| Knob | File | Default | Effect |
|---|---|---|---|
| `WEBMENTION_DOMAIN` | `aa-microformats.njk`, `webmentions.njk` | `meta.webmentionDomain or meta.domain or "example.com"` | Domain used in discovery `<link>`s and the send-form endpoint. |
| `AUTHOR_NAME` / `AUTHOR_URL` | `aa-microformats.njk` | `meta.author`, `/` | p-author h-card the runtime script injects into each note. |
| h-card fields | `zz-hcard-footer.njk` | `meta.author/authorBio/authorPhoto` | Owner identity. Wire to your `_data/meta.*` or hardcode your own values. |

Prefer wiring these to fields in `src/site/_data/meta.*` so there's a single
source of truth, rather than editing each template.

## Script / workflow config (environment)

| Knob | Where | Effect |
|---|---|---|
| `WEBMENTION_IO_TOKEN` | secret / `.env` | Auth for fetching received mentions. Required to receive. |
| `WEBMENTION_DOMAINS` | variable / `.env` | Comma-separated domains to fetch for (e.g. apex + www). |
| `SITE_URL` | variable / `.env` | Live base URL the send script reads the sitemap from. |
| `SITE_TITLE` | variable / `.env` | Title in the generated send-RSS feed. |
| fetch `cron` | `fetch-webmentions.yml` | Default weekly (`0 9 * * 0`). |
| send `cron` | `send-webmentions.yml` | Default monthly (`0 8 1 * *`). |
| backoff | `send-webmentions.js` `shouldSendWebmention` | `minDaysBetween=7`, 30-day refresh. |

## Optional trims

- Skip `zz-note-webmentions.njk` for a site-wide `/webmentions/` page only.
- Skip the workflows + scripts if you only want build-time fetch via
  `webmentions.mjs` (needs the token in the build env instead).
- Skip `webmentions.mjs` + display if you only want to *send*, not receive.
