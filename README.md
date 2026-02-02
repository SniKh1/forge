# Forge

**Production-ready configuration framework for Claude Code.**

> [everything-claude-code](https://github.com/affaan-m/everything-claude-code) + [Trellis](https://github.com/mindfold-ai/Trellis), unified and ready to use.

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## What is Forge?

Forge packages community best practices and structured pipelines into a single, installable configuration for Claude Code.

| Feature | Description |
|---------|-------------|
| 50+ Skills | Frontend, backend, debugging, docs, DevOps, multimedia |
| 16 Agents | Three-layer architecture (Pipeline + Interactive + Built-in) |
| 34+ Commands | Slash command shortcuts for common workflows |
| 8 Rules | Security, coding style, testing, Git conventions |
| 3 Contexts | dev / review / research mode switching |
| Trellis Pipeline | Hook-driven multi-agent parallel development |
| Auto-learning | Extract reusable patterns as instincts from sessions |

---

## Quick Start

### Windows (PowerShell)

```powershell
git clone https://github.com/SniKh1/forge.git $env:TEMP\forge
& $env:TEMP\forge\install.ps1
```

### macOS / Linux

```bash
git clone https://github.com/SniKh1/forge.git /tmp/forge
bash /tmp/forge/install.sh
```

The installer will: backup existing config → copy files → apply templates → optionally install Skills.

---

## Architecture

```
~/.claude/
├── CLAUDE.md              # Core routing table
├── CAPABILITIES.md        # Full capability index
├── USAGE-GUIDE.md         # Usage guide
├── agents/                # 10 Agent definitions
├── commands/trellis/      # 14 Trellis commands
├── contexts/              # 3 context modes
├── hooks/                 # Hook scripts
├── rules/                 # 8 behavior rules
├── stacks/                # Tech stack specs
├── scripts/               # Automation scripts
├── skills/                # 50+ Skills (optional install)
└── .trellis/              # Trellis pipeline config
    └── spec/guides/       # 11 detailed guides
```

---

## Agents

Three-layer architecture:

| Layer | Agents | Role |
|-------|--------|------|
| Pipeline (Trellis) | implement, check, debug, research, dispatch, plan | Hook-driven automation |
| Interactive | planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner | On-demand, full dev lifecycle |
| Built-in | Explore, Plan, Bash, general-purpose | Claude Code native |

## Skills (50+)

- **Frontend**: frontend-design, aesthetic, web-frameworks, ui-styling, theme-factory
- **Backend**: backend-development, databases, better-auth
- **Debugging**: systematic-debugging, build-fix, break-loop
- **Docs**: doc-coauthoring, changelog-generator, pdf, docx, pptx, xlsx
- **DevOps**: devops, repomix, mcp-builder
- **Multimedia**: ai-multimodal, media-processing, algorithmic-art, canvas-design
- **Workflow**: continuous-learning, sequential-thinking, strategic-compact, eval-harness

## Commands

```
/plan          — Requirements analysis + implementation plan
/tdd           — Test-driven development
/code-review   — Code review
/build-fix     — Build error resolution
/e2e           — End-to-end testing
/learn         — Extract reusable patterns
/evolve        — Evolve instincts
```

See `commands/` for the full list.

---

## Customization

**Add a tech stack spec** — Create `<stack>.md` in `stacks/`, reference it in `CLAUDE.md`.

**Add a rule** — Create `.md` in `rules/`. Claude Code loads it automatically.

**Add a command** — Create `.md` in `commands/`. Invoke via `/command-name`.

**Add MCP servers** — Edit `.mcp.json` locally. The template only includes universal servers.

---

## FAQ

**Will this overwrite my existing config?**
The installer asks before doing anything. Choose to backup and your current config is saved to `~/.claude-backup-<timestamp>/`.

**Why aren't Skills included in the repo?**
The Skills directory contains 5000+ files. The installer optionally pulls them from [everything-claude-code](https://github.com/affaan-m/everything-claude-code).

**How do I update?**
Re-run the install script. It backs up and overwrites.

---

## Credits

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — Skills, Agents, Commands, Rules
- **[Trellis](https://github.com/mindfold-ai/Trellis)** — Multi-agent pipeline, spec/guides, Worktree management

---

## License

MIT. See [LICENSE](LICENSE).