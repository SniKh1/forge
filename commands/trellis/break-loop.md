---
description: "Deep bug analysis after fixing a bug. Traces root cause, identifies systemic issues, and suggests preventive measures."
---

# Trellis: Break Loop (Deep Bug Analysis)

After fixing a bug, perform deep analysis to prevent recurrence.

## When to Use

- After fixing a bug that took multiple attempts
- After a regression was introduced
- When the same type of bug keeps appearing

## Process

### 1. Root Cause Analysis
- **What was the symptom?** — The visible error or incorrect behavior
- **What was the root cause?** — The actual code defect
- **Why did it happen?** — Missing validation? Wrong assumption? Race condition?
- **Why wasn't it caught?** — Missing test? Insufficient review?

### 2. Impact Assessment
- **Scope**: How many users/features affected?
- **Duration**: How long was the bug present?
- **Severity**: Data loss? UX issue? Performance?

### 3. Systemic Check
Search for similar patterns in the codebase:
- Use Grep to find similar code patterns
- Check if the same mistake exists elsewhere
- Identify if this is a pattern-level problem

### 4. Prevention Plan
- **Test**: Write a regression test for this specific bug
- **Guard**: Add validation/assertion to prevent recurrence
- **Spec**: Update `.trellis/spec/` guidelines if a new pattern was learned
- **Review**: Flag similar patterns for code review

### 5. Document
Record the analysis:
```markdown
## Bug Analysis: [Brief Description]

**Symptom**: [What was observed]
**Root Cause**: [Actual defect]
**Fix**: [What was changed]
**Prevention**: [What was added to prevent recurrence]
**Similar Patterns Found**: [Yes/No — details]
**Spec Updated**: [Yes/No — which file]
```

## Output

Append findings to the task's context file or journal.
