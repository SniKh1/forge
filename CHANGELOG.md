# Changelog

All notable changes to this project will be documented in this file.

The format follows a Keep a Changelog style, adapted for Forge.

## [Unreleased]

## [0.4.9] - 2026-03-23

### Added
- Added the greenfield `forge-workbench` application scaffold, route structure, diagnostics surface, and supporting Tauri shell so the new workbench line can iterate alongside the current desktop product.

### Fixed
- Fixed desktop install and repair flows so Forge now verifies the real local client result after execution instead of trusting script exit codes alone.
- Fixed desktop MCP state reporting so the UI can distinguish between selected MCPs, actually installed MCPs, and token-gated MCPs that were skipped.
- Fixed desktop skill verification so built-in `.system` skills such as `skill-creator` are counted correctly instead of being reported as missing after install.

## [0.4.8] - 2026-03-21

### Changed
- Switched Codex MCP management over to the official `codex mcp add/remove/get/list` registry flow instead of hand-editing `~/.codex/config.toml`.
- Reframed desktop runtime copy and diagnostics away from `preview` semantics so the UI now reflects native client homes plus the runtime cache explicitly.
- Decoupled persona quick apply from automatic MCP selection so role changes recommend stacks and skills without silently altering MCP choices.

### Fixed
- Fixed desktop install, repair, verify, external skill install, and external MCP install flows so they now target real client homes instead of desktop-only preview directories.
- Fixed external skill installs so Forge passes the active client to `skills add --agent`, rather than hardcoding Codex for every platform.
- Fixed Codex MCP verification and external MCP installs so they read and update the official Codex MCP registry directly.

## [0.4.7] - 2026-03-19

### Changed
- Simplified the desktop installer confirmation flow so role packs and stack packs stay directly visible, selection intent is easier to understand, and the modal no longer repeats the same primary action in multiple places.

### Fixed
- Fixed the desktop installer summary so selected component counts stay aligned with the actual role and stack choices instead of showing misleading totals.
- Fixed the persona selection UX so bulk actions remain clear and users no longer need to hunt across repeated controls to update configuration.

## [0.4.6] - 2026-03-19

### Added
- Added built-in Forge MCP catalog expansion and desktop token management for built-in MCP secrets, including explicit save/reset controls before install or repair.

### Fixed
- Fixed Codex MCP configuration updates so existing TOML tables such as `[model_providers.custom]` are preserved instead of being rewritten as invalid quoted strings.
- Fixed external MCP installs for Codex so they reuse the same TOML serializer and no longer corrupt unrelated Codex config sections while adding `mcp_servers`.
- Fixed desktop install and repair flows so built-in MCP secrets are injected from saved values and missing secret-backed MCPs are skipped instead of writing broken configuration.
- Fixed Claude repair and verification flows on macOS and Windows so runtime skill helper scripts are executed as CommonJS `.cjs` files instead of crashing under ESM package boundaries.
- Fixed desktop dev/runtime resource resolution so packaged `_up_` leftovers no longer override the current source tree during local Tauri runs.
- Fixed desktop action logs so ANSI escape sequences and raw internal helper output no longer leak directly into the UI.

## [0.4.5] - 2026-03-19

### Fixed
- Fixed Codex detection so Forge only marks Codex as detected when the official `codex` command is actually available, instead of treating the presence of `~/.codex` as a healthy install.
- Fixed Codex verification and install self-checks on Windows and Unix so they now fail loudly when the `codex` CLI is missing from `PATH`, preventing false "ready" states in support diagnostics and release builds.
- Fixed the desktop installer status model so a Forge-configured client without a working official CLI is shown as a distinct "client missing" state instead of being misrepresented as ready.
- Fixed Claude MCP configuration fallback so permission failures writing `~/.claude/.mcp.json` now fall back to `~/.claude.json`, and the external MCP installer reuses the same recovery path.

## [0.4.3] - 2026-03-18

### Added
- Added a first-class desktop action to install the official current client (`Claude`, `Codex`, or `Gemini`) directly from Forge instead of only copying a command.
- Added a standalone Windows diagnostic script for installed Forge builds so support can capture runtime state without requiring the source repo dev flow.

### Fixed
- Fixed desktop status loading so it now checks only detected clients, preventing missing `Codex` or `Gemini` installs from breaking the `Claude` platform view.
- Fixed Forge client install and repair flows so missing official clients are bootstrapped before Forge configuration is applied.
- Fixed the installed-build diagnostic script so it no longer crashes when `Forge.exe` is missing from the common install paths and now also searches Windows uninstall registry entries.

## [0.4.2] - 2026-03-17

### Changed
- Reframed desktop install and repair actions so they now speak in terms of the current client configuration instead of vaguely "repairing Forge".
- Stabilized the desktop development loop by reusing an existing Vite dev server when `tauri dev` is launched repeatedly.

### Fixed
- Fixed Windows Codex repair so the PowerShell installer no longer fails at parse time when run non-interactively.
- Fixed desktop long-running actions to run off the UI thread and show an explicit blocking progress overlay instead of appearing frozen.
- Fixed the Windows desktop dev launcher so `npm run tauri:dev` no longer crashes with `spawn EINVAL` when starting the frontend server.
- Fixed desktop source builds to tolerate the TypeScript package shipping `_tsc.js` instead of `tsc.js` on some local npm installs.
- Fixed Vite dev watching so Tauri `target/` output no longer causes noisy full reload loops during desktop development.
- Removed the remaining hard-coded local preview paths from desktop mock status data before publishing a public release.

## [0.4.1] - 2026-03-16

### Changed
- Expanded the desktop installer persona model with richer role packs and stack packs, while keeping role selection single-choice and stack selection multi-choice.
- Refined the install surface so users can understand whether the selected role's baseline stacks are already present on the current client.

### Fixed
- Fixed bundled desktop builds so Forge now reads its packaged CLI/resources instead of depending on the original source checkout path.
- Fixed Windows desktop actions to stop inheriting a hard-coded macOS workspace path, which prevented status reads on fresh machines.
- Hid Windows helper console windows during Forge desktop actions and moved bundled external-registry cache writes to an app cache directory.
- Fixed Codex non-interactive installs so existing local configuration now auto-backs up instead of failing on an unattended `(y/n)` prompt.
- Eliminated duplicate runtime-skill warnings caused by top-level skill sync colliding with `.system` built-ins such as `skill-creator`.
- Backfilled missing default permission rules into Claude `settings.json` during incremental installs so verification no longer reports an empty permissions list.
- Added stack-level bulk selection and clearer current-persona emphasis in the desktop installer UI.

## [0.4.0] - 2026-03-16

### Changed
- Renamed the public desktop product surface from `Forge Desktop` to `Forge` while keeping the internal desktop workspace path stable.
- Switched the macOS release line to publish Apple Silicon `.dmg` assets only.
- Introduced a two-line branch model built around `public` for releases and `dev` for full internal development.

### Added
- Added `BRANCHING.md` and `CODEOWNERS` to document and support repository governance.
- Added richer desktop installer persona coverage for frontend, mobile, backend, data, security, product, QA, architecture, platform, and release workflows.

### Fixed
- Added a release preflight check so release tags only publish when they point to commits reachable from `public`.
- Fixed unattended Codex repair/install flows that previously failed when backup confirmation was required in non-interactive mode.
- Fixed runtime-skill deduplication so built-in `.system` skills do not surface as duplicate installed skills during verification.
- Fixed incremental Claude installs so missing permission defaults are restored automatically instead of leaving a partially configured `settings.json`.

## [0.3.9] - 2026-03-16

### Changed
- Retargeted the macOS release asset to Apple Silicon by building the published `.dmg` on `macos-14`, so GitHub Releases ship an installer meant for M-series Macs.

## [0.3.8] - 2026-03-16

### Fixed
- Switched the Intel macOS release job from `macos-13` to `macos-15-intel` after GitHub Actions rejected the previous runner configuration for the x64 `.dmg` build.

## [0.3.7] - 2026-03-16

### Fixed
- Removed the SVG icon from the Tauri desktop bundle configuration so macOS `.app` and `.dmg` packaging no longer fail during app icon generation in release builds.

## [0.3.6] - 2026-03-13

### Changed
- Switched macOS release builds from cross-target matrix builds on `macos-latest` to native runner builds on `macos-14` (arm64) and `macos-13` (x64).

### Fixed
- Removed the remaining cross-architecture macOS release path assumptions that were still breaking tagged desktop builds for `v0.3.5`.

## [0.3.5] - 2026-03-13

### Changed
- Replaced the GitHub release pipeline with a two-stage flow: matrix builds upload artifacts first, then a dedicated release job publishes them to GitHub Releases.

### Fixed
- Removed the previous `tauri-action` release coupling that was failing with `git` exit code `128` during tagged release builds.
- Standardized release assets to `macOS arm64 app.tar.gz`, `macOS x64 dmg`, and `Windows msi`.

## [0.3.4] - 2026-03-13

### Added
- Extended promotion patch drafts so `domain pack` targets (`ecommerce`, `video-creation`, `image-generation`, `workflow-automation`) can produce domain-aware `Output Shape`, `Validation Checklist`, and `Collaboration Contract` suggestions.

### Fixed
- Added explicit Tauri `bundle.icon` configuration so Windows release packaging can resolve the `.ico` icon during GitHub Actions builds.

## [0.3.3] - 2026-03-12

### Fixed
- Added the Windows `.ico` application icon required by `tauri-build` so Windows release packaging can complete on GitHub Actions.
- Adjusted the GitHub release matrix so Apple Silicon macOS builds publish an `.app` bundle instead of failing during `dmg` creation.

## [0.3.2] - 2026-03-12

### Fixed
- Added the standard npm `tauri` script expected by `tauri-action`, so GitHub Releases can invoke `npm run tauri build` successfully.
- Prepared a follow-up patch after `v0.3.1` failed at the desktop build command entrypoint.

## [0.3.1] - 2026-03-12

### Fixed
- Corrected the GitHub Release workflow to use a valid `tauri-apps/tauri-action` reference.
- Prepared a patch release after the initial `v0.3.0` tag failed before asset publication.

## [0.3.0] - 2026-03-12

### Added
- Unified open-source repository entrypoints with bilingual public README pages.
- GitHub issue templates for bug reports, feature requests, and user questions.
- Pull request template for public collaboration.
- GitHub Actions workflows for CI validation and tagged desktop release builds on macOS and Windows.
- Release-oriented project metadata aligned around a single repository version line.

### Changed
- Repositioned the project as a public open-source desktop installer and configuration distribution repo.
- Reduced the public doc surface to `README.md`, `README.en.md`, `CHANGELOG.md`, and `LICENSE`.
- Standardized CLI and desktop app versioning under a shared `0.x` release line.
- Updated release guidance to point users to GitHub Releases instead of internal implementation docs.

### Fixed
- Eliminated version drift between the root workspace, Forge CLI, and Forge Desktop metadata.

### Removed
- Public README links that exposed internal implementation and planning documents as first-class navigation.
