# Instinct Status

Show all learned instincts with confidence levels.

## Usage

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## What to Do

1. Read instincts from `~/.claude/homunculus/instincts/personal/`
2. Read inherited from `~/.claude/homunculus/instincts/inherited/`
3. Display grouped by domain with confidence bars

## Flags

- `--domain <name>`: Filter by domain
- `--low-confidence`: Show confidence < 0.5
- `--high-confidence`: Show confidence >= 0.7
- `--json`: Output as JSON
