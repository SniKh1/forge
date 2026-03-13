# Forge Role / Stack Skill Map v1

**Updated**: 2026-03-12  
**Source of truth**: `core/skill-registry.json`

这份文档是 registry metadata 的人工可读版本，回答三个问题：
- 每个 role-pack 应该优先用哪些 skill
- 每个 stack-pack 应该优先用哪些 skill
- 路由时哪些是 primary，哪些是 support

## Role-Pack Recommendations

### `developer`

Primary:
- `brainstorming`
- `systematic-debugging`
- `code-review`
- `browser-use`
- `self-improving-agent`

Contextual:
- `frontend-design`
- `backend-development`
- `tdd-workflow`
- `security-review`
- `web-frameworks`
- `better-auth`

Output expectations:
- code changes
- tests
- implementation notes
- validation evidence

### `product-manager`

Primary:
- `brainstorming`
- `doc-coauthoring`
- `internal-comms`
- `mcp-management`

Support:
- `writing-plans`
- `docs-seeker`

### `ui-designer`

Primary:
- `frontend-design`
- `aesthetic`
- `browser-use`

Support:
- `ui-styling`
- `web-design-guidelines`
- `mcp-management`

Experimental:
- `ui-ux-pro-max`

### `solution-architect`

Primary:
- `brainstorming`
- `context-engineering`
- `backend-development`

Support:
- `docs-seeker`
- `context7`
- `writing-plans`

Output expectations:
- architecture notes
- boundary map
- interface definitions
- tradeoff and migration records

### `qa-strategist`

Primary:
- `tdd-workflow`
- `webapp-testing`
- `systematic-debugging`
- `code-review`

### `release-devex`

Primary:
- `devops`
- `systematic-debugging`

Support:
- `changelog-generator`
- `context7`
- `security-review`

## Stack-Pack Recommendations

### `frontend`

Primary:
- `frontend-design`
- `aesthetic`
- `browser-use`

Support:
- `ui-styling`
- `web-frameworks`
- `tdd-workflow`
- `code-review`
- `security-review`
- `web-design-guidelines`

Fallback browser/debug:
- `browser`
- `chrome-devtools`

Output expectations:
- component / page implementation
- state coverage
- visual validation notes
- runtime verification evidence

### `java`

Primary:
- `backend-development`

Support:
- `java-coding-standards`
- `jpa-patterns`
- `springboot-patterns`
- `springboot-security`
- `springboot-tdd`
- `springboot-verification`
- `tdd-workflow`
- `code-review`
- `security-review`
- `context7`

### `python`

Primary:
- `backend-development`

Support:
- `python-patterns`
- `python-testing`
- `tdd-workflow`
- `code-review`
- `security-review`
- `context7`

Optional framework-specific:
- `django-patterns`
- `django-security`
- `django-tdd`
- `django-verification`

### `product`

Primary:
- `brainstorming`
- `doc-coauthoring`
- `internal-comms`

Support:
- `writing-plans`
- `mcp-management`
- `docs-seeker`

Output expectations:
- concise product brief
- scope / non-scope split
- acceptance criteria
- dependency and rollout notes

### `design`

Primary:
- `frontend-design`
- `aesthetic`
- `browser-use`

Support:
- `ui-styling`
- `web-design-guidelines`

Output expectations:
- hierarchy and interaction notes
- state coverage（empty / loading / error / success）
- implementation handoff details

### `architecture`

Primary:
- `context-engineering`
- `backend-development`

Support:
- `brainstorming`
- `writing-plans`
- `docs-seeker`
- `context7`
- `mcp-builder`
- `writing-skills`
- `skill-creator`

Output expectations:
- boundary map
- interface contract
- data flow summary
- migration / compatibility notes

### `qa`

Primary:
- `tdd-workflow`
- `systematic-debugging`

Support:
- `webapp-testing`
- `code-review`
- `python-testing`
- `springboot-tdd`

Output expectations:
- risk-based test matrix
- regression checklist
- verification evidence

### `release`

Primary:
- `devops`
- `systematic-debugging`

Support:
- `deployment-patterns`
- `changelog-generator`
- `context7`
- `doc-coauthoring`
- `internal-comms`
- `mcp-management`

Output expectations:
- release checklist
- artifact matrix
- diagnostics summary
- rollback and support notes

## Routing Notes

- role-pack 选择应先于 stack-pack。
- stack-pack 的作用是细化实现约束，而不是替代 role-pack。
- 核心路由优先顺序应是：primary -> support -> specialized。
- overlap group 的 ownership 一律以 `docs/internal/skill-audit-v1.md` 为准。
