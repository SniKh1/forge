# Forge

**Production-ready configuration framework for Claude Code.**

> [everything-claude-code](https://github.com/affaan-m/everything-claude-code) + [superpowers](https://github.com/obra/superpowers) + [Trellis](https://github.com/mindfold-ai/Trellis), unified and ready to use.

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## What is Forge?

Forge packages community best practices and structured pipelines into a single, installable configuration for Claude Code. Skills are installed on-demand by role — no more downloading 79MB of files you'll never use.

| Feature | Description |
|---------|-------------|
| 66 Skills | Modular install by role — frontend, backend, Java, Python, Go, etc. |
| 16 Agents | Three-layer architecture (Pipeline + Interactive + Built-in) |
| 34 Commands | Slash command shortcuts for common workflows |
| 8 Rules | Security, coding style, testing, Git conventions |
| 3 Contexts | dev / review / research mode switching |
| 8 Role Presets | fullstack, frontend-dev, backend-dev, java-dev, python-dev, etc. |
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

The installer will: backup existing config → copy files → apply templates → select and install Skill modules.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (for Skill installer and hooks)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and authenticated

---

## Skill Modules

Skills are organized into modules. Pick a role preset or choose individual modules.

### Role Presets

| Preset | Modules | Skills |
|--------|---------|--------|
| fullstack | core + frontend + backend + docs + testing | 41 |
| frontend-dev | core + frontend + testing + docs | 38 |
| backend-dev | core + backend + testing + docs | 34 |
| java-dev | core + backend + java + testing + docs | 40 |
| python-dev | core + backend + python + ai-ml + docs | 39 |
| security-eng | core + security + testing | 26 |
| devops-eng | core + security + docs | 31 |
| all | everything | 66 |

### Modules

| Module | Skills | Includes |
|--------|--------|----------|
| core (always) | 22 | superpowers, continuous-learning, tdd-workflow, coding-standards, etc. |
| frontend | 7 | frontend-design, frontend-patterns, theme-factory, canvas-design, etc. |
| backend | 3 | backend-patterns, postgres-patterns, clickhouse-io |
| java | 6 | java-coding-standards, jpa-patterns, springboot-* |
| python | 6 | python-patterns, django-*, python-testing |
| golang | 2 | golang-patterns, golang-testing |
| security | 2 | security-review, security-scan |
| docs | 7 | doc-coauthoring, docx, pdf, pptx, xlsx, etc. |
| testing | 2 | webapp-testing, cpp-testing |
| ai-ml | 1 | notebooklm |
| mcp | 1 | mcp-builder |
| extras | 7 | obsidian-skills, skill-creator, planning-with-files, etc. |

### Install Skills Separately

```bash
# Interactive mode
bash ~/.claude/scripts/install-skills.sh

# CLI mode
bash ~/.claude/scripts/install-skills.sh --preset fullstack
bash ~/.claude/scripts/install-skills.sh --modules frontend,backend,docs
bash ~/.claude/scripts/install-skills.sh --list
```

```powershell
# PowerShell
& ~/.claude/scripts/install-skills.ps1
& ~/.claude/scripts/install-skills.ps1 --preset fullstack
```

---

## After Installation

Once installed, just use Claude Code as usual. Forge is loaded automatically from `~/.claude/`.

```bash
claude

/plan          # Create an implementation plan
/tdd           # Test-driven development workflow
/code-review   # Review your code
/build-fix     # Fix build errors
/e2e           # End-to-end testing
/learn         # Extract reusable patterns
/evolve        # Evolve instincts
```

Claude Code will automatically:
- Route tasks to the appropriate Agent based on context
- Apply coding style, security, and testing rules
- Invoke matching Skills when relevant keywords are detected
- Track reusable patterns via the auto-learning system

---

## Architecture

```
~/.claude/
├── CLAUDE.md              # Core routing table
├── agents/                # 16 Agent definitions
│   ├── (Pipeline)         # implement, check, debug, research, dispatch, plan
│   └── (Interactive)      # planner, architect, tdd-guide, code-reviewer, ...
├── commands/              # 20 commands + 14 Trellis commands
├── contexts/              # 3 context modes (dev / review / research)
├── hooks/                 # Hook scripts
├── rules/                 # 8 behavior rules
├── stacks/                # Tech stack specs (frontend, java, python)
├── scripts/
│   ├── install-skills.*   # Skill module installer
│   └── lib/               # skills-registry.json + modules.json
├── skills/                # Installed skill modules (dynamic)
│   └── learned/           # Auto-learned patterns (preserved across installs)
└── .trellis/              # Trellis pipeline config
    └── spec/guides/       # Detailed guides
```

---

## Agents

| Layer | Agents | Role |
|-------|--------|------|
| Pipeline (Trellis) | implement, check, debug, research, dispatch, plan | Hook-driven automation |
| Interactive | planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner, database-reviewer, doc-updater, refactor-cleaner | On-demand, full dev lifecycle |
| Built-in | Explore, Plan, Bash, general-purpose | Claude Code native |

---

## Customization

**Add a tech stack spec** — Create `<stack>.md` in `stacks/`, reference it in `CLAUDE.md`.

**Add a rule** — Create `.md` in `rules/`. Claude Code loads it automatically.

**Add a command** — Create `.md` in `commands/`. Invoke via `/command-name`.

**Add MCP servers** — Edit `.mcp.json` locally. The template only includes universal servers.

---

## FAQ

**Will this overwrite my existing config?**
The installer asks before doing anything. Your current config is saved to `~/.claude-backup-<timestamp>/`.

**Where do Skills come from?**
Skills are downloaded on-demand from [anthropics/skills](https://github.com/anthropics/skills), [obra/superpowers](https://github.com/obra/superpowers), and [everything-claude-code](https://github.com/affaan-m/everything-claude-code). Only the modules you select are installed.

**How do I update?**
Re-run the install script. It backs up and overwrites. Run `install-skills.sh` again to update skills.

**Can I add more skills later?**
Yes. Run `install-skills.sh --modules <module>` to add modules, or `install-skills.sh` for the interactive menu.

---

## Credits

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — Skills, Agents, Commands, Rules
- **[superpowers](https://github.com/obra/superpowers)** — Core workflow Skills
- **[Trellis](https://github.com/mindfold-ai/Trellis)** — Multi-agent pipeline, spec/guides, Worktree management

---

## License

MIT. See [LICENSE](LICENSE).
