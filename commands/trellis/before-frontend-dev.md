---
description: "Read frontend development guidelines before starting frontend work. Loads spec/frontend/ docs relevant to the task."
---

# Trellis: Before Frontend Dev

Read frontend development guidelines before writing any frontend code.

## Process

1. **Read Index**
   ```
   .trellis/spec/frontend/index.md
   ```

2. **Read Task-Relevant Guidelines**

   Based on what you're about to do, read the specific docs:

   | Task | Read |
   |------|------|
   | Components | `spec/frontend/component-guidelines.md` |
   | Custom hooks | `spec/frontend/hook-guidelines.md` |
   | State management | `spec/frontend/state-management.md` |
   | TypeScript types | `spec/frontend/type-safety.md` |
   | Any frontend code | `spec/frontend/quality-guidelines.md` |
   | File organization | `spec/frontend/directory-structure.md` |

3. **Check Cross-Layer**
   If the task involves frontend-backend interaction:
   ```
   .trellis/spec/guides/cross-layer-thinking-guide.md
   ```

4. **Confirm Ready**
   After reading, summarize:
   - Key conventions to follow
   - Component patterns to use
   - Anti-patterns to avoid

## Notes

- This is a mandatory step — do not skip
- If guidelines are empty ("To fill"), note this and follow general best practices
- If you discover new patterns during development, update the spec docs afterward
