# Claude Code 完整能力索引

> **Purpose**: 作为 Claude Code 所有可用能力的唯一真相源，供所有 Agent 和工作流引用。

---

## 一、内置工具

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| Read | 读取文件内容 | 查看代码、配置、文档 |
| Write | 创建/覆写文件 | 新建文件（优先用 Edit） |
| Edit | 精确字符串替换 | 修改现有代码（首选） |
| Bash | 执行终端命令 | git、npm、系统命令 |
| Glob | 文件名模式匹配 | 按名称查找文件 |
| Grep | 正则内容搜索 | 精确字符串/模式查找 |
| WebSearch | 联网搜索 | 技术问题、最新信息 |
| WebFetch | 抓取网页内容 | 读取在线文档 |
| TodoWrite | 任务追踪 | 多步骤任务管理 |
| Task | 启动子代理 | 复杂任务分发 |
| AskUserQuestion | 询问用户 | 需求澄清、方案确认 |
| EnterPlanMode | 进入规划模式 | 复杂实现前的方案设计 |
| NotebookEdit | Jupyter 编辑 | 数据分析笔记本 |

---

## 二、MCP 工具服务器

### 2.1 context7 - 库文档查询

```
mcp__context7__resolve-library-id  → 解析库名为 ID
mcp__context7__query-docs          → 查询库文档和代码示例
```

**用途**: 获取任何编程库/框架的最新官方文档。

### 2.2 deepwiki - 开源项目文档

```
mcp__deepwiki__read_wiki_structure  → 获取仓库文档结构
mcp__deepwiki__read_wiki_contents   → 查看仓库完整文档
mcp__deepwiki__ask_question         → 向仓库提问
```

**用途**: 理解 GitHub 开源项目的架构和实现。

### 2.3 memory - 跨会话记忆

```
mcp__memory__create_entities    → 创建实体
mcp__memory__add_observations   → 添加观察
mcp__memory__search_nodes       → 搜索记忆
mcp__memory__read_graph         → 读取知识图谱
mcp__memory__open_nodes         → 打开指定节点
mcp__memory__create_relations   → 创建关系
mcp__memory__delete_entities    → 删除实体
mcp__memory__delete_observations → 删除观察
mcp__memory__delete_relations   → 删除关系
```

**用途**: 跨会话持久化用户偏好、架构决策、项目约定。

### 2.4 ace-tool - 代码语义检索

```
mcp__ace-tool__search_context   → 自然语言代码搜索
mcp__ace-tool__enhance_prompt   → 增强用户 prompt
```

**用途**: 语义级代码库搜索，理解代码意图而非仅匹配字符串。

### 2.5 fetch - URL 抓取

```
mcp__fetch__fetch  → 抓取 URL 内容为 markdown
```

**用途**: 获取在线资源内容。

### 2.6 sequential-thinking - 深度推理

```
mcp__sequential-thinking__sequentialthinking  → 逐步推理
```

**用途**: 复杂问题的多步骤推理、架构设计、方案对比。

---

## 三、Skill 清单

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

### 3.3 文档协作类

| Skill | 用途 |
|-------|------|
| doc-coauthoring | 文档协作编写 |
| docs-seeker | 搜索技术文档（llms.txt/Repomix） |
| changelog-generator | 从 git 生成变更日志 |

### 3.4 设计创意类

| Skill | 用途 |
|-------|------|
| aesthetic | UI/UX 美学设计 |
| canvas-design | 视觉设计（PNG/PDF） |
| ai-multimodal | 多媒体处理（Gemini API） |
| algorithmic-art | p5.js 生成艺术 |
| brand-guidelines | Anthropic 品牌风格 |
| theme-factory | 主题工厂（10 预设主题） |
| ui-styling | shadcn/ui + Tailwind 样式 |

### 3.5 高级能力类

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

### 3.6 工具集成类

| Skill | 用途 |
|-------|------|
| browser | Chrome DevTools Protocol 浏览器自动化 |
| chrome-devtools | Puppeteer 截图/调试/性能分析 |
| webapp-testing | Playwright Web 应用测试 |
| mcp-builder | 构建 MCP 服务器 |
| mcp-management | 管理 MCP 服务器 |
| repomix | 打包代码库为 AI 友好格式 |
| media-processing | FFmpeg/ImageMagick 多媒体处理 |
| notebooklm | Google NotebookLM 查询 |

### 3.7 文件处理类

| Skill | 用途 |
|-------|------|
| pdf | PDF 提取/创建/合并/表单 |
| docx | Word 文档创建/编辑/分析 |
| xlsx | Excel 电子表格处理 |
| pptx | PowerPoint 演示文稿 |

---

## 四、可用 Agent（Task subagent_type）

### 4.1 Trellis 流水线 Agent（由 Hook 管理上下文）

| subagent_type | 用途 | Hook 注入 |
|---------------|------|-----------|
| implement | 纯代码实现 | implement.jsonl + prd.md |
| check | 代码审查+自修复 | check.jsonl + prd.md |
| debug | 问题修复 | debug.jsonl + review 结果 |
| research | 纯调研（只读） | research.jsonl |
| dispatch | 流水线调度 | 无（纯调度） |
| plan | 任务规划 | 无（自主调研） |

### 4.2 交互式 Agent（由 CLAUDE.md 管理行为）

| subagent_type | 用途 | 触发时机 |
|---------------|------|----------|
| planner | 实施规划 | 复杂功能、重构 |
| architect | 架构设计 | 架构决策 |
| tdd-guide | 测试驱动开发 | 新功能、修 bug |
| code-reviewer | 代码审查 | 代码写完后 |
| security-reviewer | 安全分析 | 提交前 |
| build-error-resolver | 构建修复 | 构建失败 |
| e2e-runner | E2E 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档更新 | 更新文档 |
| database-reviewer | 数据库审查 | 数据库变更 |

### 4.3 通用 Agent（内置）

| subagent_type | 用途 |
|---------------|------|
| Explore | 代码库探索（只读） |
| Plan | 方案设计（只读） |
| Bash | 命令执行 |
| general-purpose | 通用多步骤任务 |

---

## 五、工具选择决策树

```
代码搜索：
├─ 知道文件名/路径模式 → Glob
├─ 搜索精确字符串/正则 → Grep
├─ 理解语义/探索代码库 → ace-tool 或 Task(Explore)
└─ 跳转定义/查找引用 → LSP

文档/信息：
├─ 官方库文档 → context7 (resolve-library-id → query-docs)
├─ 开源项目理解 → deepwiki (ask_question)
├─ 技术问题/最新信息 → WebSearch
├─ 在线页面内容 → WebFetch 或 fetch
└─ GitHub issues/PR → context7 Skill

任务分发：
├─ Trellis 流水线任务 → /trellis:parallel
├─ 复杂多步骤任务 → Task + 合适的 subagent_type
├─ 需要用户确认的方案 → EnterPlanMode
└─ 简单直接任务 → 直接执行

推理/分析：
├─ 多步骤推理 → sequential-thinking
├─ 架构设计 → Task(architect)
└─ 方案对比 → sequential-thinking + AskUserQuestion
```

---

## 六、Command 快捷入口

### 6.1 开发命令

| 命令 | 用途 |
|------|------|
| /plan | 创建实施计划 |
| /tdd | 测试驱动开发 |
| /code-review | 代码审查 |
| /build-fix | 修复构建错误 |
| /e2e | E2E 测试 |

### 6.2 学习命令

| 命令 | 用途 |
|------|------|
| /learn | 提取可复用模式 |
| /evolve | 演化 instinct 为 skill |
| /instinct-status | 查看学习状态 |
| /instinct-import | 导入 instincts |
| /instinct-export | 导出 instincts |

### 6.3 Trellis 命令

| 命令 | 用途 |
|------|------|
| /trellis:start | 开始会话 |
| /trellis:parallel | 多代理流水线 |
| /trellis:finish-work | 完成工作检查清单 |
| /trellis:break-loop | 深度 Bug 分析 |
| /trellis:check-cross-layer | 跨层检查 |
| /trellis:record-session | 记录会话 |

---

## 七、上下文模式

| 模式 | 触发方式 | 行为特点 |
|------|----------|----------|
| dev | "进入开发模式" | 先写代码后解释，偏好可用方案 |
| review | "进入审查模式" | 彻底阅读，按严重性排序问题 |
| research | "进入研究模式" | 广泛阅读，先理解后行动 |
