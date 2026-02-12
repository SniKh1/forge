---
description: "Launch multi-agent pipeline with Git Worktree isolation. Orchestrates implement, check, debug agents in parallel or sequence."
---

# Trellis: Parallel Multi-Agent Pipeline

Orchestrate multiple pipeline agents working in parallel using Git Worktree isolation.

## Usage

```
/trellis:parallel <task-name> [--agents implement,check] [--sequential]
```

## Process

1. **Validate Task**
   - Read `.trellis/tasks/<task-name>/task.json`
   - Confirm task status is `in_progress`
   - Read PRD from `prd.md`

2. **Setup Worktrees** (if parallel)
   - Run `.trellis/scripts/multi-agent/start.sh <task-name>`
   - Creates isolated worktree per agent in `../trellis-worktrees/`
   - Copies files listed in `worktree.yaml` → `copy` section
   - Runs `post_create` hooks

3. **Launch Agents**
   Default pipeline: `research → plan → implement → check`

   For parallel execution:
   ```
   research ──→ plan ──→ implement (feature A) ──→ check
                    └──→ implement (feature B) ──→ check
   ```

4. **Monitor Progress**
   - Use `.trellis/scripts/multi-agent/status.sh` to check agent status
   - Dispatch agent coordinates handoffs between agents
   - Ralph Loop ensures check agent quality

5. **Merge Results**
   - Run `.trellis/scripts/multi-agent/create-pr.sh` to create PR from worktree
   - Cleanup with `.trellis/scripts/multi-agent/cleanup.sh`

## Agent Pipeline

| Agent | Role | Isolation |
|-------|------|-----------|
| research | Gather info (read-only) | Shared |
| plan | Create implementation plan | Shared |
| implement | Write code | Worktree |
| check | Review + fix (Ralph Loop) | Worktree |
| debug | Fix problems | Worktree |
| dispatch | Coordinate workflow | Shared |

## Flags

- `--agents <list>`: Specify which agents to run (comma-separated)
- `--sequential`: Force sequential execution instead of parallel
- `--skip-worktree`: Run in current directory without worktree isolation
