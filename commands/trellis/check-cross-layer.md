---
description: "Cross-layer verification. Checks data flow consistency between frontend and backend, validates API contracts, and catches boundary bugs."
---

# Trellis: Check Cross-Layer

Verify consistency across frontend-backend boundaries.

## When to Use

- Feature spans both frontend and backend
- API contract changed
- Data format or schema modified
- After fixing a cross-layer bug

## Process

### 1. Read Guide
```
.trellis/spec/guides/cross-layer-thinking-guide.md
```

### 2. Map Data Flow
Trace the complete data path:
```
User Input → Frontend Validation → API Request → Backend Validation
→ Service Logic → Database → Response → Frontend Transform → Display
```

For each boundary, verify:
- Input format matches expected format
- Error cases handled on both sides
- Null/empty/invalid values handled

### 3. API Contract Check

| Check | Verify |
|-------|--------|
| Request shape | Frontend sends what backend expects |
| Response shape | Backend returns what frontend expects |
| Error format | Error responses parsed correctly on frontend |
| Status codes | Frontend handles all possible status codes |
| Auth headers | Token/session sent and validated correctly |

### 4. Type Consistency
- Shared types defined in one place (not duplicated)
- Date formats consistent (ISO 8601 recommended)
- Enum values match between layers
- Nullable fields handled on both sides

### 5. Report

```
Cross-Layer Check Report
────────────────────────
Data Flow:     [CONSISTENT/ISSUES]
API Contracts: [MATCHED/MISMATCHED]
Types:         [CONSISTENT/ISSUES]
Error Handling:[COMPLETE/GAPS]

Boundary Issues: [count]
```

### 6. Fix
Fix any mismatches found. Update spec docs if new patterns discovered.
