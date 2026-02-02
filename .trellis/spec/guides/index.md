# Thinking Guides & Development Specifications

> **Purpose**: 完整的开发规范体系，涵盖思维指南、能力索引、工具规范、质量标准。

---

## Why Thinking Guides?

**Most bugs and tech debt come from "didn't think of that"**, not from lack of skill:

- Didn't think about what happens at layer boundaries → cross-layer bugs
- Didn't think about code patterns repeating → duplicated code everywhere
- Didn't think about edge cases → runtime errors
- Didn't think about future maintainers → unreadable code

These guides help you **ask the right questions before coding**.

---

## Available Guides

### Thinking Guides (Original)

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md) | 识别模式、减少重复 | 发现重复模式时 |
| [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md) | 跨层数据流思考 | 跨多层的功能 |

### Claude Code 能力与工具规范 (New)

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [Claude Code 能力索引](./claude-code-capabilities.md) | 所有可用能力的唯一真相源 | 需要查找工具/Skill/Agent 时 |
| [Skill 使用规范](./skill-usage-guide.md) | Skill 铁律、匹配表、触发规则 | 每次交互前检查 |
| [MCP 工具规范](./mcp-tools-guide.md) | MCP 工具链决策树和用法 | 需要搜索/文档/记忆时 |
| [Agent 编排规范](./agent-orchestration-guide.md) | 双层 Agent 统一调度 | 启动子代理前 |

### 开发流程与质量规范 (New)

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [开发工作流规范](./development-workflow-guide.md) | 任务分级、Git、Vibe Coding | 开始任何开发任务前 |
| [安全与质量规范](./security-quality-guide.md) | 安全检查、代码风格、TDD | 编码中和提交前 |
| [自我学习与记忆](./learning-memory-guide.md) | Homunculus、instincts、记忆 | 跨会话知识管理 |

### Trellis 运维规范 (New)

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [Trellis 运维操作](./trellis-operations-guide.md) | Ralph Loop、Task 管理、Worktree、Developer 身份 | 使用 Trellis 流水线时 |

---

## Quick Reference: Thinking Triggers

### When to Think About Cross-Layer Issues

- [ ] Feature touches 3+ layers (API, Service, Component, Database)
- [ ] Data format changes between layers
- [ ] Multiple consumers need the same data
- [ ] You're not sure where to put some logic

→ Read [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md)

### When to Think About Code Reuse

- [ ] You're writing similar code to something that exists
- [ ] You see the same pattern repeated 3+ times
- [ ] You're adding a new field to multiple places
- [ ] **You're modifying any constant or config**
- [ ] **You're creating a new utility/helper function** ← Search first!

→ Read [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md)

---

## Pre-Modification Rule (CRITICAL)

> **Before changing ANY value, ALWAYS search first!**

```bash
# Search for the value you're about to change
grep -r "value_to_change" .
```

This single habit prevents most "forgot to update X" bugs.

---

## How to Use This Directory

1. **Before coding**: Skim the relevant thinking guide
2. **During coding**: If something feels repetitive or complex, check the guides
3. **After bugs**: Add new insights to the relevant guide (learn from mistakes)

---

## Contributing

Found a new "didn't think of that" moment? Add it to the relevant guide.

---

**Core Principle**: 30 minutes of thinking saves 3 hours of debugging.
