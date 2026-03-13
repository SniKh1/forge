# Forge Role MCP Matrix v1

**Updated**: 2026-03-12

这份文件把第一阶段 role-pack 与推荐 skills、stack、官方 MCP 集成做了映射。

机器可读真值来源：
- `core/role-mcp-matrix.json`

## Product Manager

- Stack: `product`
- Core skills: `brainstorming`, `doc-coauthoring`, `internal-comms`, `mcp-management`
- Official MCP:
  - Notion MCP
  - Atlassian Rovo MCP
  - Linear MCP
  - Slack MCP
  - GitHub MCP

## UI Designer

- Stack: `design`
- Core skills: `frontend-design`, `aesthetic`, `ui-styling`, `browser-use`, `web-design-guidelines`
- Official MCP:
  - Figma MCP Server
  - GitHub MCP
- Local companion tools:
  - `browser-use`
  - `playwright`

## Solution Architect

- Stack: `architecture`
- Core skills: `brainstorming`, `context-engineering`, `backend-development`, `docs-seeker`
- Official MCP:
  - GitHub MCP
- Tooling MCP / research helpers:
  - `context7`
  - `deepwiki`

## QA Strategist

- Stack: `qa`
- Core skills: `tdd-workflow`, `webapp-testing`, `systematic-debugging`, `code-review`
- Official MCP:
  - GitHub MCP
- Local companion tools:
  - `playwright`
  - `memory`

## Release / DevEx

- Stack: `release`
- Core skills: `devops`, `deployment-patterns`, `systematic-debugging`, `changelog-generator`
- Official MCP:
  - GitHub MCP
  - Slack MCP
- Tooling MCP / research helpers:
  - `fetch`
  - `context7`

## Notes

- `playwright` 和 `browser-use` 对角色工作流很重要，但这份矩阵里不把它们当作官方 hosted MCP service。
- `context7`、`deepwiki`、`fetch`、`memory` 依然是 Forge 关键的 tool-routing 能力，即使它们不是产品团队常见的 SaaS connector。
- 下一阶段应继续让 Forge Desktop 支持：先选 role-pack，再看到对应 MCP 推荐。
