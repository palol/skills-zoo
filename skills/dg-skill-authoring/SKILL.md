---
name: dg-skill-authoring
description: "Author a new Agent Skill that adds a feature to an Obsidian Digital Garden (oleeskild digital-garden plugin + Eleventy) site. Use when a user wants to package a Digital Garden customization — a component, widget, layout tweak, or style — as a reusable, upstream-safe SKILL.md that another DG user's agent can install. Produces a spec-compliant skill (frontmatter, progressive disclosure, references, assets), verifies it with agentskills validate, and follows the user-owned-paths convention so upstream git pull never clobbers it. Trigger on: make a digital garden skill, package this DG customization, write a skill for my digital garden, meta-skill, skill authoring, turn this into a skill."
license: MIT
metadata:
  author: palol
  version: '1.0'
  risk-level: "L1 — scaffolds and writes skill files (SKILL.md, references, assets) into a skills directory. No code execution beyond the local `agentskills validate` check, no secrets, no network calls. Fully reversible via git."
---

# Digital Garden Skill Authoring

A meta-skill: it teaches an agent how to **build another Agent Skill** that adds a feature to an
Obsidian [Digital Garden](https://github.com/oleeskild/digital-garden) (Eleventy) site — following
the upstream-safe, progressively-disclosed pattern proven by `dg-floating-tray`.

The output is a spec-compliant skill folder (`SKILL.md` + `assets/` + `references/`), validated
with `agentskills validate`, ready to drop into a skills repo or serve over MCP.

## When to Use This Skill

Use when a Digital Garden user wants to **package a DG customization as a reusable skill** —
e.g. "turn this floating dock into a skill", "make a skill for my custom callout", "write a skill
another DG user can install to add a guestbook widget".

Do **not** use to *install* an existing DG skill (that's the target skill's job), or to author
skills for non-DG stacks (Quartz, Astro, plain Eleventy) — the DG conventions below won't apply.

## The DG Skill Pattern (what "good" looks like)

Every DG feature skill this meta-skill produces must satisfy five invariants. These are the
lessons baked into `dg-floating-tray`:

1. **User-owned paths only.** Write into paths the DG plugin treats as user territory, so
   upstream `git pull` never overwrites them:
   - Components: `src/site/_includes/components/user/common/<slot>/*.njk`
   - Styles: append to `src/site/styles/custom-style.scss`
   - Helpers: `src/site/helpers/userUtils.js`
   - Notes/content: `src/site/notes/**`
   Never edit `layouts/*.njk`, plugin-core `components/*.njk`, or `_data/` internals.
2. **Autoload, don't wire.** DG's `src/site/_data/dynamics.js` globs
   `components/user/common/<slot>/*.njk`, sorts **alphabetically**, and injects into layout slots
   (`{% for imp in dynamics.common.<slot> %}`). To control render order use a filename prefix
   (`zzz-` = last, `aaa-` = first). No layout edit needed.
3. **Theme via tokens, not hardcoded color.** Style with DG theme variables
   (`--background-secondary`, `--background-modifier-border`, `--text-muted`, `--text-accent`,
   `--link-color`, `--input-shadow`) so light/dark works automatically. Colors are never a knob.
4. **Accessibility is not optional.** Real text in `aria-label`, `aria-hidden` on icons,
   `role="button"` + `tabindex="0"` + Enter/Space handlers for non-`<button>` controls, visible
   `:focus-visible`, and `prefers-reduced-motion` respected.
5. **Consolidate tunables.** Put every safe size/shape value in one `>>> TUNING KNOBS <<<`
   `:root` block at the top of the SCSS; derive everything else from it. Document each knob.

If a proposed feature can't respect invariants 1–2 (needs a core/layout edit), say so plainly and
scope it down or stop — don't ship a skill that breaks on upstream update.

## Instructions

Follow these steps to author a new DG feature skill. Read `references/authoring-workflow.md` for
the full annotated walkthrough; `references/dg-mechanics.md` for the plugin internals; and use
`assets/SKILL.template.md` as the starting frontmatter+body.

### 1. Scope the feature

Ask the user (briefly): what the feature is, which layout slot it belongs in (`footer`, `header`,
`sidebar`, …), and whether it needs styles, a helper, or content. Confirm it fits the
user-owned-paths model (invariant 1). Pick a skill `name` — lowercase, hyphens, prefixed `dg-`
by convention (e.g. `dg-callout-box`). Check the target repo/registry for an existing skill of
the same name first (avoid duplicates).

### 2. Scaffold the skill directory

```
dg-<feature>/
├── SKILL.md
├── assets/            ← drop-in files the target agent copies verbatim
└── references/        ← annotated docs, loaded on demand
```

Copy `assets/SKILL.template.md` to `dg-<feature>/SKILL.md` and fill it in.

### 3. Write the frontmatter (spec-compliant)

Only these top-level keys validate: `name`, `description`, `license`, `compatibility`,
`metadata`, `allowed-tools`. **Nest `author`, `version`, `risk-level`, `tags` under `metadata:`**
— top-level `version`/`author` fail `agentskills validate`. See `references/dg-mechanics.md`.

`description` is the **only field the agent reads to decide activation** — write it as a trigger:
first clause = what it does, then "Use when [X]" with concrete trigger phrases, plus a "Trigger
on: …" list of literal keywords. It's discovery metadata, not marketing.

### 4. Write the body (progressive disclosure)

Keep `SKILL.md` under ~500 lines. Structure: `When to Use` → `Prerequisites (verify first)` →
`Quick Install (agent-driven)` → step-by-step `Instructions` → `Key Design Points` →
`Risk Level` → `Reference Files` / `Assets`. Push verbose annotated source into `references/`
and link each with a read-me-when note. Assets are drop-in files, never auto-loaded.

Include a **Prerequisites** section that verifies the target repo is actually DG+Eleventy with
the autoloader present before touching anything (see `dg-floating-tray` for the model).

### 5. Populate assets + references

- `assets/` — the exact files the target agent will copy (`.njk` component, `.scss` styles) with
  generic placeholder links/URLs the installer customizes. Put the TUNING KNOBS block on top of
  any SCSS.
- `references/` — one file per concern: annotated markup/scripts, annotated styles, a `tuning.md`
  of every knob, and a `verify.md` post-build QA checklist. Mirror `dg-floating-tray`'s set.

### 6. Label the risk level

State an L0–L3 risk level in both the description and a `Risk Level` section. DG feature skills
that only write user-owned files with no shell/secrets/network are **L1** — say so explicitly so
installers can trust it.

### 7. Validate & package

```bash
agentskills validate dg-<feature>/          # pass the directory, not a file
cd .. && zip -r dg-<feature>.zip dg-<feature>   # bundled resources => zip the whole dir
```

SKILL.md-only skills can ship as the bare `.md`; anything with `assets/`/`references/` ships as a
zip of the whole directory. Keep it ≤100 files / ≤70 MB. Don't ship secrets or `node_modules`.

### 8. Add to the zoo + docs (this repo's pattern)

If publishing to `skills-zoo`:
1. Drop the folder in `skills/dg-<feature>/`.
2. Add a `<a class="skill-card">` block to `docs/index.html` and a
   `docs/skills/dg-<feature>/index.html` detail page (copy an existing one as a template).
3. Add a row to the README skills table.
4. Commit + push — the Pages workflow auto-deploys `docs/**`.

## Key Design Points

- **Meta, not installer** — this skill *produces* skills; it doesn't install features itself.
- **Invariants over templates** — the five invariants above are the real product; the template is
  a convenience. A skill that violates invariant 1 or 2 is broken regardless of how it looks.
- **Verified spec facts** — frontmatter rules and progressive disclosure come from the
  [agentskills.io](https://agentskills.io) spec; see `references/dg-mechanics.md` for citations.

## Risk Level

**L1 (low).** Scaffolds and writes skill files into a skills directory and runs the local
`agentskills validate` check. No other code execution, no secrets, no network calls. Reversible
via git. The skills it *produces* carry their own risk labels — enforce step 6.

## Reference Files

- `references/authoring-workflow.md` — full annotated walkthrough of steps 1–8 with examples.
- `references/dg-mechanics.md` — DG plugin internals (autoloader, slots, theme tokens, page modes)
  and the verified agentskills.io frontmatter/disclosure rules with sources.

## Assets

- `assets/SKILL.template.md` — starter frontmatter + body skeleton for a new DG feature skill.
