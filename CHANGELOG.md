# Changelog

All notable changes to this project will be documented in this file.

The format follows a Keep a Changelog style, adapted for Forge.

## [Unreleased]

### Added
- Placeholder for upcoming changes.

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
