# Claude Desktop Capabilities

**Version**: 1.0  
**Updated**: 2026-04-01

## Overview

Claude Desktop (Tauri-based) has native OS integration capabilities that CLI/API modes cannot access. This document clarifies the boundary and provides alternatives.

---

## Desktop-Only Features

### 1. Terminal Integration
- **Command**: `open_terminal_here(cwd)`
- **Function**: Opens native terminal at specified directory
- **Platform Support**: macOS (Terminal.app), Windows (cmd), Linux (gnome-terminal/konsole)

### 2. File/URL Opening
- **Command**: `open_target(target)`
- **Function**: Opens files or URLs with default system application
- **Platform Support**: macOS (open), Windows (start), Linux (xdg-open)

### 3. Client Configuration Management
- **Commands**: 
  - `bootstrap_official_client(client)` - Initialize Claude/Codex/Gemini configs
  - `install_client_config(payload)` - Install client-specific settings
  - `repair_client_config(payload)` - Fix broken configurations
  - `verify_client_config(payload)` - Validate config integrity
- **Function**: Manage multi-client setup and configuration files

### 4. MCP Secrets Management
- **Commands**:
  - `load_builtin_mcp_secrets()` - Load encrypted MCP credentials
  - `save_builtin_mcp_secrets(values)` - Save encrypted MCP credentials
- **Function**: Secure storage for MCP server authentication

### 5. External Resource Discovery
- **Commands**:
  - `search_external_skills(query)` - Search Forge skill marketplace
  - `search_external_mcp(query)` - Search MCP server registry
  - `install_external_skill(payload)` - Install community skills
  - `install_external_mcp(payload)` - Install MCP servers
- **Function**: Browse and install external extensions

### 6. Application State
- **Command**: `get_app_state()`
- **Function**: Retrieve desktop app runtime state and metadata

---

## CLI/API Alternatives

| Desktop Feature | CLI/API Alternative |
|----------------|---------------------|
| `open_terminal_here` | Provide command string for user to run manually |
| `open_target` | Return file path or URL for user to open |
| `bootstrap_official_client` | Manual config file creation with templates |
| MCP secrets | Environment variables or `.env` files |
| External skill search | Direct GitHub/registry URLs |
| External skill install | Manual `git clone` + symlink instructions |
| App state | Read from config files directly |

---

## Capability Matrix

| Feature | Desktop | CLI | API |
|---------|---------|-----|-----|
| Terminal launch | ✅ Native | ❌ Manual | ❌ Manual |
| File opening | ✅ Native | ❌ Manual | ❌ Manual |
| Config bootstrap | ✅ Automated | ⚠️ Template | ⚠️ Template |
| Secret storage | ✅ Encrypted | ⚠️ Env vars | ⚠️ Env vars |
| Skill marketplace | ✅ Integrated | ⚠️ Manual | ⚠️ Manual |
| MCP discovery | ✅ Integrated | ⚠️ Manual | ⚠️ Manual |

**Legend**: ✅ Full support | ⚠️ Workaround available | ❌ Not available

---

## Usage Guidelines

### For Desktop Users
- Use native commands directly via UI or Tauri invoke
- Leverage integrated marketplace for skills/MCP
- Benefit from encrypted secret storage

### For CLI/API Users
- Expect manual steps for OS integration tasks
- Use environment variables for secrets
- Install skills/MCP via Git or package managers
- Reference config templates in `~/.claude/`, `~/.codex/`, `~/.gemini/`

---

## Security Notes

1. **Desktop**: Secrets encrypted via OS keychain/credential manager
2. **CLI/API**: Secrets in plaintext `.env` - ensure proper file permissions (600)
3. **All modes**: Never commit secrets to version control

---

## Related Documentation

- `docs/FORGE-ARCHITECTURE.md` - Overall system design
- `core/tool-defaults.json` - Tool capability definitions
- `apps/forge-desktop/src-tauri/src/main.rs` - Tauri command implementations
