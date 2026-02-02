# Code Review

Comprehensive security and quality review of uncommitted changes.

## Process

1. Get changed files: `git diff --name-only HEAD`

2. For each changed file, check for:

**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing input validation
- Path traversal risks

**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements

**Best Practices (MEDIUM):**
- Mutation patterns (use immutable instead)
- Missing tests for new code
- Accessibility issues (a11y)

3. Generate report with severity levels

4. Block commit if CRITICAL or HIGH issues found
