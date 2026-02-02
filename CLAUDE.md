# Claude Code 开发规范

**版本**：v3.0（Trellis 集成精简版）
**更新日期**：2026-02-06

> 详细规范已拆分至 `rules/` 和 `.trellis/spec/guides/`，本文件仅保留路由表和核心原则。

---

## 第零章：快速入口（最高优先级）

> **收到任何消息后，必须先执行本章检查，再进行任何操作。**

### 0.1 Skill 匹配表

| 关键词 | 立即调用 |
|--------|----------|
| 前端/UI/组件/页面 | `frontend-design` + `aesthetic` |
| React/Vue/Next.js | `frontend-design` + `web-frameworks` |
| Electron/Tauri/桌面 | `frontend-design` + 参考 `stacks/frontend.md` |
| 后端/API/服务 | `backend-development` |
| Java/Spring | `backend-development` + 参考 `stacks/java.md` |
| Python/FastAPI | `backend-development` + 参考 `stacks/python.md` |
| 数据库/SQL | `databases` |
| 登录/认证 | `better-auth` |
| 部署/Docker | `devops` |
| 调试/报错 | `debugging/systematic-debugging` |
| 计划/方案 | `superpowers:brainstorm` |
| 文档编写 | `doc-coauthoring` |

### 0.2 Agent 匹配表

| 任务类型 | 调用 Agent |
|----------|------------|
| 复杂功能规划 | `planner` |
| 架构设计 | `architect` |
| 新功能/修 bug | `tdd-guide` |
| 代码写完后 | `code-reviewer` |
| 提交前 | `security-reviewer` |
| 构建失败 | `build-error-resolver` |
| E2E 测试 | `e2e-runner` |
| 数据库审查 | `database-reviewer` |

### 0.3 Command 快捷入口

`/plan` `/tdd` `/code-review` `/build-fix` `/e2e` `/learn` `/evolve` `/instinct-status`

### 0.4 技术栈规范（按需加载）

| 文件 | 内容 |
|------|------|
| `~/.claude/stacks/frontend.md` | 前端/桌面端/UI 设计规范 |
| `~/.claude/stacks/java.md` | Java 后端规范 |
| `~/.claude/stacks/python.md` | Python 开发规范 |

---

## 一、核心原则

> 详细规范见 `rules/coding-style.md`、`rules/security.md`、`rules/git-workflow.md`
> 以及 `.trellis/spec/guides/security-quality-guide.md`、`development-workflow-guide.md`

### 1.1 调研优先（强制）

修改代码前必须：检索相关代码 → 识别复用机会 → 追踪调用链

**修改前三问**：1. 真问题还是臆想？ 2. 有现成代码可复用？ 3. 会破坏什么调用关系？

### 1.2 红线原则

- 禁止 copy-paste 重复代码、禁止破坏现有功能、禁止对错误方案妥协
- 禁止盲目执行不加思考、关键路径必须有错误处理

### 1.3 知识获取（强制）

遇到不熟悉的知识，必须联网搜索，严禁猜测。工具选择见 `.trellis/spec/guides/mcp-tools-guide.md`

### 1.4 交互规范

- **询问用户**：多方案、需求不明、范围超预期、发现风险
- **直接执行**：需求明确且方案唯一、< 20 行改动
- **敢于说不**：发现问题直接指出

### 1.5 代码风格

KISS / DRY / 不可变 / 保护调用链。详见 `rules/coding-style.md`

### 1.6 安全与 Git

- 安全：禁止硬编码密钥，系统边界验证输入，SQL/XSS 防护。详见 `rules/security.md`
- Git：不主动提交/push，格式 `<type>(<scope>): <desc>`，禁止 force push main。详见 `rules/git-workflow.md`

---

## 二、任务分级

| 级别 | 判断标准 | 处理方式 |
|------|----------|----------|
| 简单 | 单文件、明确需求、< 20 行改动 | 直接执行 |
| 中等 | 2-5 个文件、需要调研 | 简要说明方案 → 执行 |
| 复杂 | 架构变更、多模块、不确定性高 | RESEARCH → PLAN → EXECUTE → REVIEW |

复杂问题使用 `mcp__sequential-thinking__sequentialthinking` 深度推理。

---

## 三、工具选择速查

> 完整决策树见 `.trellis/spec/guides/mcp-tools-guide.md` 和 `claude-code-capabilities.md`

| 场景 | 推荐工具 |
|------|----------|
| 代码语义检索 | `ace-tool` 或 `Task(Explore)` |
| 精确字符串查找 | `Grep` |
| 文件名匹配 | `Glob` |
| 库官方文档 | `context7`（先 resolve 再 query） |
| 开源项目 | `deepwiki` |
| 联网搜索 | `WebSearch` |
| 跨会话记忆 | `mcp__memory__*` |
| 复杂多步骤 | `Task` + 合适的 `subagent_type` |

---

## 四、Skill 系统（强制）

> 完整规范见 `.trellis/spec/guides/skill-usage-guide.md`

**铁律**：如果有 1% 的可能性某个 Skill 适用于当前任务，必须立即调用。

**调用流程**：收到消息 → 检查 0.1 匹配表 → 调用 Skill → 按 Skill 执行

**违规行为**：直接写代码未调用 Skill / 遇错未调用 debugging Skill / 完成未调用 code-review

---

## 五、Agent 与 Command 系统

> 完整规范见 `.trellis/spec/guides/agent-orchestration-guide.md` 和 `claude-code-capabilities.md`
> Agent 定义文件见 `~/.claude/agents/`，调用规则见 `rules/agents.md`

**调用方式**：`Task(subagent_type="planner", prompt="...")`

**并行原则**：独立操作必须并行执行，禁止不必要的串行。

**双层架构**：
- Layer 1（Trellis 流水线）：implement, check, debug, research, dispatch, plan — 由 Hook 管理
- Layer 2（日常交互）：planner, architect, tdd-guide, code-reviewer 等 — 由本文件管理
- Layer 3（内置）：Explore, Plan, Bash, general-purpose

---

## 六、持续学习与记忆

> 完整规范见 `.trellis/spec/guides/learning-memory-guide.md`

**自动学习**：PreToolUse/PostToolUse 记录 → SessionEnd 分析 → 生成 instincts（置信度 0.3-0.9）

**记忆层级**：L1 工作记忆（窗口内）→ L2 短期（会话内）→ L3 长期（mcp__memory）→ L4 实体记忆

**学习命令**：`/learn` `/evolve` `/instinct-status` `/instinct-import` `/instinct-export`

---

## 七、上下文模式与 Vibe Coding

> 详见 `.trellis/spec/guides/development-workflow-guide.md`

**上下文模式**：
- `dev` 模式：先写代码后解释，偏好可用方案
- `review` 模式：彻底阅读，按严重性排序
- `research` 模式：广泛阅读，先理解后行动

**切换方式**：用户说"进入开发模式"/"进入审查模式"/"进入研究模式"

**Vibe Coding**：说需求 → 出代码 → 看效果 → 调整

---

## 八、环境设置

- Windows/PowerShell：不支持 `&&`，使用 `;` 分隔命令，中文路径用引号包裹
- 输出：中文响应、禁用表情符号、禁止截断输出

---

## 九、详细规范索引

| 主题 | 文件位置 |
|------|----------|
| Skill 使用规范 | `.trellis/spec/guides/skill-usage-guide.md` |
| Agent 编排规范 | `.trellis/spec/guides/agent-orchestration-guide.md` |
| MCP 工具规范 | `.trellis/spec/guides/mcp-tools-guide.md` |
| 完整能力索引 | `.trellis/spec/guides/claude-code-capabilities.md` |
| 安全与质量 | `.trellis/spec/guides/security-quality-guide.md` |
| 开发工作流 | `.trellis/spec/guides/development-workflow-guide.md` |
| 学习与记忆 | `.trellis/spec/guides/learning-memory-guide.md` |
| Trellis 运维 | `.trellis/spec/guides/trellis-operations-guide.md` |
| 跨层思维 | `.trellis/spec/guides/cross-layer-thinking-guide.md` |
| 代码复用思维 | `.trellis/spec/guides/code-reuse-thinking-guide.md` |
| 安全规则 | `rules/security.md` |
| 代码风格 | `rules/coding-style.md` |
| 测试要求 | `rules/testing.md` |
| Git 工作流 | `rules/git-workflow.md` |
| Agent 规则 | `rules/agents.md` |
| 性能优化 | `rules/performance.md` |
| Hooks 系统 | `rules/hooks.md` |
| 常用模式 | `rules/patterns.md` |
| everything-claude-code 指南 | `GUIDE.md` |

---

## 更新记录

- **v3.0** (2026-02-06) - Trellis 集成精简版
  - 从 668 行精简至 ~180 行（减少 ~73%）
  - 详细规范拆分至 spec/guides/ 和 rules/
  - 新增第九章详细规范索引
  - 集成 Trellis 运维能力（Ralph Loop、Task 生命周期、Worktree、Developer 身份）
  - 保留所有 everything-claude-code 能力（通过引用）

- **v2.5** (2026-02-03) - 自动学习增强版
- **v2.4** (2026-02-03) - 记忆持久化增强版
- **v2.3** (2026-02-03) - Vibe Coding 增强版
- **v2.2** (2026-02-03) - 核心原则强化版
- **v2.1** (2026-02-02) - 能力补全版
- **v2.0** (2026-02-02) - 行为规范版
- **v1.2** (2026-01-22) - Skill 强制版