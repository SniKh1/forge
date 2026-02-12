---
description: "Onboard a new team member or AI agent. Walks through developer identity setup, guideline reading, and first task creation."
---

# Trellis: Onboard

Guide a new developer or AI agent through the Trellis setup process.

## Process

### Step 1: Initialize Developer Identity

```bash
# Check if already initialized
.trellis/scripts/get-developer.sh

# If not, initialize
.trellis/scripts/init-developer.sh <name>
```

Naming conventions:
| User Type | Suggested Name |
|-----------|---------------|
| Human developer | `firstname-lastname` (e.g., `john-doe`) |
| Cursor AI | `cursor-agent` |
| Claude Code | `claude-agent` |

### Step 2: Read Core Documentation

In order:
1. `.trellis/workflow.md` — overall workflow
2. `.trellis/spec/guides/index.md` — guides overview
3. `.trellis/spec/frontend/index.md` — frontend conventions (if applicable)
4. `.trellis/spec/backend/index.md` — backend conventions (if applicable)

### Step 3: Understand the Toolchain

Key commands:
| Command | Purpose |
|---------|---------|
| `/trellis:start` | Begin a session |
| `/trellis:before-frontend-dev` | Read frontend guidelines |
| `/trellis:before-backend-dev` | Read backend guidelines |
| `/trellis:finish-work` | End-of-session checklist |
| `/trellis:record-session` | Record progress |

### Step 4: Create First Task

```bash
.trellis/scripts/task.sh create "First task title" --slug first-task
```

### Step 5: Verify Setup

Run `.trellis/scripts/get-context.sh` and confirm:
- Developer identity is set
- Workspace directory exists
- Task is created and visible

## Output

```
Onboarding Complete
───────────────────
Developer: [name]
Workspace: .trellis/workspace/[name]/
Task:      [first task name]
Status:    Ready to develop
```
