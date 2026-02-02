# Claude Code 完整能力总览

**版本**：v1.0
**更新日期**：2026-02-06

> 本文档是所有能力的统一索引，涵盖 everything-claude-code 集成 + Trellis 流水线集成的完整能力体系。

---

## 一、能力来源与架构

### 1.1 两大能力来源

| 来源 | 说明 | 集成时间 |
|------|------|----------|
| **everything-claude-code** | 社区最佳实践集合：50+ Skills、10 Agents、20 Commands、8 Rules、3 Contexts | 2026-02-02 |
| **Trellis Multi-Agent Pipeline** | 结构化多代理流水线：Pipeline Agents、Hook 驱动、Git Worktree 并行 | 2026-02-06 |

### 1.2 整体架构

```
~/.claude/                          ← 全局配置根目录
├── CLAUDE.md                       ← 核心路由表 + 精简原则（v3.0, ~226行）
├── GUIDE.md                        ← everything-claude-code 集成记录
├── CAPABILITIES.md                 ← 本文件：完整能力总览
├── USAGE-GUIDE.md                  ← 使用指南
├── AGENTS.md                       ← Trellis 入口指引
│
├── agents/                         ← Agent 定义文件（10个交互式 Agent）
│   ├── check.md                    ← Trellis Pipeline: 代码审查+自修复
│   ├── debug.md                    ← Trellis Pipeline: 问题修复
│   ├── dispatch.md                 ← Trellis Pipeline: 流水线调度
│   ├── implement.md                ← Trellis Pipeline: 纯代码实现
│   ├── plan.md                     ← Trellis Pipeline: 任务规划
│   └── research.md                 ← Trellis Pipeline: 纯调研（只读）
│
├── commands/                       ← 斜杠命令定义
│   └── trellis/                    ← Trellis 专属命令（14个）
│       ├── start.md                ← 开始会话
│       ├── parallel.md             ← 多代理流水线编排
│       ├── finish-work.md          ← 完成工作检查清单
│       ├── break-loop.md           ← 深度 Bug 分析
│       ├── record-session.md       ← 记录会话进度
│       ├── before-backend-dev.md   ← 后端开发前读规范
│       ├── before-frontend-dev.md  ← 前端开发前读规范
│       ├── check-backend.md        ← 后端代码检查
│       ├── check-frontend.md       ← 前端代码检查
│       ├── check-cross-layer.md    ← 跨层检查
│       ├── create-command.md       ← 创建新命令
│       ├── integrate-skill.md      ← 集成 Skill
│       ├── onboard.md              ← 新成员引导
│       └── update-spec.md          ← 更新规范
│
├── hooks/                          ← Hook 脚本
│   ├── inject-subagent-context.py  ← Pipeline Agent 上下文注入
│   ├── ralph-loop.py               ← Check Agent 质量控制循环
│   └── session-start.py            ← 会话启动上下文加载
│
├── rules/                          ← 始终加载的规则（8个）
│   ├── agents.md                   ← Agent 编排规则
│   ├── coding-style.md             ← 代码风格（不可变性、文件组织）
│   ├── git-workflow.md             ← Git 提交/PR 规范
│   ├── hooks.md                    ← Hook 系统说明
│   ├── patterns.md                 ← 常用代码模式
│   ├── performance.md              ← 性能优化/模型选择
│   ├── security.md                 ← 安全检查清单
│   └── testing.md                  ← TDD/测试覆盖率要求
│
├── stacks/                         ← 技术栈规范（按需加载）
│   ├── frontend.md                 ← 前端/桌面端规范
│   ├── java.md                     ← Java 后端规范
│   └── python.md                   ← Python 开发规范
│
├── skills/                         ← Skill 定义文件（50+）
│   └── (由 everything-claude-code 提供)
│
├── contexts/                       ← 上下文模式（3个）
│   ├── dev.md                      ← 开发模式
│   ├── review.md                   ← 审查模式
│   └── research.md                 ← 研究模式
│
├── homunculus/                     ← 自动学习系统
│   ├── observations.jsonl          ← 工具使用观察记录
│   ├── instincts/personal/         ← 自动学习的 instincts
│   └── instincts/inherited/        ← 导入的 instincts
│
├── sessions/                       ← 会话状态持久化
│
└── .trellis/                       ← Trellis 流水线配置
    ├── workflow.md                 ← 工作流总览
    ├── worktree.yaml               ← Worktree/验证配置
    ├── spec/                       ← 开发规范体系
    │   ├── guides/                 ← 思维指南 + 能力规范（10个文件）
    │   ├── backend/                ← 后端开发规范
    │   └── frontend/               ← 前端开发规范
    ├── scripts/                    ← 自动化脚本
    ├── workspace/                  ← 开发者工作区
    └── tasks/                      ← 任务目录（按 feature 组织）
```

---

## 二、Agent 体系（三层架构）

### 2.1 Layer 1: Trellis Pipeline Agents（由 Hook 管理）

通过 `/trellis:parallel` 启动，Hook 自动注入上下文。

| Agent | 用途 | 上下文来源 |
|-------|------|-----------|
| `implement` | 纯代码实现，不做 git 操作 | implement.jsonl + prd.md |
| `check` | 代码审查 + 自修复 | check.jsonl + prd.md |
| `debug` | 问题修复 | debug.jsonl + review 结果 |
| `research` | 纯调研，只读不改 | research.jsonl |
| `dispatch` | 流水线调度（纯调度） | 无 |
| `plan` | 任务规划（自主调研） | 无 |

**定义文件**：`~/.claude/agents/{name}.md`
**上下文注入**：`hooks/inject-subagent-context.py`（PreToolUse 拦截）
**质量控制**：`hooks/ralph-loop.py`（拦截 check agent，最多 5 次迭代）

### 2.2 Layer 2: Interactive Agents（由 CLAUDE.md 管理）

日常交互中使用，通过 `Task(subagent_type="...", prompt="...")` 调用。

| Agent | 用途 | 自动触发场景 |
|-------|------|-------------|
| `planner` | 实施规划 | 复杂功能请求 |
| `architect` | 架构设计 | 架构决策 |
| `tdd-guide` | 测试驱动开发 | 新功能/修 bug |
| `code-reviewer` | 代码审查 | 代码写完后 |
| `security-reviewer` | 安全分析 | 提交前 |
| `build-error-resolver` | 构建修复 | 构建失败 |
| `e2e-runner` | E2E 测试 | 关键用户流程 |
| `refactor-cleaner` | 死代码清理 | 代码维护 |
| `doc-updater` | 文档更新 | 代码变更后 |
| `database-reviewer` | 数据库审查 | 数据库变更 |

### 2.3 Layer 3: Built-in Agents（系统内置）

| Agent | 用途 |
|-------|------|
| `Explore` | 代码库探索（只读） |
| `Plan` | 方案设计（只读） |
| `Bash` | 命令执行 |
| `general-purpose` | 通用多步骤任务 |

---

## 三、Skill 体系（50+）

> 完整清单见 `.trellis/spec/guides/claude-code-capabilities.md`

### 3.1 开发流程类

| Skill | 用途 |
|-------|------|
| superpowers:brainstorm | 交互式需求细化 |
| superpowers:write-plan | 创建实施计划 |
| superpowers:execute-plan | 批量执行计划 |
| debugging/systematic-debugging | 系统化调试 |
| code-review | 代码审查与验证 |
| problem-solving/when-stuck | 调试卡住时的突破策略 |

### 3.2 开发实现类

| Skill | 用途 |
|-------|------|
| frontend-design | 前端界面开发 |
| frontend-development | React/TypeScript 现代模式 |
| backend-development | 后端 API 开发 |
| databases | 数据库操作（MongoDB/PostgreSQL） |
| better-auth | 认证授权实现 |
| devops | 部署运维（Cloudflare/Docker/GCP） |
| web-frameworks | Next.js/Turborepo 全栈开发 |

### 3.3 文档与设计类

| Skill | 用途 |
|-------|------|
| doc-coauthoring | 文档协作编写 |
| docs-seeker | 搜索技术文档 |
| changelog-generator | 从 git 生成变更日志 |
| aesthetic | UI/UX 美学设计 |
| canvas-design | 视觉设计（PNG/PDF） |
| ai-multimodal | 多媒体处理（Gemini API） |
| ui-styling | shadcn/ui + Tailwind 样式 |

### 3.4 高级能力类

| Skill | 用途 |
|-------|------|
| continuous-learning | 自动提取会话模式 |
| continuous-learning-v2 | Instinct 学习系统 |
| iterative-retrieval | 渐进式上下文检索 |
| strategic-compact | 手动压缩建议 |
| eval-harness | 验证循环评估 |
| verification-loop | 持续验证 |
| context-engineering | AI Agent 上下文工程 |
| sequential-thinking | 逐步推理（复杂问题） |

### 3.5 工具集成类

| Skill | 用途 |
|-------|------|
| browser | Chrome DevTools Protocol 浏览器自动化 |
| chrome-devtools | Puppeteer 截图/调试/性能分析 |
| webapp-testing | Playwright Web 应用测试 |
| mcp-builder | 构建 MCP 服务器 |
| mcp-management | 管理 MCP 服务器 |
| repomix | 打包代码库为 AI 友好格式 |

---

## 四、Command 体系（34+）

### 4.1 开发命令（来自 everything-claude-code）

| 命令 | 用途 | 触发 Agent |
|------|------|------------|
| /plan | 创建实施计划 | planner |
| /tdd | 测试驱动开发 | tdd-guide |
| /code-review | 代码审查 | code-reviewer |
| /build-fix | 修复构建错误 | build-error-resolver |
| /e2e | E2E 测试 | e2e-runner |
| /refactor-clean | 死代码清理 | refactor-cleaner |
| /verify | 运行验证循环 | - |
| /update-docs | 更新文档 | doc-updater |

### 4.2 学习命令

| 命令 | 用途 |
|------|------|
| /learn | 从当前会话提取可复用模式 |
| /evolve | 将 instinct 聚类为 skill |
| /instinct-status | 查看已学习的 instincts |
| /instinct-import | 从他人导入 instincts |
| /instinct-export | 导出 instincts 分享 |
| /skill-create | 从 git 历史生成 skill |

### 4.3 Trellis 命令（本次集成新增）

| 命令 | 用途 |
|------|------|
| /trellis:start | 开始会话，收集上下文 |
| /trellis:parallel | 多代理流水线编排 |
| /trellis:finish-work | 完成工作检查清单 |
| /trellis:break-loop | 深度 Bug 分析 |
| /trellis:record-session | 记录会话进度 |
| /trellis:before-backend-dev | 后端开发前读规范 |
| /trellis:before-frontend-dev | 前端开发前读规范 |
| /trellis:check-backend | 后端代码检查 |
| /trellis:check-frontend | 前端代码检查 |
| /trellis:check-cross-layer | 跨层检查 |
| /trellis:create-command | 创建新命令 |
| /trellis:integrate-skill | 集成 Skill |
| /trellis:onboard | 新成员引导 |
| /trellis:update-spec | 更新规范 |

### 4.4 其他命令

| 命令 | 用途 |
|------|------|
| /checkpoint | 保存验证状态 |
| /eval | 运行评估 |
| /orchestrate | 多代理编排 |
| /setup-pm | 包管理器设置 |
| /test-coverage | 测试覆盖率 |
| /update-codemaps | 代码地图更新 |

---

## 五、MCP 工具服务器

> 详细用法见 `.trellis/spec/guides/mcp-tools-guide.md`

| 服务器 | 工具 | 用途 |
|--------|------|------|
| context7 | resolve-library-id, query-docs | 库/框架官方文档查询 |
| deepwiki | read_wiki_structure, read_wiki_contents, ask_question | 开源项目文档 |
| memory | create_entities, add_observations, search_nodes, read_graph 等 | 跨会话记忆持久化 |
| ace-tool | search_context, enhance_prompt | 代码语义检索 |
| fetch | fetch | URL 内容抓取 |
| sequential-thinking | sequentialthinking | 复杂问题多步推理 |

---

## 六、优先级体系

### 6.1 配置加载优先级

```
Hook（最高）> CLAUDE.md > rules/ > spec/guides/ > spec/frontend|backend/（最低）
```

### 6.2 触发优先级

| 优先级 | 机制 | 说明 |
|--------|------|------|
| 1 | Hook 拦截 | inject-subagent-context.py, ralph-loop.py |
| 2 | CLAUDE.md 路由表 | Skill/Agent 匹配表 |
| 3 | rules/ 规则 | 始终加载的行为规范 |
| 4 | spec/guides/ | 按需参考的详细指南 |
| 5 | spec/frontend\|backend/ | 技术栈特定规范 |

---

## 七、能力来源比对

### 7.1 everything-claude-code 独有能力

| 能力 | 说明 |
|------|------|
| 50+ Skills | 完整的技能库（开发、调试、设计、文档等） |
| 10 Interactive Agents | 日常交互的专业子代理 |
| 20 Commands | 斜杠命令快捷入口 |
| 3 Contexts | dev/review/research 模式切换 |
| 8 Rules | 始终加载的行为规范 |
| Homunculus 学习系统 | 自动提取工具使用模式为 instincts |
| Vibe Coding 工作流 | 说需求→出代码→看效果→调整 |
| 记忆持久化 | mcp__memory 跨会话记忆 |

### 7.2 Trellis 独有能力

| 能力 | 说明 |
|------|------|
| 6 Pipeline Agents | 结构化流水线（implement/check/debug/research/dispatch/plan） |
| Hook 上下文注入 | inject-subagent-context.py 自动为 Pipeline Agent 注入上下文 |
| Ralph Loop | check agent 质量控制循环（最多 5 次迭代） |
| Task 生命周期 | task.sh 管理 feature 的创建/激活/归档 |
| Git Worktree 并行 | 物理隔离的多代理并行开发 |
| Developer 身份 | 多开发者/多 AI 身份管理 |
| Session 记录 | 会话进度记录到 journal |
| 14 Trellis Commands | /trellis:start, /trellis:parallel 等 |
| 前后端规范体系 | spec/backend/, spec/frontend/ 完整开发规范 |
| 思维指南 | cross-layer, code-reuse 思维检查清单 |

### 7.3 重叠与互补

| 领域 | everything-claude-code | Trellis | 关系 |
|------|----------------------|---------|------|
| 代码审查 | code-reviewer Agent | check Agent | 互补：日常用前者，流水线用后者 |
| 任务规划 | planner Agent | plan Agent | 互补：交互用前者，流水线用后者 |
| 调试修复 | tdd-guide Agent | debug Agent | 互补：TDD 用前者，流水线用后者 |
| 代码调研 | Explore Agent | research Agent | 互补：快速探索用前者，深度调研用后者 |
| 安全检查 | security-reviewer | security-quality-guide.md | 互补：Agent 执行 + 规范参考 |
| 质量规范 | rules/coding-style.md | spec/guides/security-quality-guide.md | 重叠：rules/ 精简版，guides/ 详细版 |
| Git 规范 | rules/git-workflow.md | spec/guides/development-workflow-guide.md | 重叠：rules/ 精简版，guides/ 详细版 |

---

## 八、规范文件索引

### 8.1 spec/guides/ 目录（10个文件）

| 文件 | 用途 | 来源 |
|------|------|------|
| index.md | 目录索引 | Trellis |
| claude-code-capabilities.md | 完整能力索引 | 本次集成 |
| skill-usage-guide.md | Skill 使用规范 | 本次集成 |
| mcp-tools-guide.md | MCP 工具规范 | 本次集成 |
| agent-orchestration-guide.md | Agent 编排规范 | 本次集成 |
| security-quality-guide.md | 安全与质量 | 本次集成 |
| development-workflow-guide.md | 开发工作流 | 本次集成 |
| learning-memory-guide.md | 学习与记忆 | 本次集成 |
| trellis-operations-guide.md | Trellis 运维 | 本次集成 |
| cross-layer-thinking-guide.md | 跨层思维 | Trellis 原有 |
| code-reuse-thinking-guide.md | 代码复用思维 | Trellis 原有 |

### 8.2 rules/ 目录（8个文件）

| 文件 | 用途 |
|------|------|
| agents.md | Agent 编排规则 |
| coding-style.md | 不可变性、文件组织 |
| git-workflow.md | 提交格式、PR 流程 |
| hooks.md | Hook 系统说明 |
| patterns.md | API 响应、Repository 等常用模式 |
| performance.md | 模型选择、上下文管理 |
| security.md | 安全检查清单 |
| testing.md | TDD、80% 覆盖率 |

---

## 九、统计汇总

| 类别 | 数量 |
|------|------|
| Pipeline Agents (Layer 1) | 6 |
| Interactive Agents (Layer 2) | 10 |
| Built-in Agents (Layer 3) | 4 |
| Skills | 50+ |
| Commands (everything-claude-code) | 20 |
| Commands (Trellis) | 14 |
| Rules | 8 |
| Contexts | 3 |
| MCP 工具服务器 | 6 |
| spec/guides/ 文件 | 11 |
| Hooks | 3 |
| 技术栈规范 | 3 |