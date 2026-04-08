# Hooks System

## 当前状态

hooks 系统当前处于**设计阶段**。本文档定义 hooks 的语义和触发时机，实际执行由各客户端运行时层实现。

`hooks/hooks.json.template` 提供配置模板，实际 hook 行为由客户端（Claude、Codex、Gemini）的运行时处理，而非 Forge 核心直接执行。

---

hooks 是自动检查点，不是承载大段业务逻辑的地方。

## Hook Goals
- 恢复 session continuity
- 捕获 tool observation
- 触发 learning checkpoint
- 持久化 durable session artifact
- 审计 debug residue 与高风险输出

## Current Hook Surfaces

### SessionStart
- 恢复 session continuity
- 识别当前 workspace、package manager 和运行上下文

### SessionEnd
- 持久化 session state
- 判断当前 session 是否值得进入 learning promotion review
- 保存基于 observation 的 instincts
- 创建或更新 problem-solution memory scaffold
- 刷新 problem-solution review queue
- 对 reviewed records 生成 promotion suggestion 的 Markdown + JSON sidecar

### PreCompact
- 在 context compaction 前保存状态

### PreToolUse
- 记录 tool start event
- 提醒长时间运行的 dev server 处理方式
- 在敏感操作（如 `git push`）前做额外提醒

### PostToolUse
- 记录 tool completion event
- 输出 PR link 或其他 workflow notice
- 在编辑后提醒检查 `console.log` residue

### Stop
- 做最后一轮 debug residue audit

## Design Rules
- hooks 负责触发 checkpoint，不负责替代 skill
- hooks 可以采集数据，但 durable promotion 仍应进入结构化 memory targets
- hook 文档与 hook template 必须始终保持一致
