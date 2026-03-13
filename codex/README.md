# Forge Codex Pack

这个 package 的目标，是把 Forge 的 workflow asset、规则体系和学习链路尽量等价地移植到 Codex。

See also:
- [`../README.md`](../README.md)
- [`../docs/user/getting-started.md`](../docs/user/getting-started.md)
- [`../docs/CLIENT-CAPABILITY-MATRIX.md`](../docs/CLIENT-CAPABILITY-MATRIX.md)

## What gets installed
- `~/.codex/AGENTS.md`（由 template 生成）
- `~/.codex/forge/{agents,commands,contexts,core,roles,rules,stacks,hooks,scripts}`
- `~/.codex/skills/*`（仓库中的 repo skills，不含 `learned`）
- `~/.codex/skills/learned`
- `~/.codex/projects/<workspace-slug>/memory/{MEMORY.md,PROJECT-MEMORY.md}`
- `~/.codex/homunculus/{instincts,evolved}`
- `~/.codex/forge/scripts/codex-learning/*`

## Governance model
- 全局规则放在 `forge/CLAUDE.md` 与 `forge/rules/global-core.md`
- 角色行为放在 `forge/roles/*.md`
- stack 约束放在 `forge/stacks/*.md`
- skill registry 放在 `forge/core/skill-registry.json`

## Install

macOS/Linux:
```bash
bash codex/install-codex.sh
```

Windows (PowerShell):
```powershell
.\codex\install-codex.ps1
```

## Verify

macOS/Linux:
```bash
bash codex/scripts/verify-codex.sh
bash codex/scripts/test-codex-mcp.sh
```

Windows (PowerShell):
```powershell
.\codex\scripts\verify-codex.ps1
.\codex\scripts\test-codex-mcp.ps1
```

## Notes
- Codex 没有 Claude 那种完全同构的 hooks 执行链，所以 Forge 在 Codex 中主要采用“等价检查点”来复刻行为。
- 学习系统、problem-solution memory、instincts、learned outputs 都已经接进 Codex 本地目录结构。
