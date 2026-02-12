---
description: "Start a Trellis session. Collects developer identity, active tasks, git state, and recent journal entries to establish context."
---

# Trellis: Start Session

Initialize a new development session with full context.

## Process

1. **Detect Project Root**
   - Look for `.trellis/` directory in current or parent directories
   - If not found, inform user to run `init-developer.sh` first

2. **Collect Context**
   Run `.trellis/scripts/get-context.sh` or manually gather:
   - Developer identity from `.trellis/.developer`
   - Active tasks from `.trellis/tasks/*/task.json`
   - Git branch, status, recent commits
   - Last journal entry from workspace

3. **Read Guidelines**
   Based on the project, read relevant spec indexes:
   - `.trellis/spec/frontend/index.md` (if frontend work)
   - `.trellis/spec/backend/index.md` (if backend work)
   - `.trellis/spec/guides/index.md` (always)

4. **Present Summary**
   Display to user:
   ```
   Session Started
   ───────────────
   Developer: [name]
   Branch:    [current branch]
   Tasks:     [active task count]
   Status:    [clean / N modified files]
   ```

5. **Suggest Next Steps**
   - If active task exists: "Continue working on [task]?"
   - If no tasks: "Create a new task with `.trellis/scripts/task.sh create`"

## Notes

- This command is informational — it reads state but doesn't modify anything
- Run at the beginning of every session for continuity
