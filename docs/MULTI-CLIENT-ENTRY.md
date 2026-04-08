# Multi-Client Entry Point Strategy

**Version**: v1.0  
**Updated**: 2026-04-01

## Overview

Forge 支持多个 AI 客户端，每个客户端使用不同的入口文件名约定：
- **Claude**: `CLAUDE.md` (主入口) → `AGENT.md` (备用) → `rules/`
- **Codex**: `AGENT.md` (主入口) → `rules/`
- **Gemini**: `GEMINI.md` (主入口) → `AGENT.md` (备用) → `rules/`

## Design Principles

1. **客户端隔离**: 每个客户端有独立的主入口文件
2. **优雅降级**: 主入口不存在时，回退到通用 AGENT.md
3. **规则共享**: 所有客户端共享 `rules/` 目录的核心规则
4. **零冲突**: 不同客户端的入口文件互不干扰

## Entry Priority

### Claude
```
CLAUDE.md (存在) → 使用 CLAUDE.md
CLAUDE.md (不存在) → 回退到 AGENT.md
AGENT.md (不存在) → 仅使用 rules/
```

### Codex
```
AGENT.md (存在) → 使用 AGENT.md
AGENT.md (不存在) → 仅使用 rules/
```

### Gemini
```
GEMINI.md (存在) → 使用 GEMINI.md
GEMINI.md (不存在) → 回退到 AGENT.md
AGENT.md (不存在) → 仅使用 rules/
```

## File Relationships

```
项目根目录/
├── CLAUDE.md          # Claude 专用入口
├── AGENT.md           # 通用备用入口（Codex 主入口）
├── GEMINI.md          # Gemini 专用入口
└── rules/             # 共享规则库
    ├── global-core.md
    ├── agents.md
    ├── learning-memory.md
    ├── security.md
    ├── testing.md
    └── hooks.md
```

## Implementation Strategy

### 客户端特定入口文件
- 包含客户端特定的配置和优化
- 通过引用 `rules/` 保持规则一致性
- 可以覆盖或扩展通用规则

### AGENT.md 作为备用
- 提供最小可用配置
- 适用于所有客户端
- 不包含客户端特定优化

### rules/ 目录
- 存储所有核心规则
- 被所有入口文件引用
- 单一真值来源

## Migration Path

从 Codex 项目迁移到多客户端支持：
1. 保持 `AGENT.md` 不变（Codex 继续使用）
2. 创建 `CLAUDE.md` 并引用相同的 `rules/`
3. 在 `CLAUDE.md` 中添加 Claude 特定优化
4. 确保两个入口文件的核心规则保持一致

## Verification

检查多客户端配置是否正确：
- [ ] `CLAUDE.md` 存在且引用 `rules/`
- [ ] `AGENT.md` 存在且可独立工作
- [ ] `rules/` 目录包含所有核心规则
- [ ] 不同客户端使用各自入口时行为一致
- [ ] 备用入口回退机制正常工作
