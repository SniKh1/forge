# Forge Getting Started

Forge has three user entry points. Pick the one that matches your comfort level.

## Recommended entry points

1. Desktop installer: `apps/forge-desktop`
2. CLI: `node packages/forge-cli/bin/forge.js setup`
3. Compatibility scripts: `install.sh`, `install.ps1`

## Prerequisites

- Git
- Node.js
- Claude Code CLI if you want the Claude adapter
- Rust toolchain only if you want to run the Tauri desktop shell from source

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

## If your token is wrong

Run:

```bash
node packages/forge-cli/bin/forge.js repair --client claude,codex,gemini --exa-api-key NEW_KEY
```

## Adapter docs

- Codex: [`../../codex/README.md`](../../codex/README.md)
- Gemini: [`../../gemini/README.md`](../../gemini/README.md)
- Capability matrix: [`../CLIENT-CAPABILITY-MATRIX.md`](../CLIENT-CAPABILITY-MATRIX.md)
