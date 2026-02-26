# Claude Code 完整能力总览

**版本**：v2.0
**更新日期**：2026-02-26

> 本文档是所有能力的统一索引，涵盖 everything-claude-code 的完整能力体系。

---

## 一、能力来源与架构

### 1.1 能力来源

| 来源 | 说明 | 集成时间 |
|------|------|----------|
| **everything-claude-code** | 社区最佳实践集合：50+ Skills、10 Agents、20 Commands、8 Rules、3 Contexts | 2026-02-02 |
| **自定义编码规范** | CLAUDE.md 路由表、rules/、stacks/、contexts/ | 2026-01-22 |

### 1.2 整体架构

```
~/.claude/                          ← 全局配置根目录
├── CLAUDE.md                       ← 核心路由表 + 精简原则（v4.0）
├── GUIDE.md                        ← 集成记录
├── CAPABILITIES.md                 ← 本文件：完整能力总览
├── USAGE-GUIDE.md                  ← 使用指南
├── AGENTS.md                       ← Agent 系统概览
│
├── agents/                         ← Agent 定义文件（10个交互式 Agent）
├── commands/                       ← 斜杠命令定义（20个）
├── hooks/                          ← Hook 配置模板
├── scripts/                        ← JS Hook 脚本 + 工具库
│   ├── hooks/                      ← 8 个 JS Hook 脚本
│   └── lib/                        ← 共享工具库
│
├── rules/                          ← 始终加载的规则（8个）
├── stacks/                         ← 技术栈规范（按需加载）
├── skills/                         ← Skill 定义文件（50+）
├── contexts/                       ← 上下文模式（3个）
│
├── homunculus/                     ← 自动学习系统
│   └── instincts/                  ← personal/ + inherited/
└── sessions/                       ← 会话状态持久化
```

---

## 二、Agent 体系

### 2.1 Interactive Agents（由 CLAUDE.md 管理）

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

### 2.2 Built-in Agents（系统内置）

| Agent | 用途 |
|-------|------|
| `Explore` | 代码库探索（只读） |
| `Plan` | 方案设计（只读） |
| `Bash` | 命令执行 |
| `general-purpose` | 通用多步骤任务 |

---

## 三、Skill 体系（50+）

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

## 四、Command 体系（20）

### 4.1 开发命令

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

### 4.3 其他命令

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
Hook（最高）> CLAUDE.md > rules/ > stacks/（最低）
```

### 6.2 触发优先级

| 优先级 | 机制 | 说明 |
|--------|------|------|
| 1 | Hook 拦截 | JS Hook 脚本（session、compact、console.log 等） |
| 2 | CLAUDE.md 路由表 | Skill/Agent 匹配表 |
| 3 | rules/ 规则 | 始终加载的行为规范 |
| 4 | stacks/ | 技术栈特定规范 |

---

## 七、规范文件索引

### 7.1 rules/ 目录（8个文件）

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

## 八、统计汇总

| 类别 | 数量 |
|------|------|
| Interactive Agents | 10 |
| Built-in Agents | 4 |
| Skills | 50+ |
| Commands | 20 |
| Rules | 8 |
| Contexts | 3 |
| MCP 工具服务器 | 6 |
| JS Hooks | 8 |
| 技术栈规范 | 3 |
