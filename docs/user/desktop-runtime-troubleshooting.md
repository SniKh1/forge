# Forge Desktop Runtime Troubleshooting

This guide is for the case where Forge installs, but the desktop app still shows errors such as "Unable to read Forge state" or cannot complete install, verify, or repair actions.

## What the desktop app actually depends on

Separate the dependencies into build-time and runtime:

- Build-time only:
  - Rust
  - Cargo
  - Tauri toolchain
  - Xcode / Windows build tools
- Runtime hard dependency in the current product design:
  - Node.js 18+
- Runtime soft dependency:
  - Python, only for some MCP configuration flows
- Currently checked by some install scripts:
  - Git

For end users who download the `.dmg` or `.msi` from GitHub Releases, Rust and Cargo should not be required just to run the packaged app.

## High-probability root causes

When Forge Desktop cannot read status, the failure is usually in one of these layers:

1. The desktop shell cannot find `node`.
2. The packaged app can find `node`, but the Forge CLI returns a non-JSON error.
3. The target client home is missing or partially configured, such as `~/.codex/AGENTS.md`.
4. On macOS, Terminal can find `node`, but the GUI app cannot because the app process gets a different PATH.

## Run the runtime diagnostic script

From the repo root:

```bash
bash scripts/diagnose-forge-runtime.sh
```

On Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\diagnose-forge-runtime.ps1
```

The script writes a report into:

- `./.tmp/forge-runtime-diagnose-<timestamp>.md`

That report includes:

- system and shell information
- current PATH
- GUI-relevant PATH details
- `node`, `git`, `python`, `claude`, `codex`, `gemini` command detection
- client home checks under `~/.codex`, `~/.claude`, and `~/.gemini`
- local `forge doctor --json` and `forge verify --json` output
- a short high-confidence warning summary

## macOS-specific note

The most common hidden issue on macOS is:

- `node` works in Terminal
- `Forge.app` still cannot find it

This usually happens when Node comes from a shell-managed path such as:

- `nvm`
- `fnm`
- `asdf`
- `volta`

The diagnostic script compares Terminal PATH and `launchctl PATH` for exactly this reason.

## Windows-specific note

On Windows, the bundled app no longer needs the source repo path from `v0.4.0`, but it still relies on a working Node runtime at execution time.

Use the diagnostic script to confirm:

- `node` exists
- the installed app exists in a standard location
- the bundled Forge CLI resource is present
- `forge doctor` can run successfully from the repo copy

## How to read the result

If the report says any of the following, treat it as a primary blocker:

- `Node.js is missing`
- `launchctl PATH does not include the node directory`
- `~/.codex/AGENTS.md is missing`
- `~/.codex/forge is missing`
- `forge doctor returned a non-zero exit code`

If none of those appear, but Forge Desktop still cannot read status, the next step is to instrument the desktop app process itself and capture the exact error string returned by the Tauri bridge.
