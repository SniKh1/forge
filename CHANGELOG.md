# Changelog

## [Unreleased]

### Security
- **CRITICAL**: Removed hardcoded Exa API key from `mcp.json.template`
  - Template now uses `{{EXA_API_KEY}}` placeholder
  - Installation scripts prompt for API key during setup
  - Users can skip and manually configure later

### Added
- Interactive API key configuration during installation
  - macOS/Linux: `install.sh` prompts for Exa API key
  - Windows: `install.ps1` prompts for Exa API key
- FAQ section for Exa API key configuration in README files

### Changed
- `mcp.json.template`: Replaced hardcoded token with `{{EXA_API_KEY}}` placeholder
- `install.sh`: Added interactive prompt for Exa API key
- `install.ps1`: Added interactive prompt for Exa API key
- Updated README.md and README.zh-CN.md with MCP server details

### Fixed
- macOS installation now properly handles MCP configuration
- Template variable replacement for sensitive credentials

---

## Previous Versions

See git history for earlier changes.
