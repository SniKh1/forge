# Forge Gemini Pack

This adapter installs Forge assets for Gemini CLI.

See also:

- [`../README.md`](../README.md)
- [`../docs/user/getting-started.md`](../docs/user/getting-started.md)
- [`../docs/CLIENT-CAPABILITY-MATRIX.md`](../docs/CLIENT-CAPABILITY-MATRIX.md)

## What gets installed

- `~/.gemini/forge/{agents,commands,contexts,rules,stacks,hooks,scripts}`
- `~/.gemini/GEMINI.md`
- `~/.gemini/settings.json` merged with Forge MCP servers
- `~/.gemini/projects/<workspace>/memory/*`
- `~/.gemini/skills/learned/*`

## Install

macOS/Linux:
```bash
bash gemini/install-gemini.sh
```

Windows:
```powershell
.\gemini\install-gemini.ps1
```

## Verify

macOS/Linux:
```bash
bash gemini/scripts/verify-gemini.sh
bash gemini/scripts/test-gemini-mcp.sh
```

Windows:
```powershell
.\gemini\scripts\verify-gemini.ps1
.\gemini\scripts\test-gemini-mcp.ps1
```

## Learning scripts

macOS/Linux:
```bash
bash ~/.gemini/forge/scripts/ensure.sh
bash ~/.gemini/forge/scripts/learn.sh --title "..." --problem "..." --solution "..." --when "..."
bash ~/.gemini/forge/scripts/instinct-status.sh
bash ~/.gemini/forge/scripts/evolve.sh --threshold 3 --apply
```

Windows:
```powershell
~/.gemini/forge/scripts/ensure.ps1
~/.gemini/forge/scripts/learn.ps1 --title "..." --problem "..." --solution "..." --when "..."
~/.gemini/forge/scripts/instinct-status.ps1
~/.gemini/forge/scripts/evolve.ps1 --threshold 3 --apply
```
