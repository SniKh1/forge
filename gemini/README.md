# Forge Gemini Pack

这个 adapter 的目标，是把 Forge 的核心资产安装到 Gemini CLI，并尽量保持和 Claude / Codex 一致的治理结构。

See also:
- [`../README.md`](../README.md)
- [`../docs/user/getting-started.md`](../docs/user/getting-started.md)
- [`../docs/CLIENT-CAPABILITY-MATRIX.md`](../docs/CLIENT-CAPABILITY-MATRIX.md)

## What gets installed
- `~/.gemini/forge/{agents,commands,contexts,core,roles,rules,stacks,hooks,scripts}`
- `~/.gemini/GEMINI.md`
- `~/.gemini/settings.json`（会合并 Forge MCP servers）
- `~/.gemini/projects/<workspace>/memory/*`
- `~/.gemini/skills/learned/*`

## Governance model
- 全局规则放在 `forge/CLAUDE.md` 与 `forge/rules/global-core.md`
- 角色行为放在 `forge/roles/*.md`
- stack 约束放在 `forge/stacks/*.md`
- skill registry 放在 `forge/core/skill-registry.json`

## Install

macOS/Linux:
```bash
bash gemini/install-gemini.sh
```

Windows:
```powershell
.\gemini\install-gemini.ps1
```

## Verify

macOS/Linux:
```bash
bash gemini/scripts/verify-gemini.sh
bash gemini/scripts/test-gemini-mcp.sh
```

Windows:
```powershell
.\gemini\scripts\verify-gemini.ps1
.\gemini\scripts\test-gemini-mcp.ps1
```

## Notes
- Gemini 侧当前以 `MCP + prompt/rules + memory scaffold` 为主，不追求和 Claude hooks 完全同构。
- 角色包、stack-pack、skill registry 已经进入 Gemini 的 Forge 目录，后续可以继续和 Desktop / CLI 的推荐逻辑对齐。
