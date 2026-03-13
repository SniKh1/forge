# Domain Pack / Skill Map v1

**Updated**: 2026-03-13  
**Source of truth**: `core/skill-registry.json` + `core/role-mcp-matrix.json`

这份文档回答两个问题：
- 第二阶段领域 pack 现在推荐哪些 skill
- 哪些 role-pack 更适合挂载这些领域 pack

## `ecommerce`

更适合挂载的 role-pack：
- `product-manager`
- `developer`
- `ui-designer`
- `qa-strategist`
- `release-devex`

Primary:
- `brainstorming`
- `frontend-design`
- `backend-development`
- `browser-use`
- `code-review`

Support:
- `better-auth`
- `webapp-testing`
- `mcp-management`
- `internal-comms`
- `security-review`

Specialized:
- `shopify`

## `video-creation`

更适合挂载的 role-pack：
- `product-manager`
- `ui-designer`
- `developer`

Primary:
- `brainstorming`
- `media-processing`
- `ai-multimodal`

Support:
- `doc-coauthoring`
- `internal-comms`
- `aesthetic`

## `image-generation`

更适合挂载的 role-pack：
- `ui-designer`
- `product-manager`
- `developer`

Primary:
- `aesthetic`
- `canvas-design`
- `ai-multimodal`

Support:
- `media-processing`
- `brainstorming`
- `doc-coauthoring`

## `workflow-automation`

更适合挂载的 role-pack：
- `solution-architect`
- `developer`
- `release-devex`
- `qa-strategist`

Primary:
- `brainstorming`
- `context-engineering`
- `mcp-management`
- `mcp-builder`
- `backend-development`

Support:
- `browser-use`
- `devops`
- `code-review`
- `systematic-debugging`
- `writing-plans`

## Routing Notes

- 第二阶段领域 pack 当前只作为推荐层，不应覆盖 `global-core`。
- role-pack 仍然先于 domain pack 生效。
- domain pack 的价值在于给 task 提供更贴近业务场景的默认 skill 组合。
- 真正的 Desktop 安装引导后续再按这些映射做 UI 入口。
