# Verify checklist

## Data engine
- [ ] Build succeeds; no `vaultStats: cannot scan/read` warnings for real paths.
- [ ] `vaultStats` is populated (temporarily dump `{{ vaultStats | dump }}` in a
      template if unsure).
- [ ] Counts look right: total = markdown + attachments; sizes human-readable.
- [ ] `orphanFiles` is plausible (notes with no wikilinks in or out).
- [ ] `internalLinks` > 0 on a vault with `[[wikilinks]]`.

## Text route `/neofetch.txt`
- [ ] `curl https://<your-domain>/neofetch.txt` returns the ASCII mushroom +
      stats + `■` squares + credit line, as **plain text** (not HTML).
- [ ] Domain rule underline length matches the domain string.
- [ ] `updated:` is today's build date.
- [ ] `inspired by: tabibyte/obsifetch` credit present.

## HTML card
- [ ] Card renders in the footer: ASCII left, stats `<dl>` right, 8 swatches,
      `raw` + credit links.
- [ ] Stats match `/neofetch.txt`.
- [ ] 8 swatches show distinct theme colors; they change with light/dark.
- [ ] `raw` link opens `/neofetch.txt`; obsifetch link opens the GitHub repo.
- [ ] ASCII art does not wrap or clip — shrink `--ob-ascii-size` if it does.
- [ ] Mobile (<520px): card stacks, no horizontal overflow.

## Theme + a11y
- [ ] Colors come from theme tokens (no hardcoded hex except the documented
      swatch fallbacks); verify in both light and dark.
- [ ] ASCII `<pre>` is `aria-hidden` (decorative); stats are a real `<dl>`.

## Upstream safety
- [ ] Only user-owned paths touched: `_data/vaultStats.js`, root
      `neofetch.txt.njk`, `components/user/common/footer/zz-obsifetch.njk`, and
      appended `custom-style.scss`. No edits to `layouts/*` or plugin core.

## Attribution
- [ ] The `tabibyte/obsifetch` credit is present in both the text route and the
      card. This is a tribute — keep it.
