# Refactor Clean

Safely identify and remove dead code.

## Process

1. Run dead code analysis:
   - knip: Find unused exports
   - depcheck: Find unused dependencies

2. Categorize by severity:
   - SAFE: Test files, unused utilities
   - CAUTION: API routes, components
   - DANGER: Config files, entry points

3. Before each deletion:
   - Run full test suite
   - Verify tests pass
   - Apply change
   - Re-run tests
   - Rollback if tests fail

Never delete code without running tests first!
