# Trellis 运维操作规范

> **Purpose**: 补充 Trellis 框架自身的运维能力，包括 Ralph Loop、Task 生命周期、Git Worktree 并行、Developer 身份管理。

---

## 一、Ralph Loop 质量控制循环

### 1.1 工作原理

Ralph Loop 是 `ralph-loop.py` Hook 实现的自动质量控制机制，拦截 Check Agent 的完成事件。

```
Check Agent 执行完毕，尝试停止
    │
    │ SubagentStop Hook 拦截
    ▼
ralph-loop.py
    │
    ├─ 检查 worktree.yaml 中的 verify 命令
    │   ├─ 有 verify 命令 → 运行所有验证命令
    │   │   ├─ 全部通过 → 允许 Agent 停止
    │   │   └─ 任一失败 → 阻止停止，要求修复
    │   └─ 无 verify 命令 → 检查完成标记
    │
    ├─ 安全限制：最多 5 次迭代
    └─ 状态文件：.trellis/.ralph-state.json
```

### 1.2 配置方式

在 `worktree.yaml` 中配置 verify 命令：

```yaml
verify:
  - pnpm lint
  - pnpm typecheck
  # - pnpm test
```

### 1.3 状态管理

| 文件 | 用途 |
|------|------|
| `.trellis/.ralph-state.json` | 当前迭代次数、任务 ID |
| `MAX_ITERATIONS = 5` | 防止无限循环的安全限制 |
| `STATE_TIMEOUT_MINUTES = 30` | 超时自动重置 |

---

## 二、Task 生命周期管理

### 2.1 task.sh 脚本

`.trellis/scripts/task.sh` 管理 feature 的完整生命周期：

| 命令 | 用途 |
|------|------|
| `task.sh create <name>` | 创建新 feature 目录 |
| `task.sh init-context <name>` | 初始化上下文配置 |
| `task.sh add-context <name> <file>` | 添加上下文文件引用 |
| `task.sh set-branch <name> <branch>` | 设置关联分支 |
| `task.sh start <name>` | 激活为当前任务 |
| `task.sh archive <name>` | 归档已完成任务 |
| `task.sh list` | 列出所有任务 |

### 2.2 任务目录结构

```
.trellis/tasks/<feature-name>/
├── prd.md              # 需求文档
├── task.json           # 任务状态和调度配置
├── research.jsonl      # Research Agent 上下文
├── implement.jsonl     # Implement Agent 上下文
├── check.jsonl         # Check Agent 上下文
└── debug.jsonl         # Debug Agent 上下文
```

### 2.3 task.json 状态机

```json
{
  "name": "user-auth",
  "status": "in_progress",
  "branch": "feature/user-auth",
  "next_action": ["implement", "check"],
  "created_at": "2026-02-06T10:00:00Z"
}
```

`next_action` 数组驱动 Dispatch Agent 的调度顺序。

---

## 三、Git Worktree 多代理并行

### 3.1 工作原理

通过 Git Worktree 为每个并行任务创建物理隔离的工作目录：

```
主仓库（main worktree）
    │
    ├─ ../trellis-worktrees/feature-a/  （Worktree A）
    │   └─ Agent A 在此独立工作
    │
    ├─ ../trellis-worktrees/feature-b/  （Worktree B）
    │   └─ Agent B 在此独立工作
    │
    └─ ../trellis-worktrees/feature-c/  （Worktree C）
        └─ Agent C 在此独立工作
```

### 3.2 worktree.yaml 配置

```yaml
worktree_dir: ../trellis-worktrees

copy:
  - .trellis/.developer
  # - .env
  # - .env.local

post_create:
  # - pnpm install --frozen-lockfile

verify:
  # - pnpm lint
  # - pnpm typecheck
```

### 3.3 相关脚本

| 脚本 | 用途 |
|------|------|
| `multi-agent/plan.sh` | 启动 Plan Agent |
| `multi-agent/start.sh` | 创建 Worktree 并启动 Dispatch Agent |
| `multi-agent/create-pr.sh` | 从 Worktree 提交代码并创建 PR |
| `multi-agent/cleanup.sh` | 清理 Worktree 和注册表 |
| `multi-agent/status.sh` | 查看所有运行中的 Agent 状态 |

---

## 四、Developer 身份系统

### 4.1 初始化

```bash
# 首次使用，初始化身份
./.trellis/scripts/init-developer.sh <your-name>

# 检查当前身份
./.trellis/scripts/get-developer.sh
```

### 4.2 命名建议

| 使用者 | 建议名称 |
|--------|----------|
| 人类开发者 | `john-doe` |
| Cursor AI | `cursor-agent` |
| Claude Code | `claude-agent` |

### 4.3 身份文件

- `.trellis/.developer` — 身份文件（gitignored）
- `.trellis/workspace/<name>/` — 个人工作区目录
- `.trellis/workspace/<name>/index.md` — 工作区索引
- `.trellis/workspace/<name>/journal-N.md` — 会话日志

---

## 五、Session 记录系统

### 5.1 上下文收集

```bash
# 获取完整上下文（身份 + git 状态 + 任务列表）
./.trellis/scripts/get-context.sh
```

### 5.2 会话记录

```bash
# 记录当前会话进度
./.trellis/scripts/add-session.sh
```

### 5.3 通过命令触发

| 命令 | 用途 |
|------|------|
| `/trellis:start` | 开始会话，自动收集上下文 |
| `/trellis:record-session` | 记录会话进度到 journal |
| `/trellis:finish-work` | 完成工作检查清单 |
