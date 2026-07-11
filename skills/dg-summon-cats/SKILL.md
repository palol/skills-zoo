---
name: dg-summon-cats
description: "Summon two pixel cats, Greta and Nigel, into an Obsidian Digital Garden (Eleventy) site. Visitors tap or click anywhere to direct the bonded cats across the viewport; they walk, idle, sleep, and scratch using Neko sprite animations. Use when a Digital Garden user wants roaming pixel pets, desktop cats, Neko cats, or the Greta and Nigel interaction from the wedding site. Upstream-safe, theme-independent, and no core/layout edits. Trigger on: summon cats, pixel cats, Neko cats, roaming pets, Greta and Nigel, desktop pet."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L1 — writes one user-owned footer component, appends user styles, and copies two local sprite sheets. No network calls, secrets, or plugin-core edits. Fully reversible via git."
---

# Summon Greta and Nigel

Adds two decorative pixel cats to every page of an Obsidian Digital Garden:

- **Greta** — cream/spirit sprite, slower and slightly clumsy.
- **Nigel** — gray sprite, faster.
- Tap or click anywhere and both cats travel toward that point.
- When left alone they idle, sleep, scratch themselves, or scratch a nearby viewport edge.

The behavior is adapted from the Greta and Nigel cats on the wedding site. Everything installs
into user-owned paths, so upstream Digital Garden updates do not overwrite it.

## When to Use This Skill

Use when a Digital Garden user asks for roaming pixel pets, Neko-style desktop cats, or the
Greta and Nigel interaction. Do not use this exact install flow for Quartz, Astro, or generic
sites; those stacks need different component and asset paths.

## Quick Install (agent-driven)

1. Verify the prerequisites below.
2. Copy `assets/zzz-summon-cats.njk` to
   `src/site/_includes/components/user/common/footer/zzz-summon-cats.njk`.
3. Append `assets/summon-cats.scss` to `src/site/styles/custom-style.scss`.
4. Copy `assets/greta-neko.png` and `assets/nigel-neko.png` to `src/site/img/user/`.
5. Build the site and run `references/verify.md`.
6. Only commit or push if the user asks.

## Prerequisites (verify first)

1. The target is an oleeskild Digital Garden + Eleventy repo with source under `src/site/`.
2. `src/site/_data/dynamics.js` autoloads
   `components/user/common/footer/*.njk`, and the layout iterates that footer slot.
3. `src/site/styles/custom-style.scss` is compiled by the site.
4. `.eleventy.js` passes `src/site/img` through to `/img`.

If paths differ, adapt them without editing plugin-core layouts.

## Instructions

### 1. Install the component

Copy:

```text
assets/zzz-summon-cats.njk
→ src/site/_includes/components/user/common/footer/zzz-summon-cats.njk
```

The `zzz-` prefix keeps the behavior late in the alphabetically sorted footer slot. The
component creates the two decorative elements at runtime; it adds no visible page markup.

### 2. Install the styles

Append `assets/summon-cats.scss` to `src/site/styles/custom-style.scss`. Keep the tuning block
together. The cats use no theme colors, so their sprites remain faithful in light and dark mode.

### 3. Install the sprites

Copy both PNGs into `src/site/img/user/`:

```text
greta-neko.png
nigel-neko.png
```

The component expects `/img/user/greta-neko.png` and `/img/user/nigel-neko.png`. If the target
uses a different public image path, update the two constants near the top of the component.

### 4. Build and verify

```bash
npm run build
```

Follow `references/verify.md`, including pointer, resize, reduced-motion, and mobile checks.

## Key Design Points

- **Upstream-safe** — footer autoload, user stylesheet, and user image directory only.
- **Local sprites** — no runtime CDN or network dependency.
- **Unified input** — one `pointerdown` listener handles mouse, pen, and touch without duplicate
  touch/click events.
- **Decorative and non-blocking** — cats are `aria-hidden`, ignore pointer events, and sit above
  the page without intercepting controls.
- **Reduced motion** — with `prefers-reduced-motion: reduce`, cats jump to the requested position
  and remain idle instead of continuously animating.
- **Single instance** — a global guard prevents duplicate cats if the component initializes twice.

## Reference Files

- `references/architecture.md` — runtime lifecycle, sprite atlas layout, and adaptation notes.
- `references/tuning.md` — safe speed, size, timing, and start-position adjustments.
- `references/verify.md` — build and browser QA checklist.

## Assets

- `assets/zzz-summon-cats.njk` — drop-in runtime component.
- `assets/summon-cats.scss` — positioning, rendering, focus-safe behavior, and tuning knobs.
- `assets/greta-neko.png` — cream/spirit 8×4 Neko sprite atlas.
- `assets/nigel-neko.png` — gray 8×4 Neko sprite atlas.

## Risk Level

**L1 (low).** Installs one user-owned component, appends user CSS, and copies two local PNGs.
The script listens for pointer and resize events and runs local animation frames in the browser.
It sends no data, makes no network requests, reads no secrets, and is removed by deleting those
three installed files plus the appended style block.

## Validate & Package

```bash
npx skills-ref validate skills/dg-summon-cats/
cd .. && zip -r dg-summon-cats.zip dg-summon-cats
```

Ship the complete directory so the two sprite sheets remain with the skill.
