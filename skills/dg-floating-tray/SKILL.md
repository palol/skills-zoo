---
name: dg-floating-tray
description: "Add a bottom floating dock + expandable tray to an Obsidian Digital Garden (Eleventy) site. Use when a user of the oleeskild digital-garden plugin wants a fixed bottom navigation control: an always-visible primary dock (theme toggle, search, random, more) plus a tappable tray of secondary links (nav, social, RSS, QR). Upstream-safe, drops into user-owned component and style paths, no core/layout edits. Trigger on: floating dock, floating tray, bottom nav bar, mobile dock, digital garden navigation UI."
license: MIT
metadata:
  author: palol
  version: '1.3'
  risk-level: "L1 - writes two files into the user's repo (a component + a stylesheet append). No code execution, no secrets, no network calls. Fully reversible via git."
---

# Digital Garden Floating Tray

Adds a fixed bottom **floating control** to an Obsidian Digital Garden (Eleventy) site:
an always-visible **primary dock** (random, theme toggle, search, "more") plus an
expandable **tray** of secondary links. Fully keyboard + screen-reader accessible,
theme-aware, responsive (centered pill on desktop, full-width rail on mobile).

Everything lives in **user-owned paths**, so upstream `git pull` never overwrites it.

## When to Use This Skill

Use when a Digital Garden (oleeskild `digital-garden` plugin + Eleventy) user wants:

- A persistent bottom navigation dock / tray / mobile dock.
- Quick access to theme toggle, search, random page, plus a grid of extra links.
- A drop-in that doesn't touch plugin core or layout files.

Do **not** use for Quartz, Astro, or non-DG sites - the auto-include mechanism and theme
tokens are DG-specific. (Adaptable, but out of scope here.)

## Quick Install (agent-driven, for non-technical users)

If the user just wants this installed and isn't editing code themselves, run this hands-off flow
and keep explanations light:

1. **Verify prerequisites** (below). If the repo doesn't match, say so plainly and stop.
2. **Copy** `assets/zzz-floating-dock.njk` → `src/site/_includes/components/user/common/footer/zzz-floating-dock.njk`.
3. **Append** `assets/floating-tray.scss` to `src/site/styles/custom-style.scss`.
4. **Pause and ask the user, in plain language, which links they want** in the tray (internal
   pages, external/social, RSS, QR) and their URLs. Edit the `.njk` accordingly - update the
   `wireExternalButton('id','url')` calls, remove unused items.
5. **Build** (`npm run build` or the dev server) and give the user a preview URL.
6. **Walk the user through the visual checks** in `references/verify.md` in everyday terms
   ("tap the ••• button - does a tray open?").
7. Only commit/push if the user asks.

Afterward, the user can request changes conversationally ("add a Guestbook link", "make icons
bigger") - apply them by editing the same two files.

## Prerequisites (verify first)

1. Repo uses the DG plugin with Eleventy; site source under `src/site/`.
2. User-component autoloading exists: `src/site/_data/dynamics.js` globs
   `components/user/common/<slot>/*.njk`, sorts alphabetically, injects into layout slots.
   Confirm the `footer` slot is iterated (`{% for imp in dynamics.common.footer %}`).
3. A user stylesheet is compiled - typically `src/site/styles/custom-style.scss`.
   Confirm it's imported into the build.
4. DG theme tokens available: `--background-secondary`, `--background-modifier-border`,
   `--text-muted`, `--text-accent`, `--input-shadow`, `--link-color`.

If any differs, adapt paths but keep the structure.

## Instructions

Follow these steps. Full annotated source is in `references/`; ready-to-copy files are in `assets/`.

### 1. Install the component

Copy `assets/zzz-floating-dock.njk` to:

```
src/site/_includes/components/user/common/footer/zzz-floating-dock.njk
```

The `zzz-` prefix forces alphabetical sort **last** → renders after all other footer
partials. The autoloader picks it up with no layout edits.

### 2. Install the styles

Append the contents of `assets/floating-tray.scss` to `src/site/styles/custom-style.scss`
(or `@use` it as a partial). See `references/styles.md` for a section-by-section explanation.

### 3. Customize the links

In the copied `.njk`:

- **Tray items** (`#tray-expandable`): edit the `<a>` / `<button>` entries. Internal nav =
  `<a href="/path/">`; external/action = `<button type="button" id="...">` wired in the
  script block. Each item needs `class="floating-dock__item"`, `aria-label`, `title`, an
  icon, and a `<span class="floating-dock__caption">` label.
- **External buttons**: update the `wireExternalButton('id', 'url')` calls to your URLs
  (or delete). Remove the QR handler if unused.
- **Primary dock** (`.floating-dock--primary`): keep random/theme/search/more, or trim.
  Search stays gated behind `{% if settings.dgEnableSearch === true %}`.

Item count is read at runtime to size the grid - no config needed when you add/remove items.

### 4. Icons

Uses Lucide via `<i class="svg-icon" icon-name="NAME">` (DG bundles Lucide). For brand marks,
paste inline `<svg class="footer-icon" ...>` (filled) or `class="svg-icon"` (stroked). Always
keep `aria-hidden="true"` on the icon and real text in `aria-label`.

### 5. Build + verify

```bash
npm run build   # or: npx @11ty/eleventy --serve
```

Run the checklist in `references/verify.md`.

## Key Design Points

- **No layout / core edits** - autoload via the `common/footer` slot; survives upstream updates.
- **Theme-token styling** - light/dark handled by DG CSS variables automatically.
- **A11y** - `wireDockAction` binds click + Enter/Space; `role="button"` spans operable;
  `#more-toggle` exposes `aria-expanded` + `aria-controls`.
- **Responsive grid** - JS sets `--dg-floating-tray-column-count` / `-row-count` from item
  count and viewport (6-wide desktop, 4-wide mobile, 3-wide under 380px).
- **Search integration** - reuses DG's `window.toggleSearch()`; dock hides while search overlay is open.

## Reference Files

- `references/component.md` - annotated walkthrough of the `.njk` markup + three script blocks.
- `references/styles.md` - annotated SCSS (base/desktop, mobile rail offset math, narrow phones).
- `references/verify.md` - post-build QA checklist.
- `references/tuning.md` - every adjustable knob (sizes, radii, rows/columns, breakpoints).

All safe size/shape tweaks are consolidated in the `>>> TUNING KNOBS <<<` block at the top of
`assets/floating-tray.scss`. Rows/columns auto-size from item count; caps live in the `.njk` JS.
See `references/tuning.md` before adjusting.

## Assets

- `assets/zzz-floating-dock.njk` - drop-in component (generic links/URLs to customize).
- `assets/floating-tray.scss` - drop-in styles.

## Risk Level

**L1 (low).** This skill writes two files into the user's repo - a `.njk` component and an
append to the user stylesheet. It runs no shell commands, ships no secrets, makes no network
calls, and every change is reversible with git. The only build step it suggests (`npm run
build`) is the site's own build. Review the two assets before committing.

## Validate & Package (for maintainers)

Before sharing an edited version:

```bash
npx skills-ref validate skills/dg-floating-tray/     # pass the directory, not a file
cd .. && zip -r dg-floating-tray.zip dg-floating-tray   # bundled resources => zip the whole dir
```

Keep it ≤100 files / ≤70 MB. Frontmatter stays spec-compliant: only `name`, `description`,
`license`, `compatibility`, `metadata`, `allowed-tools` at top level - custom keys (author,
version, risk-level) nest under `metadata:`.

## Distributing This Skill

- **Git (source of truth):** commit the `dg-floating-tray/` dir; users clone into their agent's
  skills dir (e.g. `~/.claude/skills/` or a shared `~/.agents/skills/`).
- **Remote via MCP:** drop the dir into a GitHub skills repo and serve it with
  [Skills Over MCP](https://www.skillsovermcp.com/) - users add one `mcpServers` config line and
  get updates on every push. Spec: agentskills.io + the SEP-2640 `skill://` extension.
