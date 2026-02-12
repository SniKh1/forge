---
description: "Update Trellis spec documentation. Adds new patterns, conventions, or guidelines discovered during development."
---

# Trellis: Update Spec

Update the `.trellis/spec/` documentation with new patterns or conventions.

## When to Use

- Discovered a new coding pattern that should be standardized
- Fixed a bug that reveals a missing guideline
- Established a new convention with the team
- Found an anti-pattern that should be documented

## Process

### 1. Identify What to Update

| Change Type | Target File |
|-------------|-------------|
| Frontend component pattern | `spec/frontend/component-guidelines.md` |
| Frontend hook pattern | `spec/frontend/hook-guidelines.md` |
| Frontend state pattern | `spec/frontend/state-management.md` |
| Frontend type pattern | `spec/frontend/type-safety.md` |
| Frontend quality rule | `spec/frontend/quality-guidelines.md` |
| Backend database pattern | `spec/backend/database-guidelines.md` |
| Backend error pattern | `spec/backend/error-handling.md` |
| Backend logging pattern | `spec/backend/logging-guidelines.md` |
| Backend quality rule | `spec/backend/quality-guidelines.md` |
| Cross-layer pattern | `spec/guides/cross-layer-thinking-guide.md` |
| Code reuse pattern | `spec/guides/code-reuse-thinking-guide.md` |

### 2. Write the Update

Follow this format:
```markdown
### [Pattern Name]

**When**: [When to use this pattern]

**Do**:
```code
// Good example from the actual codebase
```

**Don't**:
```code
// Bad example showing the anti-pattern
```

**Why**: [Explanation of why this matters]
```

### 3. Verify Consistency
- Check the update doesn't contradict existing guidelines
- Ensure examples use actual project conventions
- Cross-reference with other spec files

### 4. Confirm
Show the diff of what was added/changed.

## Notes

- Use real code examples from the project, not generic ones
- Keep guidelines actionable — "do this" not "consider doing this"
- Max 2000 lines per spec file — split if needed
