---
name: dg-FEATURE
description: "Add FEATURE to an Obsidian Digital Garden (Eleventy) site. Use when a user of the oleeskild digital-garden plugin wants WHAT_IT_DOES. Upstream-safe, drops into user-owned component/style paths, no core/layout edits. Trigger on: TRIGGER_PHRASE_1, TRIGGER_PHRASE_2, TRIGGER_PHRASE_3."
license: MIT
metadata:
  author: YOUR_HANDLE
  version: '1.0'
  risk-level: "L1 — writes N files into the user's repo (LIST). No code execution, no secrets, no network calls. Fully reversible via git."
---

# TITLE

One-paragraph summary: what this adds, where it lives, and the fact that everything sits in
**user-owned paths** so upstream `git pull` never overwrites it.

## Inspirations

List every public source that informed this skill. For each entry: link the canonical URL, and
state precisely what it inspired or supplied (interaction, aesthetic, algorithm, tutorial,
asset pack). Distinguish inspiration from code/asset provenance. If you first encountered a
source via another site, label that as discovery only. Do **not** cite private or personal
provenance.

- [SOURCE_NAME](https://example.com/) — WHAT_IT_INSPIRED_OR_SUPPLIED.

## When to Use This Skill

Use when a Digital Garden (oleeskild `digital-garden` plugin + Eleventy) user wants:

- BULLET_1
- BULLET_2

Do **not** use for Quartz, Astro, or non-DG sites — the auto-include mechanism and theme tokens
are DG-specific.

## Quick Install (agent-driven, for non-technical users)

Hands-off flow, light explanations:

1. **Verify prerequisites** (below). If the repo doesn't match, say so plainly and stop.
2. **Copy** `assets/SOURCE` → `DEST_PATH`.
3. **Append** `assets/STYLES.scss` to `src/site/styles/custom-style.scss` (if styled).
4. **Pause and ask the user in plain language** for any values to customize (links, labels, URLs).
5. **Build** (`npm run build` or the dev server) and give a preview URL.
6. **Walk the user through** `references/verify.md` in everyday terms.
7. Only commit/push if the user asks.

## Prerequisites (verify first)

1. Repo uses the DG plugin with Eleventy; site source under `src/site/`.
2. User-component autoloading exists: `src/site/_data/dynamics.js` globs
   `components/user/common/<slot>/*.njk`, sorts alphabetically, injects into layout slots.
   Confirm the `SLOT` slot is iterated (`{% for imp in dynamics.common.SLOT %}`).
3. A user stylesheet is compiled — typically `src/site/styles/custom-style.scss`. (if styled)
4. DG theme tokens available: `--background-secondary`, `--background-modifier-border`,
   `--text-muted`, `--text-accent`, `--link-color`.

If any differs, adapt paths but keep the structure.

## Instructions

### 1. Install the component
Copy `assets/SOURCE` to `DEST_PATH`. Use a filename prefix (`zzz-`/`aaa-`) to control render
order within the slot. The autoloader picks it up with no layout edits.

### 2. Install the styles (if any)
Append `assets/STYLES.scss` to `src/site/styles/custom-style.scss`. Safe tunables live in the
`>>> TUNING KNOBS <<<` block at the top.

### 3. Customize
Describe exactly which lines the installer edits (links, labels, IDs).

### 4. Build + verify
```bash
npm run build   # or: npx @11ty/eleventy --serve
```
Run `references/verify.md`.

## Key Design Points

- **No layout / core edits** — autoload via `common/SLOT`; survives upstream updates.
- **Theme-token styling** — light/dark automatic via DG CSS variables.
- **A11y** — real text in `aria-label`, icons `aria-hidden`, keyboard-operable controls.
- **Tunables consolidated** — one `:root` knobs block; colors inherit theme (not knobs).

## Risk Level

**L1 (low).** Writes N user-owned files. No shell commands, no secrets, no network calls;
reversible via git. Review the assets before committing.

## Reference Files

- `references/component.md` — annotated markup + scripts.
- `references/styles.md` — annotated SCSS. (if styled)
- `references/tuning.md` — every adjustable knob.
- `references/verify.md` — post-build QA checklist.

## Assets

- `assets/SOURCE` — drop-in component (generic placeholders to customize).
- `assets/STYLES.scss` — drop-in styles. (if styled)
