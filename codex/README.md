# Forge Codex Pack

This package ports Forge's workflow assets to Codex.

See also:

- [`../README.md`](../README.md)
- [`../docs/user/getting-started.md`](../docs/user/getting-started.md)
- [`../docs/CLIENT-CAPABILITY-MATRIX.md`](../docs/CLIENT-CAPABILITY-MATRIX.md)

## What gets installed
- `~/.codex/AGENTS.md` (generated from template)
- `~/.codex/forge/{agents,commands,contexts,rules,stacks}`
- `~/.codex/skills/*` (all repo skills, excluding `learned`)
- `~/.codex/skills/learned` (learned skill output directory)
- `~/.codex/projects/<workspace-slug>/memory/{MEMORY.md,PROJECT-MEMORY.md}`
- `~/.codex/homunculus/{instincts,evolved}` (learning/evolution data)
- `~/.codex/forge/scripts/codex-learning/*` (`ensure/learn/evolve/status` scripts)

## Install

macOS/Linux:
```bash
bash codex/install-codex.sh
```

Windows (PowerShell):
```powershell
.\codex\install-codex.ps1
```

## Verify

macOS/Linux:
```bash
bash codex/scripts/verify-codex.sh
bash codex/scripts/test-codex-mcp.sh
```

Windows (PowerShell):
```powershell
.\codex\scripts\verify-codex.ps1
.\codex\scripts\test-codex-mcp.ps1
```

## Notes
- Claude-specific hooks are not auto-registered in Codex.
- Forge playbooks are installed as reference workflows under `~/.codex/forge/`.

## Learning scripts

macOS/Linux:
```bash
bash ~/.codex/forge/scripts/codex-learning/ensure.sh
bash ~/.codex/forge/scripts/codex-learning/learn.sh --title "mqtt-listener-registration-pattern" --problem "..." --solution "..." --when "..."
bash ~/.codex/forge/scripts/codex-learning/instinct-status.sh
bash ~/.codex/forge/scripts/codex-learning/evolve.sh --threshold 3 --apply
```

## MCP scripts

macOS/Linux:
```bash
FORGE_CODEX_EXA_KEY="<your-exa-key>" bash codex/scripts/configure-codex-mcp.sh
bash codex/scripts/test-codex-mcp.sh
```

Windows (PowerShell):
```powershell
$env:FORGE_CODEX_EXA_KEY="<your-exa-key>"
.\codex\scripts\configure-codex-mcp.ps1
.\codex\scripts\test-codex-mcp.ps1
```

Windows (PowerShell):
```powershell
~/.codex/forge/scripts/codex-learning/ensure.ps1
~/.codex/forge/scripts/codex-learning/learn.ps1 --title "mqtt-listener-registration-pattern" --problem "..." --solution "..." --when "..."
~/.codex/forge/scripts/codex-learning/instinct-status.ps1
~/.codex/forge/scripts/codex-learning/evolve.ps1 --threshold 3 --apply
```
