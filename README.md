# skills-zoo 🦓

A small menagerie of [Agent Skills](https://agentskills.io) — portable `SKILL.md` packages that
teach an AI coding agent (Claude Code, Cursor, etc.) to do a specific task. Clone one, hand it to
your agent, done.

📖 **Docs site:** https://palol.github.io/skills-zoo/

## Skills

| Skill | What it does | Risk |
|---|---|---|
| [`dg-floating-tray`](skills/dg-floating-tray/) | Adds a bottom floating dock + expandable tray (nav, theme toggle, search, social) to an Obsidian Digital Garden (Eleventy) site. Upstream-safe, no core edits. | L1 (writes 2 files, reversible) |

## Install a skill

### Option A — hand it to your agent (no coding)

1. Clone this repo (or download a skill folder).
2. Drop the skill directory where your agent loads skills:
   - Claude Code: `~/.claude/skills/`
   - Shared / multi-agent: `~/.agents/skills/`
3. In your project, tell the agent: *"Use the `<skill-name>` skill to …"*.

### Option B — clone the whole zoo

```bash
git clone https://github.com/palol/skills-zoo.git
cp -r skills-zoo/skills/dg-floating-tray ~/.claude/skills/
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
nest under `metadata:`). Validate any edit with `agentskills validate skills/<name>/`.

## License

MIT — see individual skills for details.
