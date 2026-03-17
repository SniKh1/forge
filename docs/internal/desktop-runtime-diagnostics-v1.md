# Forge Desktop Runtime Diagnostics v1

## Why this note exists

Forge Desktop shipped successfully as `v0.4.1`, but "cannot read Forge state" remained a separate runtime risk surface from packaging itself.

This document captures the current model so future debugging does not start from zero.

## Dependency boundary

Treat the dependency model as two separate systems:

### Build-time only

- Rust
- Cargo
- Tauri toolchain
- Xcode / Windows build tools

These are required for maintainers building the app from source, not for end users running the packaged installer.

### Runtime hard dependency in the current desktop architecture

- Node.js 18+

The desktop app currently invokes the bundled Forge CLI through the external `node` runtime. That means the packaged app is not fully self-contained yet.

### Runtime soft dependency

- Python, for some MCP configuration paths

### Runtime dependency that is currently over-enforced by some scripts

- Git

Git is checked by install scripts, but it is not the most likely root cause for simple "read Forge state" failures.

## What "cannot read Forge state" really means

The frontend reads state by calling:

1. Tauri bridge
2. `run_forge_cli`
3. `node packages/forge-cli/bin/forge.js doctor --json`
4. `JSON.parse(output)` in the frontend

So this error is not a single product-layer error. It is a catch-all symptom for:

- node missing
- node not visible to the GUI app PATH
- Forge CLI returning non-JSON error output
- client home or Forge assets missing

## Highest-probability root causes

### macOS

- Node works in Terminal but not in the GUI app
- Node comes from `nvm`, `fnm`, `asdf`, or `volta`
- `launchctl PATH` does not include the node directory

### Windows

- Node is missing
- App resources are present, but the external node runtime is unavailable
- Client home is partially configured

## Evidence from the current workspace

The local repo can currently run:

- `node packages/forge-cli/bin/forge.js doctor --client codex --json`
- `node packages/forge-cli/bin/forge.js verify --client codex --json`

That means the repo and Forge assets themselves are not the immediate blocker in this workspace.

The local node path is under `~/.nvm/...`, which remains a real GUI/PATH risk on macOS.

## Operational guidance

When another machine reports desktop runtime failure:

1. Run the runtime diagnostic script first
2. Read the generated report before editing code
3. Distinguish packaging failure from runtime environment failure
4. Only after that decide whether to:
   - fix local environment
   - improve desktop PATH/node discovery
   - reduce runtime dependency on external Node entirely

## Current project response

This repo now includes:

- `scripts/diagnose-forge-runtime.sh`
- `scripts/diagnose-forge-runtime.ps1`
- `docs/user/desktop-runtime-troubleshooting.md`

These should be treated as the first response path for future desktop runtime incidents.
