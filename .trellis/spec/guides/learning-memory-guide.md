# 自我学习与记忆持久化系统

> **Purpose**: 定义 Homunculus 自动学习系统和跨会话记忆的完整规范，确保知识积累和行为进化。

---

## 一、记忆层级架构

| 层级 | 范围 | 持久性 | 用途 | 工具 |
|------|------|--------|------|------|
| L1 工作记忆 | 当前窗口 | 无 | 活跃推理 | 上下文窗口 |
| L2 短期记忆 | 当前会话 | 会话内 | 任务连续性 | TodoWrite |
| L3 长期记忆 | 跨会话 | 持久化 | 用户偏好/决策 | mcp__memory |
| L4 实体记忆 | 按实体 | 持久化 | 一致性保持 | mcp__memory |

---

## 二、Homunculus 自动学习系统

### 2.1 目录结构

```
~/.claude/homunculus/
├── observations.jsonl  # 工具使用观察记录
├── instincts/
│   ├── personal/       # 自动学习的 instincts
│   └── inherited/      # 导入的 instincts
└── evolved/
    ├── agents/
    ├── skills/
    └── commands/
```

### 2.2 自动学习流程

```
会话进行中
    │
    │ PreToolUse/PostToolUse Hooks (100% 触发)
    ▼
observations.jsonl（记录所有工具调用和结果）
    │
    │ SessionEnd Hook 自动触发
    ▼
auto-learn.js
    ├─ 分析工具使用模式
    ├─ 检测重复的工作流序列
    └─ 生成 instincts (置信度 0.3-0.9)
    │
    │ 自动保存
    ▼
instincts/personal/（持久化存储）
```

### 2.3 Instinct 格式

```json
{
  "id": "workflow-read-grep-edit",
  "trigger": "When starting Read task",
  "action": "Follow sequence: Read -> Grep -> Edit",
  "confidence": "0.70",
  "domain": "workflow",
  "source": "auto-observation",
  "evidence": ["Observed 5 times in session"]
}
```

### 2.4 置信度评分

| 分数 | 含义 | 行为 |
|------|------|------|
| 0.3 | 初步观察 | 仅记录，不应用 |
| 0.5 | 中等置信 | 相关时建议 |
| 0.7 | 高置信度 | 自动应用 |
| 0.9 | 近乎确定 | 核心行为 |

---

## 三、学习命令

| 命令 | 用途 | 触发方式 |
|------|------|----------|
| 自动学习 | 提取工具使用模式 | **自动**（SessionEnd） |
| `/learn` | 手动提取更多模式 | 手动 |
| `/evolve` | 将 instinct 演化为 skill | 手动 |
| `/instinct-status` | 查看所有学习内容 | 手动 |
| `/instinct-import` | 从他人导入 instincts | 手动 |
| `/instinct-export` | 导出 instincts 分享 | 手动 |

---

## 四、会话状态持久化

### 4.1 双轨会话记录

| 系统 | 存储位置 | 内容 |
|------|----------|------|
| CLAUDE.md | `~/.claude/sessions/` | 会话时间、任务、上下文 |
| Trellis | `.trellis/workspace/{dev}/journal-N.md` | 开发日志、代码变更 |

### 4.2 自动保存内容

- 会话开始/结束时间
- 完成的任务列表
- 进行中的任务
- 下次会话需要的上下文

---

## 五、Hook 驱动的自动化

### 5.1 已配置的学习相关 Hook

| Hook 类型 | 脚本 | 功能 |
|-----------|------|------|
| PreToolUse | observe.js | 记录工具调用到 observations.jsonl |
| PostToolUse | observe.js | 记录工具执行结果 |
| SessionEnd | auto-learn.js | 分析模式，生成 instincts |
| SessionStart | session-start.py | 加载最近会话上下文 |

---

## 六、与 Trellis 知识积累的集成

### 6.1 双向知识流

```
Homunculus (自动学习)          Trellis (结构化知识)
    │                              │
    │  instincts/personal/         │  spec/ 目录
    │  observations.jsonl          │  workspace/journal
    │                              │
    └──────── 互补 ────────────────┘
```

- **Homunculus**: 自动提取工具使用模式（隐性知识）
- **Trellis spec**: 人工编写的开发规范（显性知识）
- **Trellis journal**: 会话级开发记录（过程知识）

### 6.2 知识迁移规则

| 来源 | 目标 | 条件 |
|------|------|------|
| instinct (0.9) | spec 文档 | 置信度达到 0.9 且被多次验证 |
| spec 文档 | check.jsonl | 被 Trellis 流水线引用 |
| journal 记录 | instinct | 通过 `/learn` 手动提取 |
