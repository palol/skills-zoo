# Contributing to skills-zoo

Thanks for helping grow the menagerie. This repo keeps **agent instructions** in
`skills/<name>/SKILL.md` and **human docs** in `docs/skills/<name>/` — please do not add
per-skill `README.md` files that duplicate either channel.

## Quick path

1. Read [`skills/dg-skill-authoring/SKILL.md`](skills/dg-skill-authoring/SKILL.md).
2. Follow the publish + ship-gate checklist in
   [`skills/dg-skill-authoring/references/authoring-workflow.md`](skills/dg-skill-authoring/references/authoring-workflow.md).
3. Keep catalog order aligned across `README.md` and `docs/index.html`.
4. Capture real dark/light previews at 900×560 (or 2× retina) for any new feature skill.
5. Run validation before opening a PR:

```bash
npx skills-ref validate skills/<name>/
node scripts/check-zoo.mjs
```

## What to update when adding a skill

| Layer | Path |
|---|---|
| Agent package | `skills/dg-<feature>/` (`SKILL.md`, `assets/`, `references/`) |
| Docs card | `docs/index.html` |
| Docs detail page | `docs/skills/dg-<feature>/index.html` |
| Preview pair | `docs/skills/dg-<feature>/preview-{dark,light}.png` |
| Catalog row | `README.md` skills table |

## Conventions

- Frontmatter must stay [agentskills.io](https://agentskills.io)-valid; nest custom keys under `metadata:`.
- Prefer the section shape in [`skills/dg-skill-authoring/assets/SKILL.template.md`](skills/dg-skill-authoring/assets/SKILL.template.md).
- Use `author: palol` and a descriptive `metadata.risk-level` string (not a bare `L2`).
- Include a short **Validate & Package** footer in each feature skill.
- License is MIT for the whole zoo (root `LICENSE` + per-skill frontmatter).
