# Forge

**A batteries-included configuration framework for Claude Code.**

Forge packages community best practices into a ready-to-install Claude Code setup. One command installs everything — 115 skills, 10 agents, 20 commands, and more.

<p align="center">
  <a href="README.zh-CN.md">简体中文</a> | English
</p>

---

## What's Inside

| Component | Count | Description |
|-----------|-------|-------------|
| Skills | 115 | Frontend, backend, Java, Python, Go, security, docs, and more — all included |
| Agents | 10 | Interactive agents covering the full dev lifecycle |
| Commands | 20 | Slash-command shortcuts for common workflows |
| Rules | 8 | Security, code style, testing, Git conventions |
| Contexts | 3 | dev / review / research mode switching |
| Stacks | 3 | Tech-stack guides (frontend, Java, Python) |

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

The installer will: copy all files → apply template variables → install all 115 skills.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (required by hooks)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI, installed and authenticated

---

## Skills

All 115 skills are installed automatically — no module selection or separate download needed. Categories include:

| Category | Examples |
|----------|----------|
| Core Workflow | superpowers, continuous-learning, tdd-workflow, coding-standards, verification-loop |
| Frontend | frontend-design, frontend-patterns, theme-factory, canvas-design, algorithmic-art |
| Backend | backend-patterns, postgres-patterns, clickhouse-io, api-design, deployment-patterns |
| Java | java-coding-standards, jpa-patterns, springboot-patterns/security/tdd/verification |
| Python | python-patterns, python-testing, django-patterns/security/tdd/verification |
| Go | golang-patterns, golang-testing |
| Security | security-review, security-scan |
| Docs | doc-coauthoring, docx, pdf, pptx, xlsx, internal-comms |
| Testing | webapp-testing, e2e-testing, cpp-testing |
| AI/ML | ai-multimodal, google-adk-python |
| MCP | mcp-builder, mcp-management |

See [SKILLS-CATALOG.md](SKILLS-CATALOG.md) for the full list.

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
│   └── verify.*           # Installation verification
├── skills/                # 115 skills (all included)
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
All 115 skills are bundled in the repo, sourced from [anthropics/skills](https://github.com/anthropics/skills), [obra/superpowers](https://github.com/obra/superpowers), [everything-claude-code](https://github.com/affaan-m/everything-claude-code), and other community repos.

**How do I update?**
Re-run the install script — it overwrites with the latest version.

**Can I add my own Skills?**
Yes. Drop a skill directory into `~/.claude/skills/`. Claude Code picks it up automatically.

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
