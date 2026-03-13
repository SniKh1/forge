# Agent Orchestration

## Available Agents

当前 agent 定义位于 `~/.claude/agents/`：

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | 复杂功能、重构、分阶段任务 |
| architect | System design | 架构决策、边界拆分 |
| tdd-guide | Test-driven development | 新功能、bug 修复 |
| code-reviewer | Code review | 写完代码后 |
| security-reviewer | Security analysis | 提交前、敏感改动前 |
| build-error-resolver | Fix build errors | build 失败时 |
| e2e-runner | E2E testing | 关键用户流程 |
| refactor-cleaner | Dead code cleanup | 维护性清理 |
| doc-updater | Documentation | 文档更新 |

## Immediate Agent Usage

以下场景不需要用户再额外提示，应该直接进入对应 agent 视角：
1. 复杂功能请求 -> 用 **planner**
2. 刚刚写完或改完代码 -> 用 **code-reviewer**
3. 新功能或 bug 修复 -> 用 **tdd-guide**
4. 涉及架构决策 -> 用 **architect**

## Parallel Task Execution

只要任务彼此独立，就应该优先并行，而不是无意义串行。

```markdown
# GOOD: Parallel execution
并行拉起 3 个 agent：
1. Agent 1: 分析 auth.ts 的安全问题
2. Agent 2: 审查 cache system 的性能风险
3. Agent 3: 检查 utils.ts 的类型一致性

# BAD: Sequential when unnecessary
能并行的事情却强行一个接一个做
```

## Multi-Perspective Analysis

复杂问题适合拆成多视角 sub-agent：
- factual reviewer
- senior engineer
- security expert
- consistency reviewer
- redundancy checker

这样做的目的不是把流程搞复杂，而是减少单一视角盲点。
