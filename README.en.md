# Forge

<p align="center">
  <strong>A unified installer and capability distribution repo for Claude, Codex, and Gemini.</strong>
</p>

<p align="center">
  <a href="README.md">简体中文</a> ·
  <a href="https://github.com/SniKh1/forge/releases">Releases</a> ·
  <a href="https://github.com/SniKh1/forge/issues">Issues</a>
</p>

<p align="center">
  <img alt="Release" src="https://img.shields.io/github/v/release/SniKh1/forge?display_name=tag">
  <img alt="License" src="https://img.shields.io/github/license/SniKh1/forge">
  <img alt="Platforms" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-111827">
</p>

Forge exists to collapse scattered AI client setup into one installable, verifiable, repairable distribution path.

For end users, Forge ships a graphical installer.  
For advanced users, Forge keeps CLI and script entrypoints.  
For maintainers, Forge centralizes rules, skills, memory, and workflow governance.

## Quick Links

| Goal | Entry |
| --- | --- |
| Install Forge | [GitHub Releases](https://github.com/SniKh1/forge/releases) |
| Check changes | [CHANGELOG.md](CHANGELOG.md) |
| Review branch strategy | [BRANCHING.md](BRANCHING.md) |
| Open support issues | [GitHub Issues](https://github.com/SniKh1/forge/issues) |

## Support Matrix

| Dimension | Current Support |
| --- | --- |
| Platforms | `macOS`, `Windows` |
| Clients | `Claude`, `Codex`, `Gemini` |
| Product name | `Forge` |
| Distribution | GUI app + CLI + compatibility scripts |
| macOS release target | Apple Silicon `.dmg` |

## What Forge Installs

Forge writes a full capability layer tailored to the target client and platform:

- `MCP`: web search, memory, docs lookup, browser automation, and related extensions
- `Hooks`: enforced checkpoints around key actions
- `Skills`: reusable task-specific capability bundles
- `Rules`: behavior constraints and prompt-routing rules
- `Stacks`: frontend / Java / Python stack guidance
- `Memory / Learned`: project memory and learned patterns
- `Commands / Playbooks`: common workflow entrypoints

## Installation Paths

### GUI installer

Download the latest release from [GitHub Releases](https://github.com/SniKh1/forge/releases):

- `macOS`: Apple Silicon `.dmg`
- `Windows`: `.msi`

The GUI installer is the default user path. It handles:

- client detection
- install scope selection
- writing Forge configuration
- post-install verification and repair

### CLI / script entrypoints

```bash
node packages/forge-cli/bin/forge.js setup
node packages/forge-cli/bin/forge.js verify
node packages/forge-cli/bin/forge.js doctor
```

Compatibility wrappers remain available:

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

## Run From Source

```bash
npm install
cd apps/forge-desktop
npm run tauri:dev
```

Notes:

- The public product name is now `Forge`
- The internal workspace path remains `apps/forge-desktop` to avoid breaking the existing build chain

## Branch Model

Forge uses a deliberately small branching model:

| Branch | Purpose |
| --- | --- |
| `public` | External-facing stable line and the only branch allowed to produce release tags |
| `dev` | Full internal integration line |
| `feature/*` | Short-lived feature branches |
| `hotfix/*` | Short-lived repair branches |

Full details and recommended protection rules live in [BRANCHING.md](BRANCHING.md).

## Support and Feedback

Public feedback goes through GitHub Issues:

- [Bug Report](https://github.com/SniKh1/forge/issues/new/choose)
- [Feature Request](https://github.com/SniKh1/forge/issues/new/choose)
- [Question](https://github.com/SniKh1/forge/issues/new/choose)

When possible, include:

- platform and version
- target client
- reproduction steps
- logs or screenshots

## Versioning

Forge uses a unified repository version line:

- the CLI and GUI app share the same version
- Git tags and GitHub Releases stay aligned
- `0.x` still signals active iteration, but under explicit public-repo governance

## License

Forge is released under the [MIT License](LICENSE).
