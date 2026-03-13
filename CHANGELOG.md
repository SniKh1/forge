# Changelog

All notable changes to this project will be documented in this file.

The format follows a Keep a Changelog style, adapted for Forge.

## [Unreleased]

### Added
- Placeholder for upcoming changes.

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
