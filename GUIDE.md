# Forge Integration Guide

**Version**: v2.0
**Date**: 2026-02-26

> This document records the architecture of Forge v2 — a pure everything-claude-code configuration framework.

---

## What is Forge?

Forge is a production-ready configuration framework for Claude Code that packages:

1. **everything-claude-code** — Community best practices: 50+ Skills, 10 Interactive Agents, 20 Commands, 8 Rules, 3 Contexts
2. **Custom coding specifications** — CLAUDE.md routing table, rules/, stacks/, contexts/
3. **Auto-learning system** — Homunculus instinct extraction, memory persistence, session state

## Architecture Overview

```
~/.claude/
├── CLAUDE.md              ← Core routing table + principles (v4.0)
├── CAPABILITIES.md        ← Full capability index
├── USAGE-GUIDE.md         ← User guide
├── AGENTS.md              ← Agent system overview
├── GUIDE.md               ← This file
│
├── agents/                ← Agent definitions (10 interactive)
│   ├── planner.md
│   ├── architect.md
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── build-error-resolver.md
│   ├── e2e-runner.md
│   ├── refactor-cleaner.md
│   ├── doc-updater.md
│   └── database-reviewer.md
│
├── commands/              ← Slash commands (20 total)
│   ├── plan.md, tdd.md, code-review.md, build-fix.md, e2e.md
│   ├── learn.md, evolve.md, instinct-status.md, instinct-import.md, instinct-export.md
│   ├── orchestrate.md, checkpoint.md, eval.md, verify.md
│   ├── refactor-clean.md, update-docs.md, update-codemaps.md
│   ├── setup-pm.md, skill-create.md, test-coverage.md
│   └── ...
│
├── hooks/                 ← Hook scripts (JS only)
│   └── hooks.json.template
│
├── rules/                 ← Always-loaded rules (8 files)
├── contexts/              ← dev / review / research modes
├── stacks/                ← Tech stack specs (frontend, java, python)
├── scripts/               ← JS hook scripts + utilities
│   ├── hooks/             ← 8 JS hook scripts
│   └── lib/               ← Shared utilities
├── skills/                ← Skill definitions (50+)
├── homunculus/            ← Auto-learning system
│   └── instincts/         ← personal/ + inherited/
└── sessions/              ← Session state persistence
```

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | v1.2 | Initial Skill system |
| 2026-02-02 | v2.0 | everything-claude-code integration (Skills, Agents, Commands, Rules) |
| 2026-02-03 | v2.3-2.5 | Vibe Coding, Memory, Auto-learning |
| 2026-02-25 | v3.1 | Skills optimization, verify scripts, routing table update |
| 2026-02-26 | v4.0 | Pure everything-claude-code version (forge-v2) |

## Key Concepts

### Agent System

10 interactive agents managed by CLAUDE.md routing table, invoked via `Task(subagent_type="...", prompt="...")`.

See [AGENTS.md](AGENTS.md) for the full list.

### Hook System

JS hooks in `scripts/hooks/` handle:
- Session lifecycle (start, end, pre-compact)
- Auto-learning (observe, evaluate-session)
- Code quality (check-console-log, suggest-compact)

### Skill System

50+ Skills from everything-claude-code. Mandatory check: if 1% chance a Skill applies, invoke it.

### Command System

20 slash commands: `/plan`, `/tdd`, `/code-review`, `/build-fix`, `/e2e`, `/learn`, `/evolve`, etc.

## Installation

```bash
# macOS/Linux
./install.sh

# Windows
.\install.ps1
```

The installer:
1. Checks dependencies (git, node)
2. Copies all configuration files and directories
3. Applies templates (settings.json, .mcp.json, hooks.json)
4. Runs installation verification (verify.sh/verify.ps1)
5. Shows next steps

## Getting Started

1. Open Claude Code and start coding
2. Use `/plan` for complex features
3. Use `/tdd`, `/code-review`, `/build-fix` for development workflows
4. Use `/learn`, `/evolve` for the learning system

## References

- [CLAUDE.md](CLAUDE.md) — Core routing table
- [CAPABILITIES.md](CAPABILITIES.md) — Full capability index
- [USAGE-GUIDE.md](USAGE-GUIDE.md) — User guide
- [AGENTS.md](AGENTS.md) — Agent system overview
