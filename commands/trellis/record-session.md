---
description: "Record current session progress to the developer's journal. Captures work done, decisions made, and next steps."
---

# Trellis: Record Session

Record the current session's progress to the developer journal.

## Process

1. **Gather Session Info**
   - Developer identity from `.trellis/.developer`
   - Current git branch and recent commits
   - Files modified in this session
   - Tasks worked on

2. **Prompt for Summary**
   Ask the user (or auto-generate):
   - Session title
   - Brief summary of work done
   - Key decisions made
   - Blockers encountered
   - Next steps

3. **Record via Script**
   ```bash
   .trellis/scripts/add-session.sh \
     --title "Session Title" \
     --commit "latest-commit-hash" \
     --summary "Brief summary"
   ```

4. **Auto-handling**
   The script automatically:
   - Detects the current journal file
   - Creates a new journal file if the current one exceeds 2000 lines
   - Appends the session entry
   - Updates `workspace/<developer>/index.md`

## Session Entry Format

```markdown
### Session: [Title]
**Date**: [YYYY-MM-DD HH:MM]
**Commit**: [hash]

**Summary**: [What was accomplished]

**Decisions**: [Key decisions made]

**Next Steps**: [What to do next]
```

## Notes

- Run this at the end of every session
- Keep summaries concise but informative
- Include commit hashes for traceability
