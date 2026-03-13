# Workflow Automation Stack Pack

## Scope
用于多步骤自动化、工具编排、MCP/tool orchestration、低重复劳动收束和跨系统流程连接。

## Defaults
- 先建模流程边界和输入输出，再考虑自动化实现。
- 优先减少人为重复步骤，而不是为了自动化而自动化。
- 自动化任务默认要有失败回退、重试策略和可观察性。
- 先把 workflow 讲清楚，再决定是用 script、MCP 还是 agent 串联。

## Typical Inputs
- 重复的文档、浏览器、数据库、表单、通知流程
- MCP 工具串联需求
- 多步运营或开发流程自动化
- 低代码/脚本/agent 结合的工作流设计

## Preferred Skills
- `brainstorming`
- `context-engineering`
- `mcp-management`
- `mcp-builder`
- `browser-use`
- `backend-development`
- `devops`
- `code-review`

## Recommended MCP / Tools
优先使用：
- `memory`
- `fetch`
- `browser-use`
- `playwright`
- `GitHub MCP`
- 其他 MCP 按具体流程需要补充

## Output Shape
- workflow map
- step-by-step input/output contract
- failure and retry note
- observability / diagnostics note
- automation ownership note

## Validation Checklist
- 输入输出边界是否清楚？
- 哪些步骤适合自动化，哪些不适合？
- 失败时能否回滚、重试或人工接管？
- 是否存在重复编排、隐式依赖或难观察的黑盒流程？

## Collaboration Contract
- 与 `solution-architect + architecture` 配合时，先画出边界和依赖图。
- 与 `developer` 配合时，优先拆出最小可用自动化单元。
- 与 `release-devex + release` 配合时，优先补观测、诊断和失败恢复。
