# Forge Getting Started

Forge has three user entry points. Pick the one that matches your comfort level.

## Recommended entry points

1. Desktop installer: `apps/forge-desktop`
2. CLI: `node packages/forge-cli/bin/forge.js setup`
3. Compatibility scripts: `install.sh`, `install.ps1`

## Prerequisites

- Git
- Node.js 18+
- Claude Code CLI if you want the Claude adapter
- Rust toolchain only if you want to run the Tauri desktop shell from source

Important dependency boundary:

- If you are running the packaged Forge desktop installer from GitHub Releases, you should not need Rust or Cargo.
- The current desktop product still needs Node.js at runtime because the desktop shell invokes the bundled Forge CLI through the external Node runtime.
- Python is only needed for some MCP configuration paths.

## Install

### Desktop shell

```bash
cd apps/forge-desktop
npm install
npm run tauri:dev
```

### Shared CLI

```bash
node packages/forge-cli/bin/forge.js setup
```

### Compatibility wrappers

```bash
bash install.sh
```

```powershell
.\install.ps1
```

## What Forge installs

- Shared MCP profile for Claude, Codex, and Gemini
- Rules, stacks, commands, and playbooks
- `skills/learned` and project memory scaffolding
- Client-specific configuration files
- Optional Exa-backed MCP search when a key is provided

## How to verify

Run:

```bash
node packages/forge-cli/bin/forge.js verify
node packages/forge-cli/bin/forge.js doctor
```

If Forge Desktop says it cannot read status, run the runtime diagnostics:

```bash
bash scripts/diagnose-forge-runtime.sh
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\diagnose-forge-runtime.ps1
```

See [`desktop-runtime-troubleshooting.md`](./desktop-runtime-troubleshooting.md) for the full checklist and interpretation guide.

## If your token is wrong

Run:

```bash
node packages/forge-cli/bin/forge.js repair --client claude,codex,gemini --exa-api-key NEW_KEY
```

## Adapter docs

- Codex: [`../../codex/README.md`](../../codex/README.md)
- Gemini: [`../../gemini/README.md`](../../gemini/README.md)
- Capability matrix: [`../CLIENT-CAPABILITY-MATRIX.md`](../CLIENT-CAPABILITY-MATRIX.md)
