# Forge Global Core

**Version**: v5.0  
**Updated**: 2026-03-12

这个文件是 Forge 的全局控制层。

它只负责定义跨角色、跨 stack 都成立的行为规则，不再承载单一技术栈或单一工作者的细节：
- task grading
- collaboration 与 agent orchestration
- memory 与 learning policy
- verification 与 completion rules
- security boundaries
- default tool behavior
- multi-client capability semantics

凡是面向单一角色、单一 stack、单一领域的规则，都应该放到对应的 `roles/*.md` 或 `stacks/*.md` 中。

## 0. Source of Truth

主要真值来源：
- `rules/global-core.md`
- `rules/learning-memory.md`
- `rules/agents.md`
- `rules/security.md`
- `rules/testing.md`
- `rules/hooks.md`
- `roles/*.md`
- `stacks/*.md`
- `core/skill-registry.json`

## 1. Default Role and Stack Selection

当用户没有明确指定时：
- 默认 role-pack: `roles/developer.md`
- 根据任务语义推断 stack-pack:
  - frontend/UI/desktop -> `stacks/frontend.md`
  - Java/Spring -> `stacks/java.md`
  - Python/FastAPI/Django -> `stacks/python.md`

如果任务本身不是 developer 视角，先切换 role-pack，再加载对应 stack-pack：
- PM -> `roles/product-manager.md` + `stacks/product.md`
- UI -> `roles/ui-designer.md` + `stacks/design.md`
- Architecture -> `roles/solution-architect.md` + `stacks/architecture.md`
- QA -> `roles/qa-strategist.md` + `stacks/qa.md`
- Release -> `roles/release-devex.md` + `stacks/release.md`

## 2. Fast Skill Routing

这里只使用仓库里真实存在的 skill，不再引用失效或不存在的名字。

| 场景 | Primary skills |
|---|---|
| 方案规划 / 需求不清 / 需要拆解 | `brainstorming` + `writing-plans` |
| Frontend / UI / 组件 / 页面 | `frontend-design` + `aesthetic` |
| React / Next / desktop UI | `frontend-design` + `web-frameworks` |
| Backend / API / service | `backend-development` |
| Database work | `databases` |
| Auth / login | `better-auth` |
| Deployment / CI / infra | `devops` + `deployment-patterns` |
| Bug / 失败 / 异常行为 | `systematic-debugging` |
| Testing / TDD | `tdd-workflow` + `webapp-testing` |
| Documentation | `doc-coauthoring` |
| MCP development | `mcp-builder` + `mcp-management` |
| Agent / LLM / context work | `context-engineering` |
| Browser automation | `browser-use` 为主，回退 `browser` / `chrome-devtools` |

## 3. Playbooks and Agents

Forge playbook 统一从 `agents/` 目录加载。

默认路由：
- 复杂规划 -> `planner`
- 架构决策 -> `architect`
- 新功能 / bugfix -> `tdd-guide`
- 实现完成后 -> `code-reviewer`
- 提交前或敏感改动 -> `security-reviewer`
- 构建失败 -> `build-error-resolver`
- E2E 流程 -> `e2e-runner`
- 数据库审查 -> `database-reviewer`

## 4. Global Rules

### Task grading
- simple -> 直接执行
- medium -> 先 inspect，再给出简短方案后执行
- complex -> `RESEARCH -> PLAN -> EXECUTE -> REVIEW`

### Verification
- 没有验证证据，不要声称成功
- 完成前移除 debug residue
- 重要改动至少做 self-review，必要时走 agent review

### Security
- 不允许 hardcoded secrets
- 对不可信输入做 validation
- 没有用户明确要求时，不做 destructive git 或 filesystem 操作

### Tool defaults
- official docs 优先：`context7`
- 开源实现和 repo 语境：`deepwiki`
- web search：`exa`
- cross-session memory：`memory`
- browser automation：默认优先 `browser-use`，并复用真实浏览器 / profile；只有任务明确要求隔离时，才切换到 isolation 模式

## 5. Memory and Learning

Forge 只维护一套统一学习系统，但会写入不同目标：
- project memory
- problem-solution memory
- instincts
- learned skills / evolved outputs

`self-improving-agent` 的职责是增强这套系统，而不是另外维护一套平行真值。

当任务产出可复用经验时，至少要尝试记录：
- problem
- root cause
- chosen fix
- verification
- reuse tags
- upgrade target

## 6. Hooks Policy

hooks 只负责自动检查点，不负责承载宽泛业务逻辑。

它们应该专注于：
- session start / end context
- observation capture
- learning triggers
- verification reminders
- debug residue 与 safety checks

具体规则见 `rules/hooks.md` 与 `hooks/hooks.json.template`。
