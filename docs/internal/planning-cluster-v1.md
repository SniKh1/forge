# Planning Cluster Governance v1

## Scope
这个 cluster 用来治理 Forge 当前与“前置问题建模、方案拆解、实现计划编写”有关的 2 个 skill：
- `brainstorming`
- `writing-plans`

目标不是弱化 planning，而是明确谁负责前置思考，谁负责把已明确的问题写成可执行计划。

## Cluster Ownership
- primary:
  - `brainstorming`
- support:
  - `writing-plans`

## Primary Skill: `brainstorming`
`brainstorming` 是当前 planning cluster 的主入口。

职责：
- 负责前置问题建模、需求澄清、范围控制、关键约束识别。
- 在进入实现之前，先把“到底要解决什么问题、为什么这样做、边界在哪里”想清楚。
- 作为后续 `writing-plans`、agent 规划和 role/stack 选择的上游语义入口。

适用场景：
- 开始新功能。
- 开始复杂修改。
- 需要先理解用户真实目标与成功标准。

## Support Skill: `writing-plans`
`writing-plans` 保留为 support，不再作为默认 planning 主路由。

职责：
- 把已经澄清过的问题写成多步骤、可执行、可验证的实现计划。
- 更适合在 `brainstorming` 之后，用来承接落地步骤，而不是替代前置思考。

适用场景：
- 问题已经明确，需要形成正式 plan。
- 任务涉及多步骤执行、worktree、review checkpoints。

## Routing Rules
默认路由：
- 遇到“规划、方案、需求拆解、前置思考”类请求，主 skill 使用 `brainstorming`。
- 只有当问题已经被明确，需要输出多步骤实现计划时，才调用 `writing-plans`。

## Collaboration Policy
- `brainstorming` 继续作为 planning 主入口。
- `writing-plans` 视作 `brainstorming` 的 support skill，不再与主入口竞争默认路由。
- 多步骤复杂任务中，可在 `brainstorming` 之后再进入 `planner` agent 或 `writing-plans`。

## Next Actions
后续执行重点：
- 让 Desktop / catalog 能显示 planning cluster 的 primary / support 语义。
- 继续把 role-pack 与 stack-pack 的 plan 入口统一到 `brainstorming`。
