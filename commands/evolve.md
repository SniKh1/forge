# Evolve Command

Cluster related instincts into skills, commands, or agents.

## Usage

```
/evolve                    # Analyze and suggest evolutions
/evolve --dry-run          # Preview without creating
/evolve --threshold 5      # Require 5+ related instincts
```

## Evolution Types

### Command (User-Invoked)
When instincts describe actions user would request.

### Skill (Auto-Triggered)
When instincts describe automatic behaviors.

### Agent (Needs Depth)
When instincts describe complex multi-step processes.

## Process

1. Read all instincts from `~/.claude/homunculus/instincts/`
2. Group by domain/trigger similarity
3. For clusters of 3+ instincts, determine type
4. Generate appropriate file
5. Save to `~/.claude/homunculus/evolved/`
