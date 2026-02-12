---
description: "Run backend code quality checks. Verifies code against spec/backend/ guidelines, runs lint/typecheck, checks for common issues."
---

# Trellis: Check Backend

Run quality checks on backend code against project guidelines.

## Process

### 1. Read Guidelines
Load the backend quality standards:
```
.trellis/spec/backend/quality-guidelines.md
.trellis/spec/backend/error-handling.md
.trellis/spec/backend/logging-guidelines.md
```

### 2. Run Automated Checks
Execute project-specific commands (from `worktree.yaml` verify section or project config):
- Lint check
- Type check
- Test suite (if applicable)

### 3. Manual Review Checklist

| Check | What to Look For |
|-------|-----------------|
| Error handling | Try/catch at boundaries, meaningful error messages |
| Input validation | All user inputs validated (Zod, Joi, etc.) |
| SQL safety | Parameterized queries, no string concatenation |
| Logging | Structured logging, appropriate log levels |
| Secrets | No hardcoded API keys, passwords, tokens |
| Directory structure | Files in correct locations per `spec/backend/directory-structure.md` |
| Database | Follows patterns in `spec/backend/database-guidelines.md` |

### 4. Report

```
Backend Check Report
────────────────────
Lint:           [PASS/FAIL]
Types:          [PASS/FAIL]
Tests:          [PASS/FAIL/SKIPPED]
Error Handling: [OK/ISSUES]
Security:       [OK/ISSUES]

Issues Found: [count]
  CRITICAL: [count]
  HIGH:     [count]
  MEDIUM:   [count]
```

### 5. Fix
For CRITICAL and HIGH issues, fix immediately. For MEDIUM, suggest fixes.
