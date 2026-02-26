# Forge

**A batteries-included configuration framework for Claude Code.**

Forge packages community best practices into a ready-to-install Claude Code setup. Skills are installed on demand by role — no more downloading 79 MB of files you'll never use.

<p align="center">
  <a href="README.zh-CN.md">简体中文</a> | English
</p>

---

## What's Inside

| Component | Count | Description |
|-----------|-------|-------------|
| Skills | 66 | Modular, on-demand — frontend, backend, Java, Python, Go, security, docs… |
| Agents | 10 | Interactive agents covering the full dev lifecycle |
| Commands | 20 | Slash-command shortcuts for common workflows |
| Rules | 8 | Security, code style, testing, Git conventions |
| Contexts | 3 | dev / review / research mode switching |
| Stacks | 3 | Tech-stack guides (frontend, Java, Python) |
| Role Presets | 8 | fullstack, frontend-dev, backend-dev, java-dev, python-dev, and more |

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

The installer will: back up your existing config → copy files → replace template variables → optionally install Skill modules.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (required by the Skill installer and hooks)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI, installed and authenticated

---

## Skill Modules

Skills are organized into 12 modules. Pick a role preset, or mix and match modules yourself.

### Role Presets

| Preset | Modules Included | Skills |
|--------|-----------------|--------|
| `fullstack` | core + frontend + backend + docs + testing | 41 |
| `frontend-dev` | core + frontend + testing + docs | 38 |
| `backend-dev` | core + backend + testing + docs | 34 |
| `java-dev` | core + backend + java + testing + docs | 40 |
| `python-dev` | core + backend + python + ai-ml + docs | 39 |
| `security-eng` | core + security + testing | 26 |
| `devops-eng` | core + security + docs | 31 |
| `all` | every module | 66 |

### Module Breakdown

| Module | Skills | Highlights |
|--------|--------|------------|
| core (always installed) | 22 | superpowers, continuous-learning, tdd-workflow, coding-standards, verification-loop |
| frontend | 7 | frontend-design, frontend-patterns, theme-factory, canvas-design, algorithmic-art |
| backend | 3 | backend-patterns, postgres-patterns, clickhouse-io |
| java | 6 | java-coding-standards, jpa-patterns, springboot-patterns/security/tdd/verification |
| python | 6 | python-patterns, python-testing, django-patterns/security/tdd/verification |
| golang | 2 | golang-patterns, golang-testing |
| security | 2 | security-review, security-scan |
| docs | 7 | doc-coauthoring, docx, pdf, pptx, xlsx, internal-comms, nutrient-document-processing |
| testing | 2 | webapp-testing, cpp-testing |
| ai-ml | 1 | notebooklm |
| mcp | 1 | mcp-builder |
| extras | 7 | obsidian-skills, skill-creator, planning-with-files, slack-gif-creator |

### Install Skills Separately

```bash
# Interactive mode — choose preset or modules from a menu
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

Just use Claude Code as usual — Forge loads automatically from `~/.claude/`.

```bash
claude

/plan          # Create an implementation plan
/tdd           # Test-driven development
/code-review   # Code review
/build-fix     # Fix build errors
/e2e           # End-to-end testing
/learn         # Extract reusable patterns
/evolve        # Evolve instincts
```

Claude Code will automatically:
- Route tasks to the right Agent based on context
- Enforce code style, security, and testing rules
- Detect keywords and invoke matching Skills
- Track reusable patterns via the continuous-learning system

---

## Project Structure

```
~/.claude/
├── CLAUDE.md              # Core routing table and principles
├── agents/                # 10 interactive agents
├── commands/              # 20 slash commands
├── contexts/              # 3 context modes (dev / review / research)
├── hooks/                 # Hook scripts and templates
├── rules/                 # 8 behavioral rules
├── stacks/                # Tech-stack guides (frontend, java, python)
├── scripts/
│   ├── install-skills.*   # Skill module installer (bash + PowerShell)
│   └── lib/               # skills-registry.json + modules.json
├── skills/                # Installed skill modules (on-demand)
│   └── learned/           # Auto-learned patterns (preserved across installs)
├── settings.json.template
└── mcp.json.template
```

---

## Agents

| Agent | Purpose |
|-------|---------|
| planner | Break down complex features into implementation plans |
| architect | System design and architectural decisions |
| tdd-guide | Test-driven development — write tests first, then implement |
| code-reviewer | Post-implementation code review |
| security-reviewer | Security analysis before commits |
| build-error-resolver | Diagnose and fix build failures |
| e2e-runner | End-to-end testing with Playwright |
| database-reviewer | Database schema and query optimization |
| doc-updater | Keep documentation in sync with code |
| refactor-cleaner | Dead code cleanup and consolidation |

---

## Customization

**Add a tech-stack guide** — Create `<stack>.md` in `stacks/`, reference it in `CLAUDE.md`.

**Add a rule** — Drop a `.md` file into `rules/`. Claude Code picks it up automatically.

**Add a command** — Drop a `.md` file into `commands/`. Invoke it with `/command-name`.

**Add an MCP server** — Edit your local `.mcp.json`. The template ships with common servers only.

---

## FAQ

**Will this overwrite my existing config?**
The installer asks for confirmation first. Your existing config is backed up to `~/.claude-backup-<timestamp>/`.

**Where do Skills come from?**
Downloaded on demand from [anthropics/skills](https://github.com/anthropics/skills), [obra/superpowers](https://github.com/obra/superpowers), [everything-claude-code](https://github.com/affaan-m/everything-claude-code), and a few standalone repos. Only the modules you choose are installed.

**How do I update?**
Re-run the install script — it backs up and overwrites. Run `install-skills.sh` again to update Skills.

**Can I add more Skills later?**
Yes. Run `install-skills.sh --modules <module>` to add a module, or run it without arguments for the interactive menu.

---

## Skill Sources

Skills are fetched from these open-source repositories:

| Source | Repository | Skills |
|--------|-----------|--------|
| Superpowers | [obra/superpowers](https://github.com/obra/superpowers) | 14 |
| Anthropic Skills | [anthropics/skills](https://github.com/anthropics/skills) | 16 |
| Everything Claude Code | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 32 |
| NotebookLM | [PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill) | 1 |
| Obsidian Skills | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 1 |
| Planning with Files | [ryanmac/planning-with-files](https://github.com/ryanmac/planning-with-files) | 1 |
| Skill Prompt Generator | [disler/skill-prompt-generator](https://github.com/disler/skill-prompt-generator) | 1 |

---

## Credits

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — Skills, Agents, Commands, Rules
- **[superpowers](https://github.com/obra/superpowers)** — Core workflow Skills

---

## License

MIT. See [LICENSE](LICENSE).
