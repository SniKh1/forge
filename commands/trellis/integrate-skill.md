---
description: "Integrate an external Skill into the Forge framework. Downloads, validates, and registers a skill from everything-claude-code or custom source."
---

# Trellis: Integrate Skill

Add a new Skill to the framework from an external source.

## Usage

```
/trellis:integrate-skill <skill-name> [--source <url-or-path>]
```

## Process

1. **Identify Source**
   - Default: `everything-claude-code` GitHub repo
   - Custom: local path or URL provided by user

2. **Validate Skill**
   - Check skill file exists and has proper structure
   - Verify no naming conflicts with existing skills
   - Review skill content for security (no hardcoded secrets, no destructive commands)

3. **Install**
   - Copy skill file to `~/.claude/skills/<skill-name>/`
   - Preserve directory structure if skill has multiple files

4. **Register**
   - Add to CLAUDE.md Skill matching table (section 0.1) if applicable
   - Add to CAPABILITIES.md skill listing
   - Update `.trellis/spec/guides/skill-usage-guide.md` if needed

5. **Test**
   - Verify the skill is recognized by listing available skills
   - Suggest a test invocation

## Skill File Structure

A valid skill typically contains:
```
skills/<skill-name>/
├── index.md          # Main skill definition
├── templates/        # Optional templates
└── examples/         # Optional examples
```

## Notes

- Always review skill content before integrating
- Skills from untrusted sources should be audited for security
- Back up existing skills before overwriting
