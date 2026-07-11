# DG Mechanics + Agent-Skills Spec (reference)

Read when authoring a DG feature skill. Two parts: (A) how the Digital Garden plugin loads user
customizations, and (B) the verified agentskills.io rules a skill must satisfy.

---

## A. Digital Garden plugin internals

Stack: Obsidian [`digital-garden`](https://github.com/oleeskild/digital-garden) plugin +
Eleventy (v3), site source under `src/site/`.

### User-owned vs. upstream paths

The plugin ships its own layouts and components; those get overwritten on `git pull`. Anything
under these paths is **yours** and survives updates:

| Concern    | User-owned path                                         |
|------------|---------------------------------------------------------|
| Components | `src/site/_includes/components/user/common/<slot>/*.njk` |
| Styles     | `src/site/styles/custom-style.scss` (append / `@use`)    |
| Helpers    | `src/site/helpers/userUtils.js`                          |
| Content    | `src/site/notes/**`                                      |

Never edit: `layouts/*.njk`, plugin-core `components/*.njk`, `_data/` internals. If a feature
requires one of these, it can't be a clean upstream-safe skill — scope it down or stop.

### The autoloader (`src/site/_data/dynamics.js`)

Globs `components/user/common/<slot>/*.njk`, sorts filenames **alphabetically**, and exposes them
as `dynamics.common.<slot>`. Layout templates iterate the slot:

```njk
{% for imp in dynamics.common.footer %}{% include imp %}{% endfor %}
```

Consequences for a skill author:
- **Drop-in, no wiring.** Placing a `.njk` in the right slot folder is the entire install — no
  layout edit.
- **Order = filename.** Alphabetical sort means a prefix controls render order: `zzz-` renders
  last, `aaa-` first. `dg-floating-tray` uses `zzz-floating-dock.njk` to sit at the bottom.
- **Slots** are the subfolders under `common/` (e.g. `footer`, `header`, sidebar-like regions).
  Confirm the target slot is actually iterated in the layouts before relying on it.

### Theme tokens (light/dark for free)

Style with DG CSS variables so both themes work automatically — never hardcode colors:
`--background-secondary`, `--background-modifier-border`, `--text-muted`, `--text-accent`,
`--link-color`, `--input-shadow`. Color is therefore never a tuning knob; sizes/shapes are.

### Page modes (context, rarely needed by a skill)

DG sites can set a `data-mode` on `<html>` (e.g. porch / atlas / note) to switch page styling.
Most footer/header components are mode-agnostic; only scope styles to a mode if the feature is
mode-specific.

---

## B. Agent-Skills spec — verified rules

Source: the open [agentskills.io](https://agentskills.io) spec.

### Frontmatter — only these top-level keys validate

| Field | Notes |
|---|---|
| `name` | **required** — 1–64 chars, lowercase alphanumeric + hyphens, must match dir name, no leading/trailing/consecutive hyphens |
| `description` | **required** — 1–1024 chars; quote it (colons/specials break YAML) |
| `license` | optional |
| `compatibility` | optional — env requirements, ≤500 chars |
| `metadata` | optional — nest any custom keys here |
| `allowed-tools` | optional (experimental) |

**Common mistake:** `version`, `author`, `tags`, `risk-level` are **not** top-level fields.
Putting them at top level fails `skills-ref validate`. Nest them under `metadata:`.

**`description` is the only field the agent reads to decide activation.** Write it as a trigger
condition: what it does, then "Use when [X]" + concrete trigger phrases + a "Trigger on: …" list.
It's discovery metadata, not marketing.

### Progressive disclosure (3 levels)

| Level | What loads | When |
|---|---|---|
| L1 Metadata | `name` + `description` (~100 tokens) | Always, at startup |
| L2 Instructions | `SKILL.md` body | When the skill matches the task |
| L3 Resources | `references/`, `scripts/`, `assets/` | Only when explicitly referenced |

Keep the body <500 lines; overflow into `references/` with read-me-when notes. Assets are never
auto-loaded into context.

### Validate & package

- `skills-ref validate <skill-dir>/` — pass the **directory**, not a single file.
- SKILL.md-only → ship the bare `.md`. Any bundled files → **zip the whole directory**
  (`.zip`, not tar). Keep ≤100 files / ≤70 MB. Never ship secrets or `node_modules`.

### Risk levels

Label L0 (read-only) → L3 (arbitrary code exec / financial / root). A ~Feb 2026 study of ~40k
skills sampled from skills.sh found ~9% classified L3
([Hugging Face, zhongshsh](https://huggingface.co/blog/zhongshsh/agent-skills-analysis)) — so
installers rightly distrust unlabeled skills. Clean DG feature skills that only write user-owned
files with no shell/secrets/network are **L1**; state it in both description and body.

### Distribution

- **Git** = source of truth (clone into `~/.claude/skills/` or a shared `~/.agents/skills/`).
- **CLI** installers exist (e.g. Vercel Labs `agent-skills`).
- **Remote via MCP:** serve a GitHub skills repo with
  [Skills Over MCP](https://www.skillsovermcp.com/) — one `mcpServers` config line, auto-updates
  on push, `skill://` URIs per the SEP-2640 Skills Extension with a tool-shim fallback.
