# Changelog

## [Unreleased]

### Major Refactoring

**Installation Scripts**:
- Completely rewritten `install.sh` and `install.ps1` with unified functionality
- Added bilingual support (Chinese/English) with Chinese as default
- Added installation mode selection (incremental/full)
- Incremental mode preserves existing files (default)
- Full mode overwrites all files
- Integrated MCP configuration using `claude mcp add` commands
- Automatic `uvx` installation for fetch MCP server
- Interactive Exa API key configuration
- Built-in verification

**Removed Redundant Scripts**:
- `scripts/install-mcp.sh` - merged into main installer
- `scripts/install-skills.sh/ps1` - merged into main installer
- `scripts/verify-mcp.sh` - merged into main installer
- `docs/MCP-SETUP-GUIDE.md` - internal documentation removed

**Documentation**:
- README.md now defaults to Chinese (简体中文)
- README.en.md for English version
- Removed README.zh-CN.md (replaced by README.md)
- Simplified documentation structure

### Fixed

- **CRITICAL**: Corrected MCP server package names
  - `@modelcontextprotocol/server-exa` → `exa-mcp-server`
  - `@cognitionnow/deepwiki-mcp` → `deepwiki-mcp`

- **CRITICAL**: Fixed MCP configuration method
  - Changed from copying `.mcp.json` to using `claude mcp add` commands
  - MCP servers now properly register in `~/.claude.json`
  - Configuration persists across Claude Code restarts

### Security

- **CRITICAL**: Removed hardcoded Exa API key from `mcp.json.template`
  - Template now uses `{{EXA_API_KEY}}` placeholder
  - Installation scripts prompt for API key during setup
  - Users can skip and manually configure later

### Added

- Bilingual installation interface (Chinese/English)
- Installation mode selection (incremental/full)
- Automatic dependency checking
- Optional backup creation before installation
- Integrated MCP server configuration
- Automatic `uvx` (uv package manager) installation
- Interactive API key configuration
- Built-in installation verification

### Changed

- Default language: English → Chinese
- Default installation mode: Full → Incremental
- Single unified installation script per platform
- Simplified project structure
- Improved user experience with interactive prompts

---

## Previous Versions

See git history for earlier changes.
