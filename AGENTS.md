# Forge Agent System

Forge provides 10 interactive agents for daily development tasks.

## Available Agents

| Agent | Purpose | Auto-trigger |
|-------|---------|-------------|
| `planner` | Implementation planning | Complex feature requests |
| `architect` | System design | Architectural decisions |
| `tdd-guide` | Test-driven development | New features, bug fixes |
| `code-reviewer` | Code review | After writing code |
| `security-reviewer` | Security analysis | Before commits |
| `build-error-resolver` | Fix build errors | When build fails |
| `e2e-runner` | E2E testing | Critical user flows |
| `refactor-cleaner` | Dead code cleanup | Code maintenance |
| `doc-updater` | Documentation | After code changes |
| `database-reviewer` | Database review | Database changes |

## Usage

Agents are invoked via `Task(subagent_type="agent-name", prompt="...")`.

Agent definitions are located in `~/.claude/agents/`.

See `rules/agents.md` for orchestration rules.
