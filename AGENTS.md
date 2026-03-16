# Forge Agent System

Forge agents 用来协调实现阶段的工作流；它们不是角色本身，也不是 stack 约束本身。

## Agent Layer vs Role Layer

可以把当前体系拆成四层来理解：
- Agents：任务阶段性的执行工作流
- Role-packs：某类工作者默认该怎么思考、怎么交付
- Stack-packs：某个技术栈或领域内必须遵守的约束
- Skills：局部任务能力与细粒度操作指南

全局控制仍然由 `CLAUDE.md` 和 `rules/global-core.md` 负责。  
角色与 stack 的行为定义，统一放在 `roles/*.md` 与 `stacks/*.md`。

## Global Reasoning Baseline

所有 agent 都继承同一条全局认知基线：
- 先追求真实、客观、可证伪的结论，再考虑表达是否顺滑。
- 默认使用当前上下文下可用的最高推理强度，不把节省算力、token 或篇幅当成首要目标。
- 分析时主动寻找关键盲点，保持 MECE，并建立跨域关联，不做孤立式思考。
- 优先使用第一性原理、因果链、演化路径或系统模型解释问题本质。
- 外部信息优先检索英文高质量资料，最终统一用简体中文输出。
- 输出不仅给结论，还要给理解验证与高区分度自验证问题。

## Available Agents

| Agent | Purpose | Auto-trigger |
|-------|---------|-------------|
| `planner` | 实现方案规划 | 复杂功能请求 |
| `architect` | 系统设计 | 架构决策 |
| `tdd-guide` | Test-driven development | 新功能、bug 修复 |
| `code-reviewer` | 代码审查 | 写完代码后 |
| `security-reviewer` | 安全分析 | 提交前 |
| `build-error-resolver` | 处理构建失败 | build 失败时 |
| `e2e-runner` | E2E 测试 | 关键用户流程 |
| `refactor-cleaner` | 清理坏味道和冗余代码 | 维护性整理 |
| `doc-updater` | 文档更新 | 代码改动后 |
| `database-reviewer` | 数据库审查 | 数据库改动 |

## First-Wave Role Packs

当前第一阶段已经落地的 role-pack：
- `roles/developer.md`
- `roles/product-manager.md`
- `roles/ui-designer.md`
- `roles/solution-architect.md`
- `roles/qa-strategist.md`
- `roles/release-devex.md`

## Stack Packs

现有开发 stack：
- `stacks/frontend.md`
- `stacks/java.md`
- `stacks/python.md`

治理型 stack-pack：
- `stacks/product.md`
- `stacks/design.md`
- `stacks/architecture.md`
- `stacks/qa.md`
- `stacks/release.md`

## Usage

Agents 通过 `Task(subagent_type="agent-name", prompt="...")` 调用。

当任务明显带有角色属性或 stack 属性时，优先先确定：
1. 当前 role-pack 是什么
2. 当前 stack-pack 是什么
3. 再决定应该调用哪个 agent

也就是说，agent 是“怎么执行”，role/stack 是“按什么标准执行”。

更细的编排规则见 `rules/agents.md`。
