---
description: "Read backend development guidelines before starting backend work. Loads spec/backend/ docs relevant to the task."
---

# Trellis: Before Backend Dev

Read backend development guidelines before writing any backend code.

## Process

1. **Read Index**
   ```
   .trellis/spec/backend/index.md
   ```

2. **Read Task-Relevant Guidelines**

   Based on what you're about to do, read the specific docs:

   | Task | Read |
   |------|------|
   | Database work | `spec/backend/database-guidelines.md` |
   | API endpoints | `spec/backend/directory-structure.md` |
   | Error handling | `spec/backend/error-handling.md` |
   | Logging | `spec/backend/logging-guidelines.md` |
   | Any backend code | `spec/backend/quality-guidelines.md` |

3. **Check Cross-Layer**
   If the task involves frontend-backend interaction:
   ```
   .trellis/spec/guides/cross-layer-thinking-guide.md
   ```

4. **Confirm Ready**
   After reading, summarize:
   - Key conventions to follow
   - Patterns to use
   - Anti-patterns to avoid

## Notes

- This is a mandatory step — do not skip
- If guidelines are empty ("To fill"), note this and follow general best practices
- If you discover new patterns during development, update the spec docs afterward
