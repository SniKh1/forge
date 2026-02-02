# Agent 统一编排规范

> **Purpose**: 解决 CLAUDE.md Agent 和 Trellis Pipeline Agent 的命名空间冲突，定义双层 Agent 的统一调度规则。

---

## 一、双层 Agent 架构

### 1.1 分层定义

```
┌─────────────────────────────────────────┐
│  Layer 1: Trellis Pipeline Agents       │
│  (由 Hook 管理上下文，结构化流水线)      │
│  implement, check, debug, research,     │
│  dispatch, plan                         │
├─────────────────────────────────────────┤
│  Layer 2: Interactive Agents            │
│  (由 CLAUDE.md 管理行为，日常交互)       │
│  planner, architect, tdd-guide,         │
│  code-reviewer, security-reviewer,      │
│  build-error-resolver, e2e-runner,      │
│  refactor-cleaner, doc-updater,         │
│  database-reviewer                      │
├─────────────────────────────────────────┤
│  Layer 3: Built-in Agents               │
│  (系统内置，通用能力)                    │
│  Explore, Plan, Bash, general-purpose   │
└─────────────────────────────────────────┘
```

### 1.2 命名空间隔离

| 名称 | 所属层 | Hook 拦截 |
|------|--------|-----------|
| `implement` | Layer 1 | inject-subagent-context.py 拦截 |
| `check` | Layer 1 | inject-subagent-context.py 拦截 |
| `debug` | Layer 1 | inject-subagent-context.py 拦截 |
| `research` | Layer 1 | inject-subagent-context.py 拦截 |
| `dispatch` | Layer 1 | 无拦截（纯调度） |
| `plan` | Layer 1 | 无拦截（自主调研） |
| `planner` | Layer 2 | 无拦截 |
| `architect` | Layer 2 | 无拦截 |
| `tdd-guide` | Layer 2 | 无拦截 |
| `code-reviewer` | Layer 2 | 无拦截 |
| `security-reviewer` | Layer 2 | 无拦截 |
| `build-error-resolver` | Layer 2 | 无拦截 |
| `Explore` | Layer 3 | 无拦截 |

---

## 二、调度规则

### 2.1 模式判断

```
是否在 Trellis 流水线中？
├─ 是（有 .trellis/.current-task）→ 使用 Layer 1 Agent
└─ 否 → 使用 Layer 2 或 Layer 3 Agent
```

### 2.2 任务类型 → Agent 映射

| 任务类型 | 流水线模式 | 交互模式 |
|----------|-----------|----------|
| 功能实现 | `implement` | 直接编码 |
| 代码审查 | `check` | `code-reviewer` |
| Bug 修复 | `debug` | `tdd-guide` |
| 代码调研 | `research` | `Explore` |
| 任务规划 | `plan` | `planner` |
| 架构设计 | - | `architect` |
| 安全分析 | - | `security-reviewer` |
| 构建修复 | - | `build-error-resolver` |
| E2E 测试 | - | `e2e-runner` |

---

## 三、并行执行原则

### 3.1 强制并行

独立操作**必须**并行执行，禁止不必要的串行：

```
正确：一条消息中同时启动多个 Task
Task(subagent_type="security-reviewer", prompt="分析 auth.ts")
Task(subagent_type="code-reviewer", prompt="审查 cache 系统")
Task(subagent_type="tdd-guide", prompt="检查 utils.ts")

错误：逐个串行启动
先 agent 1 → 等完成 → 再 agent 2 → 等完成 → 再 agent 3
```

### 3.2 必须串行的场景

- `plan` → `implement`（规划完才能实现）
- `implement` → `check`（实现完才能审查）
- `check` 发现问题 → `debug`（审查完才能修复）

---

## 四、Hook 上下文注入机制

### 4.1 inject-subagent-context.py 工作原理

```
Task(subagent_type="implement", prompt="...")
    │
    │ PreToolUse Hook 拦截
    ▼
inject-subagent-context.py
    │
    ├─ 读取 .trellis/.current-task → 获取任务目录
    ├─ 读取 {task_dir}/implement.jsonl → 获取上下文文件列表
    ├─ 读取所有上下文文件内容
    ├─ 构建增强 prompt（原始 prompt + 注入上下文）
    └─ 返回 updatedInput 给 Task 工具
```

### 4.2 注意事项

- Layer 1 Agent（implement/check/debug/research）会被 Hook 拦截
- 非流水线模式下调用这些名称，Hook 找不到 `.current-task` 会静默退出
- 日常交互中应避免使用 Layer 1 名称，改用 Layer 2 对应的 Agent

---

## 五、自动触发规则

以下场景无需用户指示，自动调用对应 Agent：

| 场景 | 自动调用 |
|------|----------|
| 复杂功能请求 | `planner` |
| 代码刚写完/修改完 | `code-reviewer` |
| Bug 修复或新功能 | `tdd-guide` |
| 架构决策 | `architect` |
| 构建失败 | `build-error-resolver` |

---

## 六、多视角分析

对于复杂问题，使用多个 Agent 从不同角度分析：

| 角色 | Agent | 关注点 |
|------|-------|--------|
| 事实审查 | `Explore` | 代码现状是什么 |
| 高级工程师 | `architect` | 架构是否合理 |
| 安全专家 | `security-reviewer` | 是否有安全隐患 |
| 一致性审查 | `code-reviewer` | 是否符合规范 |
