# Forge Integration Guide

**Version**: v1.0
**Date**: 2026-02-06

> This document records the integration of everything-claude-code + Trellis into the Forge framework.

---

## What is Forge?

Forge is a production-ready configuration framework for Claude Code that combines:

1. **everything-claude-code** — Community best practices: 50+ Skills, 10 Interactive Agents, 20 Commands, 8 Rules, 3 Contexts
2. **Trellis Multi-Agent Pipeline** — Structured multi-agent workflow: 6 Pipeline Agents, Hook-driven quality control, Git Worktree parallel execution

## Architecture Overview

```
~/.claude/
├── CLAUDE.md              ← Core routing table + principles
├── CAPABILITIES.md        ← Full capability index
├── USAGE-GUIDE.md         ← User guide
├── AGENTS.md              ← Trellis entry point
├── GUIDE.md               ← This file
│
├── agents/                ← Agent definitions (16 total)
│   ├── [10 Interactive]   ← planner, architect, tdd-guide, etc.
│   └── [6 Pipeline]      ← implement, check, debug, research, dispatch, plan
│
├── commands/              ← Slash commands (34 total)
│   ├── [20 general]      ← /plan, /tdd, /code-review, etc.
│   └── trellis/           ← /trellis:start, /trellis:parallel, etc.
│
├── hooks/                 ← Hook scripts
│   ├── hooks.json.template
│   ├── inject-subagent-context.py
│   ├── ralph-loop.py
│   └── session-start.py
│
├── rules/                 ← Always-loaded rules (8 files)
├── contexts/              ← dev / review / research modes
├── stacks/                ← Tech stack specs (frontend, java, python)
├── scripts/               ← JS hook scripts + utilities
├── homunculus/            ← Auto-learning system
│   └── instincts/         ← personal/ + inherited/
├── sessions/              ← Session state persistence
│
└── .trellis/              ← Trellis pipeline config
    ├── workflow.md
    ├── worktree.yaml
    ├── spec/              ← Development guidelines
    ├── scripts/           ← Shell automation scripts
    ├── workspace/         ← Developer workspaces
    └── tasks/             ← Task tracking
```

## Integration Timeline

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | v1.2 | Initial Skill system |
| 2026-02-02 | v2.0 | everything-claude-code integration (Skills, Agents, Commands, Rules) |
| 2026-02-03 | v2.3-2.5 | Vibe Coding, Memory, Auto-learning |
| 2026-02-06 | v3.0 | Trellis integration (Pipeline Agents, Hooks, Commands, Spec system) |

## Key Concepts

### Three-Layer Agent Architecture

- **Layer 1 (Pipeline)**: `implement`, `check`, `debug`, `research`, `dispatch`, `plan` — managed by Hooks, used in `/trellis:parallel`
- **Layer 2 (Interactive)**: `planner`, `architect`, `tdd-guide`, `code-reviewer`, etc. — managed by CLAUDE.md routing table
- **Layer 3 (Built-in)**: `Explore`, `Plan`, `Bash`, `general-purpose` — system-provided

### Hook System

- `inject-subagent-context.py` — Injects task context (PRD, .jsonl) into Pipeline Agents
- `ralph-loop.py` — Quality control loop for Check Agent (max 5 iterations)
- `session-start.py` — Loads previous context on session start
- JS hooks in `scripts/hooks/` — Session management, auto-learning, compaction

### Skill System

50+ Skills from everything-claude-code. Mandatory check: if 1% chance a Skill applies, invoke it.

### Command System

34 slash commands total:
- 20 from everything-claude-code (`/plan`, `/tdd`, `/code-review`, etc.)
- 14 from Trellis (`/trellis:start`, `/trellis:parallel`, etc.)

## Installation

```bash
# macOS/Linux
./install.sh

# Windows
.\install.ps1
```

The installer:
1. Backs up existing `~/.claude/` (optional)
2. Copies all configuration files
3. Applies templates (settings.json, hooks.json)
4. Creates required directories (homunculus, sessions)
5. Optionally installs Skills from everything-claude-code

## Getting Started

1. Run `/trellis:onboard` for first-time setup
2. Run `/trellis:start` at the beginning of each session
3. Use `/plan` for complex features
4. Use `/trellis:finish-work` before ending a session

## References

- [CLAUDE.md](CLAUDE.md) — Core routing table
- [CAPABILITIES.md](CAPABILITIES.md) — Full capability index
- [USAGE-GUIDE.md](USAGE-GUIDE.md) — User guide
- [.trellis/workflow.md](.trellis/workflow.md) — Trellis workflow
