# Skill Create

Analyze git history to extract coding patterns and generate SKILL.md files.

## Usage

```
/skill-create                    # Analyze current repo
/skill-create --commits 100      # Analyze last 100 commits
/skill-create --instincts        # Also generate instincts
```

## Process

1. Parse Git History
2. Detect Patterns (commits, file co-changes, workflows)
3. Generate SKILL.md
4. Optionally create instincts for continuous-learning-v2
