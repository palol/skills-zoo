# Verify checklist

## Microformats (mf2)
Validate a note page and the home page with [indiewebify.me](https://indiewebify.me/)
and [pin13.net/mf2](https://pin13.net/mf2/):
- [ ] Home page exposes a valid **h-card** (name, url, photo).
- [ ] A note page exposes a valid **h-entry** with `e-content`, `p-name`,
      `dt-published`, `u-url`, and a nested `p-author h-card`.
- [ ] `dt-published` `datetime` is ISO8601 (has date + time, `Z` or offset).
- [ ] With JS disabled the page is still valid HTML (h-entry hints just absent).

## Discovery
- [ ] `<link rel="webmention">` present in `<head>`, pointing at
      `https://webmention.io/<your-domain>/webmention`.
- [ ] `<link rel="authorization_endpoint">` / `token_endpoint` present.
- [ ] `rel="me"` on your identity link(s) — verify with indiewebify.me step 1.

## Receiving (build-time)
- [ ] With `WEBMENTION_IO_TOKEN` set, build logs `Fetched N webmentions`.
- [ ] Without the token, build still succeeds and logs "webmentions disabled".
- [ ] `/webmentions/` renders: facepile for likes/reposts, list for
      replies/mentions, or the empty-state line.
- [ ] Per-note facepile (if installed) shows only mentions targeting that note.

## Receiving (workflow archive)
- [ ] `Actions → Fetch Webmentions → Run workflow` succeeds.
- [ ] New mentions land as `data/webmentions/<wm-id>.json` on the
      `webmentions` branch (not `main`).
- [ ] Re-running with no new mentions exits cleanly ("No new webmentions").

## Sending
- [ ] `SITE_URL` set; `node scripts/send-webmentions.js --test` reads the
      sitemap and lists send/skip decisions without pinging.
- [ ] Real run pings external links and appends to `data/webmentions-sent.log`.
- [ ] Second run within 7 days skips already-sent URLs (backoff works).

## Security
- [ ] **No token in any committed file.** Grep the repo:
      `grep -rn "webmention.io/api" . | grep -i token` should show only
      `process.env` / `secrets.` references, never a literal token string.
- [ ] `WEBMENTION_IO_TOKEN` lives in repo **secrets**, domains/URLs in repo
      **variables** — not in code.

## Upstream safety
- [ ] Only user-owned paths touched: `components/user/**`, `_data/webmentions.mjs`,
      root pages (`webmentions.njk`), `scripts/**`, `.github/workflows/**`, and
      appended `custom-style.scss`. No edits to `layouts/*.njk` or plugin core.
