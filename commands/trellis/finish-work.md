---
description: "Pre-completion checklist. Verifies code committed, tests pass, session recorded, and workspace clean before ending work."
---

# Trellis: Finish Work Checklist

Run through a completion checklist before ending your session.

## Checklist

Go through each item and verify:

### 1. Code Quality
- [ ] All lint checks pass (run project lint command)
- [ ] All type checks pass (run project typecheck command)
- [ ] No `console.log` statements left in code
- [ ] No hardcoded secrets or API keys

### 2. Tests
- [ ] Relevant tests pass
- [ ] No test regressions introduced
- [ ] New functionality has test coverage

### 3. Git State
- [ ] All changes committed with proper message format: `type(scope): description`
- [ ] Working directory is clean (or WIP is noted)
- [ ] Branch is up to date with base branch

### 4. Documentation
- [ ] Spec docs updated if new patterns discovered
- [ ] Code comments added for non-obvious logic
- [ ] API changes documented

### 5. Session Recording
- [ ] Session recorded via `.trellis/scripts/add-session.sh`
  ```bash
  .trellis/scripts/add-session.sh \
    --title "Session Title" \
    --commit "abc1234" \
    --summary "Brief summary of work done"
  ```

### 6. Task Status
- [ ] Task status updated in `task.json` if completed
- [ ] Next steps documented for follow-up sessions

## Output

Display a summary:
```
Finish Work Report
──────────────────
Code Quality:  [PASS/FAIL]
Tests:         [PASS/FAIL/SKIPPED]
Git:           [CLEAN/DIRTY]
Session:       [RECORDED/PENDING]
Task:          [COMPLETED/IN_PROGRESS]
```

## Notes

- If any check fails, help the user fix it before ending
- This is the last thing to run before ending a session
