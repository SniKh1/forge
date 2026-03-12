# Forge Integration Guide

**Version**: v3.0
**Date**: 2026-03-12

> This document records the repository architecture of Forge Phase 1 — a shared core with Claude, Codex, and Gemini adapters.

---

## What is Forge?

Forge is a production-ready AI capability pack built around:

1. **Shared resource layer** — skills, agents, commands, rules, contexts, stacks
2. **Shared install core** — Node CLI, capability catalog, MCP catalog, memory conventions
3. **Client adapters** — Claude, Codex, and Gemini
4. **Desktop shell** — Tauri UI that calls the same install core

## Architecture Overview

```
repo/
├── core/                  ← Shared capability and MCP definitions
├── packages/forge-cli/    ← Shared Node install core
├── apps/forge-desktop/    ← Tauri desktop shell
├── codex/                 ← Codex adapter
├── gemini/                ← Gemini adapter
├── agents/commands/rules/contexts/stacks/skills
│                         ← Shared resource layer
├── install.sh|ps1         ← Claude compatibility wrappers
└── docs/                  ← User docs, capability matrix, design notes
```

## Phase 1 shape

- Claude remains the reference adapter for native hooks and slash-command semantics
- Codex uses adapted rules, project memory, learned skills, and MCP configuration
- Gemini uses adapted MCP, prompts, and memory scaffolding
- Desktop and CLI share one installation backend

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | v1.2 | Initial Skill system |
| 2026-02-02 | v2.0 | everything-claude-code integration (Skills, Agents, Commands, Rules) |
| 2026-02-03 | v2.3-2.5 | Vibe Coding, Memory, Auto-learning |
| 2026-02-25 | v3.1 | Skills optimization, verify scripts, routing table update |
| 2026-02-26 | v4.0 | Pure everything-claude-code version |
| 2026-03-11 | Phase 1 | Multi-client core + adapters + desktop shell |

## Key Concepts

### Agent System

10 interactive agents managed by CLAUDE.md routing table, invoked via `Task(subagent_type="...", prompt="...")`.

See [AGENTS.md](AGENTS.md) for the full list.

### Hook System

JS hooks in `scripts/hooks/` handle:
- Session lifecycle (start, end, pre-compact)
- Auto-learning evaluation (evaluate-session)
- Code quality (check-console-log, suggest-compact)

### Skill System

115 Skills are bundled in this repository. Mandatory check: if 1% chance a Skill applies, invoke it.

### Command System

20 slash commands: `/plan`, `/tdd`, `/code-review`, `/build-fix`, `/e2e`, `/learn`, `/evolve`, etc.

## Installation

```bash
node packages/forge-cli/bin/forge.js setup

# or compatibility wrappers
bash install.sh
```

The shared installer:
1. Detects installed clients
2. Loads shared capability definitions from `core/`
3. Renders client-specific configuration
4. Creates memory and learned-skill scaffolding
5. Configures MCP
6. Runs verification

## Getting Started

1. Read [`README.md`](README.md) or [`README.en.md`](README.en.md)
2. Use [`docs/user/getting-started.md`](docs/user/getting-started.md) for install / verify / repair
3. Use adapter READMEs for Codex and Gemini specifics
4. Use `AGENTS.md`, `CAPABILITIES.md`, and `USAGE-GUIDE.md` as reference docs

## References

- [CLAUDE.md](CLAUDE.md) — Core routing table
- [CAPABILITIES.md](CAPABILITIES.md) — Capability reference
- [USAGE-GUIDE.md](USAGE-GUIDE.md) — Workflow guide
- [AGENTS.md](AGENTS.md) — Agent system overview
- [docs/README.md](docs/README.md) — Full documentation index
