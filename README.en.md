# Forge

**An open-source desktop installer and configuration distribution repo for Claude, Codex, and Gemini.**

Forge exists to make one thing easy: install a consistent AI capability setup for `Claude`, `Codex`, and `Gemini` on `macOS` and `Windows`, while still keeping CLI and script entrypoints for advanced users.

<p align="center">
  <a href="README.md">简体中文</a> | English
</p>

## Supported Scope

- Platforms: `macOS`, `Windows`
- Clients: `Claude`, `Codex`, `Gemini`
- Distribution: `Forge Desktop` app + CLI / compatibility scripts

## Download and Install

### Desktop app (recommended)

Download the latest release from [GitHub Releases](https://github.com/SniKh1/forge/releases):

- `macOS`: desktop installer / app archive
- `Windows`: desktop installer

The desktop app is the primary path for end users. It handles:

- client detection
- install selection
- writing Forge configuration
- post-install verification

### CLI / scripts (advanced)

```bash
node packages/forge-cli/bin/forge.js setup
node packages/forge-cli/bin/forge.js verify
node packages/forge-cli/bin/forge.js doctor
```

Compatibility wrappers are still available:

```bash
bash install.sh
bash codex/install-codex.sh
bash gemini/install-gemini.sh
```

```powershell
.\install.ps1
.\codex\install-codex.ps1
.\gemini\install-gemini.ps1
```

These entrypoints are intended for power users, automation, and troubleshooting workflows.

## What Forge Installs

Forge installs client-specific capability packs, including:

- `MCP`: web search, memory, docs lookup, browser automation, and other extensions
- `Hooks`: enforced checkpoints around key actions
- `Skills`: reusable task-focused capability bundles
- `Rules`: behavior constraints and prompt-routing rules
- `Stacks`: frontend / Java / Python stack guidance
- `Memory / Learned`: project memory and learned patterns
- `Commands / Playbooks`: common workflow entrypoints

The desktop app lets users choose components by platform; the CLI and scripts keep deeper control paths available.

## Common Usage Paths

### As an end user

- download the desktop app
- choose `Claude`, `Codex`, or `Gemini`
- choose which components to install
- run install or repair

### As an advanced user

- use the CLI for install, verify, and doctor flows
- use compatibility scripts in existing shell workflows
- run the desktop app from source for local development

### Run the desktop app from source

```bash
npm install
cd apps/forge-desktop
npm run tauri:dev
```

## Support and Feedback

GitHub Issues is the public support channel:

- [Bug Report](https://github.com/SniKh1/forge/issues/new/choose)
- [Feature Request](https://github.com/SniKh1/forge/issues/new/choose)
- [Question](https://github.com/SniKh1/forge/issues/new/choose)

When possible, include:

- platform and version
- target client
- reproduction steps
- logs or screenshots

## Versioning and Compatibility

Forge now uses a unified repository version line: `0.x`.

That means:

- the CLI and desktop app share the same version
- Git tags and Release names stay aligned
- `0.x` signals active iteration with public open-source release discipline

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Commit Convention

Recommended commit prefixes:

- `feat`
- `fix`
- `docs`
- `chore`
- `ci`
- `release`

## Repository Surface

Only `README.md`, `README.en.md`, `CHANGELOG.md`, and `LICENSE` are intended as the public entrypoint surface. The rest of the docs and implementation material remain in-repo for maintenance and internal evolution, but are intentionally not part of the primary user path.

## License

Forge is released under the [MIT License](LICENSE).
