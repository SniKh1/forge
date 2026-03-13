# Global Core Rules

这些规则对所有 worker type、stack 和客户端都成立。

## 什么内容应该放在这里
- task grading 与执行模式
- agent / playbook 编排原则
- memory 与 learning policy
- verification 与 completion rules
- security boundaries
- default tool behavior
- 多客户端能力语义：`Native` / `Adapted` / `Fallback`

## 什么内容不应该放在这里
- language-specific style rules
- framework-specific best practices
- role-specific deliverable guidance
- domain-specific process rules

## Default Tool Behavior
- 文档查阅：优先 official docs（`context7`），再看开源实现解释（`deepwiki`），最后才做更宽泛的 web search（`exa`）
- browser automation：以 `core/tool-defaults.json` 作为机器可读真值来源
- browser automation：正常的 developer / UI 工作流默认优先 `browser-use`，并使用真实浏览器 + `Default` profile
- 只有任务明确要求隔离时，才切换到 `incognito`、`headless`、`fresh-profile`
- 浏览器类 skill 的主从关系以 `docs/internal/browser-automation-cluster-v1.md` 为准：`browser-use` 是 primary，`browser` 与 `chrome-devtools` 是 support
- memory capture：持久化经验优先写入 Forge 统一 memory 结构，不再散落成随意临时笔记

## Completion Rules
- 没有验证证据，不要声称任务已完成。
- 完成前移除 debug residue。
- 对重要里程碑，优先考虑走一次 `/learn` 等价捕获。
