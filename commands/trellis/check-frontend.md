---
description: "Run frontend code quality checks. Verifies code against spec/frontend/ guidelines, runs lint/typecheck, checks component patterns."
---

# Trellis: Check Frontend

Run quality checks on frontend code against project guidelines.

## Process

### 1. Read Guidelines
Load the frontend quality standards:
```
.trellis/spec/frontend/quality-guidelines.md
.trellis/spec/frontend/component-guidelines.md
.trellis/spec/frontend/type-safety.md
```

### 2. Run Automated Checks
Execute project-specific commands:
- Lint check
- Type check
- Test suite (if applicable)

### 3. Manual Review Checklist

| Check | What to Look For |
|-------|-----------------|
| Components | Follow patterns in `spec/frontend/component-guidelines.md` |
| Hooks | Custom hooks follow `spec/frontend/hook-guidelines.md` |
| State | State management per `spec/frontend/state-management.md` |
| Types | Proper TypeScript usage per `spec/frontend/type-safety.md` |
| Accessibility | Semantic HTML, ARIA labels, keyboard navigation |
| Performance | No unnecessary re-renders, proper memoization |
| XSS | User input sanitized before rendering |
| Structure | Files in correct locations per `spec/frontend/directory-structure.md` |

### 4. Report

```
Frontend Check Report
─────────────────────
Lint:          [PASS/FAIL]
Types:         [PASS/FAIL]
Tests:         [PASS/FAIL/SKIPPED]
Components:    [OK/ISSUES]
Accessibility: [OK/ISSUES]

Issues Found: [count]
  CRITICAL: [count]
  HIGH:     [count]
  MEDIUM:   [count]
```

### 5. Fix
For CRITICAL and HIGH issues, fix immediately. For MEDIUM, suggest fixes.
