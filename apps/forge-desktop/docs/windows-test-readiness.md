# Forge Desktop Windows Test Readiness

Last updated: 2026-03-26

## Goal

把 Windows 测试聚焦在真实客户端安装、Forge 配置写入、状态回流和 Community 安装链路，不再花时间重复验证已经在 macOS 上收过的基础 UI。

## Current Scope

- Desktop shell: Tauri 2
- Clients in scope:
  - Claude
  - Codex
  - Gemini
  - OpenCode
- Core flows in scope:
  - Detect current environment
  - Bootstrap official client
  - Install Forge configuration
  - Repair Forge configuration
  - Verify current configuration
  - Search Community items
  - Install external skill / MCP

## Preflight

Before opening the app on Windows:

1. Confirm Node.js is installed and available in `PATH`
2. Confirm Python 3 is installed and available in `PATH`
3. Confirm Git is installed and available in `PATH`
4. Confirm at least one target client is installed or can be installed from the app
5. Confirm Codex home, Claude home, Gemini home, and OpenCode home are writable

## Test Matrix

### Platform Detection

For each client:

1. Open `Platform`
2. Switch to the client
3. Verify the switcher card status
4. Verify hero title / primary action / secondary action
5. Verify right-side summary counts
6. Verify `Settings` shows consistent runtime status

Expected:

- Status does not jump back to another client
- Detection reflects local machine reality
- Missing runtime or client prerequisites surface in `Requirements`

### Official Bootstrap

For each client not yet installed:

1. Click the bootstrap action
2. Wait for result
3. Refresh app state
4. Re-open the same client

Expected:

- Client command becomes detectable
- Hero moves from bootstrap state to install/apply or repair state
- Action feedback explains next step

### Forge Install / Repair / Verify

For each client:

1. Select role(s), stacks, skills, MCP, memory
2. Run `Install`
3. Open review drawer and confirm write scope is correct
4. Run `Verify`
5. If applicable, change one setting and run `Repair`

Expected:

- Selected role / stack / skill choices match what gets written
- Verify result reflects actual files and configured MCP/skills
- Repair updates existing setup instead of producing conflicting state

### Community

For `skills` and `MCP` tabs:

1. Search with a simple query
2. Confirm results are returned
3. Install one item
4. Confirm result card updates to `已安装` after refresh
5. Confirm item also appears in `Platform` or `Settings` state

Expected:

- Search works
- Install succeeds or fails with actionable feedback
- Installed state flows back into the app

### OpenCode

1. Verify detection of existing `opencode.json`
2. Run bootstrap if OpenCode CLI is missing
3. Run install / repair
4. Run verify
5. Install one external MCP from Community
6. Confirm `opencode.json` updates and app state reflects it

Expected:

- OpenCode is no longer treated as display-only
- Instructions and MCP are written consistently
- Verify catches missing instructions / MCP / skill references

## Known Risk Areas

- Windows-specific `PATH` and global npm command resolution
- Client home path differences across shells and user accounts
- `opencode` installation path and command discovery on Windows
- Python-dependent MCP configuration helpers
- Post-install verification may pass in one shell and fail in another if environment differs

## Exit Criteria

Ready to leave Windows test phase when:

- All 4 clients can be detected or intentionally bootstrapped
- Claude / Codex / Gemini install-repair-verify loop works
- OpenCode install-repair-verify loop works
- Community install flow works for at least one skill and one MCP
- Settings diagnostics match actual machine environment
