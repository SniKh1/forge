# Forge Skill Audit v1

**Updated**: 2026-03-12  
**Scope**: 在真正开始删除/合并之前，对 repo skills 做第一轮治理审计

## Summary

Forge 当前仓库中大约有 **118** 个 skill。

这份审计的目标不是立刻大删，而是先做治理准备：
- 保住现有能力面
- 增加 layer metadata
- 降低默认路由噪音
- 明确 overlap group 内的 primary / secondary ownership
- 在 role-pack 与 stack-pack 稳定前，暂缓 merge / delete

## Layer Distribution

- `core`: 13
- `extended`: 20
- `specialized`: 84
- `experimental`: 1

## Governance Decision

当前策略：
- 先保留全部 skill
- 降低默认高频触发的 skill 数量
- 显式声明 overlap groups
- 只把少量核心 skill 提升到高频路由
- merge / delete 必须等 registry、role-pack、stack-pack 结构稳定后再做

## Core Layer (high-frequency)

这些 skill 应继续作为默认高优先级集合：

- `aesthetic`
- `backend-development`
- `brainstorming`
- `browser-use`
- `code-review`
- `devops`
- `doc-coauthoring`
- `frontend-design`
- `mcp-management`
- `security-review`
- `self-improving-agent`
- `systematic-debugging`
- `tdd-workflow`

## Extended Layer (important but not always-on)

这些 skill 很有价值，但不应该和 core 层一样高频触发：

- `better-auth`
- `browser`
- `changelog-generator`
- `chrome-devtools`
- `context-engineering`
- `context7`
- `continuous-learning`
- `continuous-learning-v2`
- `docs-seeker`
- `internal-comms`
- `mcp-builder`
- `receiving-code-review`
- `requesting-code-review`
- `skill-creator`
- `ui-styling`
- `web-design-guidelines`
- `web-frameworks`
- `webapp-testing`
- `writing-plans`
- `writing-skills`

## Specialized Layer

这一层本来就应该很大，它承载的是低频或强领域化能力。

`specialized` 数量多，本身不是问题。  
真正的问题是它们不应该默认被平铺触发，而应该：
- 在明确需要时显式选中
- 通过 role-pack 或 stack-pack 触发
- 在 desktop / community 视图里按推荐出现
- 尽量退出 generic default routing

## Experimental Layer

- `ui-ux-pro-max`

建议：
- 不进入默认路由
- 只在显式比较、测试或探索时启用

## Overlap Groups and Primary Ownership

### Browser Automation

Skills:
- `browser-use`
- `browser`
- `chrome-devtools`

Primary:
- `browser-use`

Secondary:
- `browser`
- `chrome-devtools`

Decision:
- `browser-use` 作为默认 browser automation 入口
- `browser` / `chrome-devtools` 作为实现细节或 debugging fallback

### Learning

Skills:
- `continuous-learning`
- `continuous-learning-v2`
- `self-improving-agent`

Primary:
- Forge learning system + `self-improving-agent`

Secondary:
- `continuous-learning`
- `continuous-learning-v2`

Decision:
- durable learning 统一并入 Forge memory structures
- `continuous-learning*` 作为 supporting mechanism，不再作为独立 truth system

### UI / Design

Skills:
- `aesthetic`
- `frontend-design`
- `ui-styling`
- `ui-ux-pro-max`
- `web-design-guidelines`

Primary:
- `frontend-design`
- `aesthetic`

Secondary:
- `ui-styling`
- `web-design-guidelines`

Experimental:
- `ui-ux-pro-max`

Decision:
- UI 任务优先通过 `frontend-design + aesthetic` 路由
- 其他 skill 作为实现、审查或比较补充

### Review

Skills:
- `code-review`
- `receiving-code-review`
- `requesting-code-review`

Primary:
- `code-review`

Secondary:
- `receiving-code-review`
- `requesting-code-review`

Decision:
- `code-review` 保持默认 review surface
- 另外两个 skill 保留给明确的 review feedback workflow

### Planning

Skills:
- `brainstorming`
- `writing-plans`

Primary:
- `brainstorming`

Secondary:
- `writing-plans`

Decision:
- `brainstorming` 负责前期建模和方向澄清
- `writing-plans` 负责更结构化的执行计划输出

### Testing

Skills:
- `tdd-workflow`
- `webapp-testing`

Primary:
- `tdd-workflow`

Secondary:
- `webapp-testing`

Decision:
- `tdd-workflow` 负责 feature / bug 的实现节奏
- `webapp-testing` 是 browser / UI 验证层补充

## Suspected Cleanup Targets (do not delete yet)

这些对象进入后续 merge / delete 候选，但当前先不删：

- 明显重复或近似重复：
  - `systematic-debugging`
  - `systematic-debugging-sp`
  - `test-driven-development`
  - `tdd-workflow`
  - `docx`、`pdf`、`pptx`、`xlsx` 这类 document-skills wrapper 的重复包装
- 占位符或低价值项：
  - `template-skill`
  - `project-guidelines-example`
