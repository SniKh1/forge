# Release Stack Pack

## Scope
用于 CI/CD、packaging、versioning、install flow、diagnostics 和 release notes。

## Defaults
- 尽量保持不同发布面的版本对齐。
- install failure 要按 product failure 来处理。
- workflow、artifact 和构建入口要可复现、可定位。
- release notes 保持简短、面向用户。

## Preferred Skills
- `devops`
- `deployment-patterns`
- `changelog-generator`
- `systematic-debugging`

## Output Shape
- release checklist
- artifact matrix
- install / upgrade note
- diagnostics summary
- rollback note

## Validation Checklist
- 版本是否在 repo / CLI / app 间对齐？
- artifact 是否命名清楚、能下载、能安装？
- 失败时是否能快速定位到 workflow step、bundle stage、platform-specific issue？
- release notes 是否对用户足够清楚？

## Collaboration Contract
- 与 `product-manager` 对齐用户可见变更与 release note。
- 与 `qa-strategist` 对齐 release gate、已知风险和回归结论。
- 与 `developer` / `solution-architect` 配合时，优先收敛构建入口、版本线和诊断信息。
