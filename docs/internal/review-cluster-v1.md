# Review Cluster Governance v1

## Scope
这个 cluster 用来治理 Forge 当前与“代码评审、评审反馈处理、提交前复核”有关的 3 个 skill：
- `code-review`
- `requesting-code-review`
- `receiving-code-review`

目标不是删除 support skill，而是明确统一 review 入口和子场景分工。

## Cluster Ownership
- primary:
  - `code-review`
- support:
  - `requesting-code-review`
  - `receiving-code-review`

## Primary Skill: `code-review`
`code-review` 是当前 review cluster 的主入口。

职责：
- 作为统一的 review 语义入口，覆盖“请求 review”“处理 review feedback”“完成前自审”三类场景。
- 在需要 review 时，优先提供统一流程，而不是先让用户在多个 review skill 间做选择。
- 与 `code-reviewer` agent、verification 流程、完成前自审规则协同。

适用场景：
- 代码改完，需要进入 review。
- 准备声称“完成/已修复/可提交”之前。
- 收到 review feedback，需要先判断是否合理。

## Support Skill: `requesting-code-review`
`requesting-code-review` 保留为 support，不再作为默认 review 主路由。

职责：
- 处理“如何发起 review”“如何组织 review 输入”“如何调用 `code-reviewer`”这类子场景。
- 适合作为 request-review 子流程，而不是统一 review 总入口。

适用场景：
- 已确定需要发起系统 review。
- 重点是准备 review context、diff、要求、审查范围。

## Support Skill: `receiving-code-review`
`receiving-code-review` 也保留为 support，不再作为默认 review 主路由。

职责：
- 处理“收到反馈后如何判断、如何回应、如何避免机械接受”这类子场景。
- 适合作为 feedback-handling 子流程，而不是统一 review 总入口。

适用场景：
- 收到 review feedback，尤其是反馈不清晰、可疑或存在技术争议时。
- 需要优先做 technical rigor，而不是 performative agreement。

## Routing Rules
默认路由：
- 遇到“代码审查、完成前复核、提交前确认”类请求，主 skill 使用 `code-review`。
- 只有当任务重点是“发起 review”时，才调用 `requesting-code-review`。
- 只有当任务重点是“处理 review feedback”时，才调用 `receiving-code-review`。

## Collaboration Policy
- `code-review` 继续作为统一 review 入口。
- `requesting-code-review` 与 `receiving-code-review` 视作 `code-review` 的 support skill，不再与主入口竞争默认路由。
- `code-reviewer` agent 仍是 review workflow 的主要执行 agent。

## Next Actions
后续执行重点：
- 在 Desktop / catalog 中补充 primary 与 support 的可见提示。
- 让 review cluster 的推荐策略与完成前验证规则继续对齐。
