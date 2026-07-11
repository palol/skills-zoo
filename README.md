# skills-zoo 🦓

A small menagerie of [Agent Skills](https://agentskills.io) — portable `SKILL.md` packages that
teach an AI coding agent (Claude Code, Cursor, etc.) to do a specific task. Clone one, hand it to
your agent, done.

📖 **Docs site:** https://palol.github.io/skills-zoo/

## Skills

| Skill | Docs | What it does | Risk |
|---|---|---|---|
| [`dg-floating-tray`](skills/dg-floating-tray/) | [docs](https://palol.github.io/skills-zoo/skills/dg-floating-tray/) | Adds a bottom floating dock + expandable tray (nav, theme toggle, search, social) to an Obsidian Digital Garden (Eleventy) site. Upstream-safe, no core edits. | L1 (writes 2 files, reversible) |
| [`dg-summon-cats`](skills/dg-summon-cats/) | [docs](https://palol.github.io/skills-zoo/skills/dg-summon-cats/) | Summons Greta and Nigel, two Neko pixel cats that visitors direct around an Obsidian Digital Garden by tapping or clicking. Local sprites, reduced-motion behavior, no core edits. | L1 (writes 3 files + appends styles, reversible) |
| [`dg-dungeon-map`](skills/dg-dungeon-map/) | [docs](https://palol.github.io/skills-zoo/skills/dg-dungeon-map/) | Adds an interactive hex-grid dungeon map to an Obsidian Digital Garden site — a π-driven spiral of your notes with a "you are here" marker and backlink/mention overlays from `graph.json`. | L2 (adds build scripts that read notes, reversible) |
| [`dg-indieweb`](skills/dg-indieweb/) | [docs](https://palol.github.io/skills-zoo/skills/dg-indieweb/) | Makes an Obsidian Digital Garden a first-class IndieWeb citizen: h-card + runtime h-entry microformats, webmention discovery + rel-me, a build-time `/webmentions/` display page with facepiles, and GitHub Actions to fetch received & send outgoing mentions. No plugin-core edits, no secrets in code. | L2 (build-time fetch + Actions run Node, env-gated network, reversible) |
| [`dg-obsifetch`](skills/dg-obsifetch/) | [docs](https://palol.github.io/skills-zoo/skills/dg-obsifetch/) | A neofetch-style vault-stats readout for an Obsidian Digital Garden — a tribute to `tabibyte/obsifetch`. Build-time analytics (files, sizes, orphans, links, theme) as a curl-able `/neofetch.txt` route and a footer card with ASCII art + live theme-color swatches. Read-only scan, no core edits. | L2 (build-time data file reads notes/files/img, read-only, reversible) |
| [`dg-graph-colors`](skills/dg-graph-colors/) | [docs](https://palol.github.io/skills-zoo/skills/dg-graph-colors/) | Colors an Obsidian Digital Garden's graph nodes and links by top-level folder instead of one flat theme color. The stock Pixi renderer already honors `node.color`; this populates it via a one-line wrap in the `_data` graph hook plus two additive helpers, with an optional footer legend. No plugin-core edits. | L2 (build-time transform on the graph object + one wrap line, read-only, reversible) |
| [`dg-random-note`](skills/dg-random-note/) | [docs](https://palol.github.io/skills-zoo/skills/dg-random-note/) | Adds a `/random` route to an Obsidian Digital Garden site that redirects visitors to a randomly chosen published note — a "surprise me" link. One self-contained page, no build scripts, no core edits. | L1 (adds one page file, reversible) |
| [`dg-skill-authoring`](skills/dg-skill-authoring/) | [docs](https://palol.github.io/skills-zoo/skills/dg-skill-authoring/) | Meta-skill: teaches an agent how to author a new upstream-safe Digital Garden skill — spec-compliant frontmatter, progressive disclosure, the seven DG invariants, validate & package. | L1 (scaffolds skill files, reversible) |

## Install a skill

> **Plan first, review always.** Agent Skills are instructions, not guarantees. Use your agent's
> **Plan tool** (or planning mode) before it changes files, and review the proposed approach.
> Check commands, permissions, changed files, and the final diff yourself before accepting or
> running anything. Risk labels are guidance, not a substitute for your review. Treat each skill
> as a **starting template**, then customize it for your project. The fun is in understanding and
> adapting it—not blindly copying it.

### Option A — hand it to your agent (no coding)

1. Clone this repo (or download a skill folder).
2. Drop the skill directory where your agent loads skills:
   - Claude Code: `~/.claude/skills/`
   - Shared / multi-agent: `~/.agents/skills/`
3. In your project, tell the agent: *"Use the `<skill-name>` skill to …"*.

### Option B — clone the whole zoo

**bash / macOS / Linux**

```bash
git clone https://github.com/palol/skills-zoo.git
cp -r skills-zoo/skills/dg-floating-tray ~/.claude/skills/
```

**PowerShell (Windows)**

```powershell
git clone https://github.com/palol/skills-zoo.git
Copy-Item -Recurse skills-zoo\skills\dg-floating-tray $HOME\.claude\skills\
```

### Option C — serve remotely over MCP

Point [Skills Over MCP](https://www.skillsovermcp.com/) at this repo and add one line to your MCP
client config — every skill becomes available to your agent, auto-updating on each push.

## Skill format

Each skill is a directory:

```
skills/<name>/
├── SKILL.md        # required — frontmatter (name, description, license, metadata) + instructions
├── assets/         # drop-in files the skill installs
└── references/     # deep-dive docs the agent reads on demand
```

Frontmatter follows the [agentskills.io](https://agentskills.io) spec — only `name`,
`description`, `license`, `compatibility`, `metadata`, `allowed-tools` at top level (custom keys
nest under `metadata:`). Validate any edit with `npx skills-ref validate skills/<name>/`
(the official [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) CLI).

Human-facing install pages and screenshots live under `docs/skills/<name>/` (not per-skill
READMEs). Agents should read `SKILL.md`; humans should prefer the [docs site](https://palol.github.io/skills-zoo/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The ship-gate checklist and authoring workflow live in
[`dg-skill-authoring`](skills/dg-skill-authoring/) — especially
[`references/authoring-workflow.md`](skills/dg-skill-authoring/references/authoring-workflow.md).

## License

MIT throughout — see root [`LICENSE`](LICENSE) and each skill's frontmatter `license: MIT`.
