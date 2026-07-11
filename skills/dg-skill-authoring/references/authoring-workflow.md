# Authoring Workflow (annotated)

The full walkthrough for producing a DG feature skill, step by step, mirroring how
`dg-floating-tray` was built. Read alongside `dg-mechanics.md`.

---

## 0. Before you start — is this a skill?

A DG customization is a good skill candidate when it (a) fits entirely in user-owned paths,
(b) is generic enough that another DG user would want it, and (c) has a clear trigger. If it's a
one-off hack that needs a core/layout edit, it's not upstream-safe — don't package it.

## 1. Scope

Nail down, in one short exchange with the user:
- **Feature** — what it adds, in one sentence.
- **Slot** — `footer` / `header` / sidebar-like region. Confirm the slot is iterated in layouts.
- **Surface area** — component only? + styles? + a helper? + content?
- **Name** — `dg-<feature>`, lowercase, hyphens, matches the dir name. Check for an existing
  same-named skill in the target repo/registry first (the ecosystem has heavy duplication).

## 2. Scaffold

```
dg-<feature>/
├── SKILL.md
├── assets/
└── references/
```

Copy `assets/SKILL.template.md` (from this meta-skill) to `dg-<feature>/SKILL.md`.

## 3. Frontmatter

Fill the template frontmatter. Enforce spec rules from `dg-mechanics.md §B`:
- top-level only `name`/`description`/`license`/`compatibility`/`metadata`/`allowed-tools`;
- `author`/`version`/`risk-level`/`tags` under `metadata:`;
- `description` written as a trigger with a literal "Trigger on: …" list;
- quote the `description` (it contains colons/commas).

Example (from `dg-floating-tray`):

```yaml
description: "Add a bottom floating dock + expandable tray to an Obsidian Digital Garden
  (Eleventy) site. Use when a user of the oleeskild digital-garden plugin wants a fixed bottom
  navigation control… Trigger on: floating dock, floating tray, bottom nav bar, mobile dock,
  digital garden navigation UI."
```

## 4. Body

Sections, in order: `When to Use` → `Quick Install (agent-driven)` → `Prerequisites (verify
first)` → `Instructions` (numbered) → `Key Design Points` → `Risk Level` → `Reference Files` /
`Assets`. Keep <500 lines; move annotated source to `references/`.

The **Prerequisites** section is load-bearing: it makes the target agent confirm the repo is
DG+Eleventy with the autoloader present before writing anything, and stop cleanly if not.

Bake in the five invariants (see the meta-skill body): user-owned paths, autoload-by-prefix,
theme tokens, a11y, consolidated knobs.

## 5. Assets + references

**Assets** = the literal files the installing agent copies:
- `.njk` component with generic placeholder links/URLs the installer swaps in.
- `.scss` styles with a `>>> TUNING KNOBS <<<` `:root` block on top; derive all sizes from it;
  verify it compiles (`sass` / the site build) before shipping.

**References** — one file per concern, each linked from SKILL.md with a read-me-when note:
- `component.md` — annotated markup + any inline `<script>` blocks (event wiring, a11y).
- `styles.md` — annotated SCSS (base/desktop, responsive math, breakpoints).
- `tuning.md` — every adjustable knob, with defaults and effects.
- `verify.md` — post-build QA checklist in plain language ("tap the button — does X happen?").

## 6. Risk level

Assign L0–L3 (see `dg-mechanics.md §B`). Clean DG feature skills = **L1**. State it in the
description AND a `Risk Level` section, listing exactly which files it writes.

## 7. Validate & package

```bash
skills-ref validate dg-<feature>/
cd .. && zip -r dg-<feature>.zip dg-<feature>
```

Fix any validation errors (usually: unquoted description, or custom keys at top level). Bundled
resources ⇒ ship the zip; SKILL.md-only ⇒ ship the `.md`.

## 8. Publish to skills-zoo + docs

1. `skills/dg-<feature>/` — the skill folder.
2. `docs/index.html` — add a `<a class="skill-card">` block (name, version, risk pill, tags,
   one-line description).
3. `docs/skills/dg-<feature>/index.html` — copy an existing detail page as a template; update
   title, description, install steps, tuning, a11y, file manifest, prerequisites.
4. Build the target Digital Garden and complete the feature's `references/verify.md` checks.
   Capture the actual rendered feature in dark and light themes at 900×560, then save the pair as
   `docs/skills/dg-<feature>/preview-dark.png` and `preview-light.png`. The index card and detail
   page must reference these files. Use real content and real feature state: do not use generated
   art, reconstructed UI, invented data, or hand-built mockups.
5. Inspect both captures before publishing: the feature is legible, the two files genuinely show
   their respective themes, and every visible label, count, icon, and control came from the built
   site.
6. `README.md` — add a row to the skills table.
7. Commit + push. The Pages workflow (`.github/workflows/pages.yml`) auto-deploys on `docs/**`.

## Checklist (ship gate)

- [ ] Fits user-owned paths; no core/layout edits.
- [ ] Autoloads via slot + filename prefix (no layout wiring).
- [ ] Styles use DG theme tokens; colors not knobs.
- [ ] A11y: aria-label/aria-hidden, keyboard-operable, focus-visible, reduced-motion.
- [ ] Tunables consolidated in one knobs block; SCSS compiles clean.
- [ ] Frontmatter spec-valid (`skills-ref validate` passes); description is a trigger.
- [ ] Risk level labeled in description + body.
- [ ] references/ + assets/ complete; SKILL.md <500 lines.
- [ ] Real 900×560 dark/light feature captures added; no generated or reconstructed product UI.
- [ ] Added to zoo README + docs site (card + detail page + paired previews).
