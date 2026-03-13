# UI Cluster Governance v1

## Scope
这个 cluster 用来治理 Forge 当前与“界面设计、视觉表达、样式实现、设计审查”有关的 5 个 skill：
- `frontend-design`
- `aesthetic`
- `ui-styling`
- `web-design-guidelines`
- `ui-ux-pro-max`

目标不是删除 support 或 experimental 能力，而是明确谁负责 UI 主路径、谁负责实现补充、谁负责审查与探索。

## Cluster Ownership
- primary:
  - `frontend-design`
  - `aesthetic`
- support:
  - `ui-styling`
  - `web-design-guidelines`
- experimental:
  - `ui-ux-pro-max`

## Primary Skill: `frontend-design`
`frontend-design` 是当前 UI cluster 的主入口之一。

职责：
- 负责把页面、组件、应用界面真正做出来。
- 强调 distinct、production-grade、可运行、避免 generic AI aesthetics。
- 作为 UI 实现路径的主要执行 skill。

适用场景：
- 需要真正产出页面、组件、landing page、dashboard、desktop UI。
- 任务重点在“做出能运行的界面”。

## Primary Skill: `aesthetic`
`aesthetic` 是当前 UI cluster 的另一个主入口。

职责：
- 负责视觉层级、审美判断、灵感分析、设计质量提升。
- 适合作为 `frontend-design` 的并行主组合，用来避免界面只“能跑”但不够好看。

适用场景：
- 需要提升视觉表达。
- 需要做 inspiration analysis、aesthetic review、design quality refinement。

## Support Skill: `ui-styling`
`ui-styling` 保留为 support。

职责：
- 负责样式实现、组件库风格落地、Tailwind/shadcn/ui 这类实现层补充。
- 更适合作为 UI 实现细节 support，而不是默认 UI 主入口。

适用场景：
- 已经确定设计方向，重点是快速落地样式系统或组件样式。

## Support Skill: `web-design-guidelines`
`web-design-guidelines` 保留为 support。

职责：
- 负责设计规范检查、可访问性与体验审查。
- 更适合作为 review / audit support，而不是默认 UI 生成主入口。

适用场景：
- 需要检查现有 UI 是否符合设计和可用性规范。
- 需要做 UI audit，而不是直接设计新界面。

## Experimental Skill: `ui-ux-pro-max`
`ui-ux-pro-max` 保留为 experimental。

职责：
- 提供更大而全的 UI/UX 风格枚举和探索性工作流。
- 目前适合作为探索型补充，不进入默认主路径。

适用场景：
- 明确需要做大量风格探索或参考枚举。
- 需要实验性视觉方向，而不是稳定的默认流程。

## Routing Rules
默认路由：
- 遇到“做界面、做组件、做页面、做 desktop/web UI”类任务，主组合使用 `frontend-design + aesthetic`。
- 只有当重点是“样式系统实现”时，才额外调用 `ui-styling`。
- 只有当重点是“规范审查 / UX audit”时，才额外调用 `web-design-guidelines`。
- 只有当任务明确需要大量风格探索时，才进入 `ui-ux-pro-max`。

## Collaboration Policy
- `frontend-design + aesthetic` 继续作为 UI 主组合。
- `ui-styling` 与 `web-design-guidelines` 视作 support skill，不再与主组合竞争默认路由。
- `ui-ux-pro-max` 保留实验性，不进入默认主组合。

## Next Actions
后续执行重点：
- 在 Desktop / catalog 中补充 UI cluster 的 primary / support / experimental 可见提示。
- 继续让 `ui-designer` role-pack 与 `design` / `frontend` / `image-generation` / `video-creation` stack-pack 共享这组主从规则。
