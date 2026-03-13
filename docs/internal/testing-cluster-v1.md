# Testing Cluster Governance v1

## Scope
这个 cluster 用来治理 Forge 当前与“测试驱动开发、Web 应用测试、语言/框架专用测试工作流”有关的 skill。

核心对象：
- `tdd-workflow`
- `test-driven-development`
- `webapp-testing`
- `python-testing`
- `springboot-tdd`
- `django-tdd`
- `golang-testing`

目标不是把所有 testing skill 合并成一个，而是明确统一主入口与语言/场景 support 分层。

## Cluster Ownership
- primary:
  - `tdd-workflow`
- support:
  - `test-driven-development`
  - `webapp-testing`
  - `python-testing`
  - `springboot-tdd`
  - `django-tdd`
  - `golang-testing`

## Primary Skill: `tdd-workflow`
`tdd-workflow` 是当前 testing cluster 的主入口。

职责：
- 作为统一的 TDD 与测试策略主入口。
- 负责“先测试、再实现、再验证”的默认 testing 语义。
- 与 `developer`、`qa-strategist`、`qa` stack 的默认流程协同。

适用场景：
- 新功能开发。
- bug 修复。
- 需要明确测试驱动流程时。

## Support Skill: `test-driven-development`
`test-driven-development` 保留为 support。

职责：
- 作为更窄的 TDD support skill。
- 适合在需要强调严格 TDD 习惯或沿用既有 skill 语义时补充调用。

## Support Skill: `webapp-testing`
`webapp-testing` 保留为 support。

职责：
- 负责浏览器/UI/E2E 方向的 Web 应用测试。
- 更适合作为 `tdd-workflow` 之后的 Web testing support，而不是 testing 主入口。

## Language-Specific Support Skills
以下 skill 保留为语言/框架专用 support：
- `python-testing`
- `springboot-tdd`
- `django-tdd`
- `golang-testing`

职责：
- 在已经确认语言/框架上下文后，提供更细粒度的测试模式与工具约束。
- 不与 `tdd-workflow` 竞争 testing 主入口。

## Routing Rules
默认路由：
- 遇到“测试驱动开发、测试策略、修 bug 时先补测试”类请求，主 skill 使用 `tdd-workflow`。
- 只有当任务重点是“Web UI / browser / E2E 验证”时，才额外调用 `webapp-testing`。
- 只有当任务明确落在 Python / Spring Boot / Django / Go 时，才追加对应语言/框架 testing skill。
- `test-driven-development` 不再作为默认 testing 主路由，只作为 support。

## Collaboration Policy
- `tdd-workflow` 继续作为 testing 主入口。
- `webapp-testing` 作为 Web 场景 support。
- 各语言 testing skill 作为 stack-aware support。
- `qa-strategist` 与 `developer` 都优先从 `tdd-workflow` 进入，再落到具体 testing support。

## Next Actions
后续执行重点：
- 在 Desktop / catalog 中补充 testing cluster 的 primary / support 可见提示。
- 继续让 `qa`、`frontend`、`java`、`python` stack-pack 共享这组主从规则。
