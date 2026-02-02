# Build and Fix

Incrementally fix TypeScript and build errors.

## Process

1. Run build: `npm run build` or `pnpm build`

2. Parse error output:
   - Group by file
   - Sort by severity

3. For each error:
   - Show error context (5 lines before/after)
   - Explain the issue
   - Propose fix
   - Apply fix
   - Re-run build
   - Verify error resolved

4. Stop if:
   - Fix introduces new errors
   - Same error persists after 3 attempts
   - User requests pause

5. Show summary of errors fixed/remaining

Fix one error at a time for safety!
