---
description: "Create a new Trellis command. Scaffolds a command .md file in the commands directory with proper frontmatter and structure."
---

# Trellis: Create Command

Scaffold a new slash command for the Trellis workflow.

## Usage

```
/trellis:create-command <command-name> [--description "..."]
```

## Process

1. **Validate Name**
   - Must be lowercase, hyphen-separated
   - Must not conflict with existing commands
   - Check `commands/` and `commands/trellis/` for conflicts

2. **Determine Location**
   - Trellis-specific: `commands/trellis/<name>.md`
   - General: `commands/<name>.md`

3. **Scaffold File**

   ```markdown
   ---
   description: "[Brief description of what this command does]"
   ---

   # [Command Title]

   [One-line description]

   ## Usage

   ```
   /[command-name] [arguments]
   ```

   ## Process

   1. **Step 1** — [Description]
   2. **Step 2** — [Description]

   ## Notes

   - [Important notes]
   ```

4. **Register**
   - Add to CAPABILITIES.md command table
   - Add to CLAUDE.md if it should appear in the quick reference

5. **Confirm**
   Show the created file path and suggest testing the command.

## Notes

- Commands are `.md` files with YAML frontmatter
- The `description` field in frontmatter is shown in command listings
- Keep commands focused — one command, one purpose
