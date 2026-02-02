# MCP 工具使用规范

> **Purpose**: 定义每个 MCP 服务器的使用场景、调用方式和最佳实践，确保工具选择精准高效。

---

## 一、知识获取铁律

> **遇到不熟悉的知识，必须联网搜索，严禁猜测。**

| 场景 | 首选工具 | 备选工具 |
|------|----------|----------|
| 通用技术问题 | `WebSearch` | `mcp__fetch__fetch` |
| 库/框架文档 | `context7` | `deepwiki` |
| 开源项目理解 | `deepwiki` | `context7` |
| 在线页面内容 | `mcp__fetch__fetch` | `WebFetch` |

---

## 二、context7 - 库文档查询

### 2.1 使用流程

```
步骤 1: resolve-library-id（解析库名）
步骤 2: query-docs（查询文档）
```

**必须先 resolve 再 query，不可跳过。**

### 2.2 适用场景

- 查询 React、Vue、Next.js 等框架的 API 用法
- 查询 Zod、Prisma、Drizzle 等库的最新语法
- 获取带代码示例的官方文档

### 2.3 限制

- 每个问题最多调用 3 次 resolve-library-id
- 每个问题最多调用 3 次 query-docs
- 找不到时用已有最佳结果

---

## 三、deepwiki - 开源项目文档

### 3.1 适用场景

- 理解 GitHub 开源项目的架构设计
- 查询项目内部实现细节
- 了解项目的模块划分和依赖关系

### 3.2 使用方式

| 工具 | 用途 |
|------|------|
| `read_wiki_structure` | 先获取文档结构，了解有哪些主题 |
| `read_wiki_contents` | 查看完整文档内容 |
| `ask_question` | 直接提问，获取 AI 生成的回答 |

### 3.3 最佳实践

- 对于简单问题，直接用 `ask_question`
- 对于需要全面了解的项目，先 `read_wiki_structure` 再选择性阅读
- 参数 `repoName` 格式：`owner/repo`（如 `facebook/react`）

---

## 四、memory - 跨会话记忆

### 4.1 何时记忆

| 场景 | 操作 |
|------|------|
| 用户明确的偏好设置 | `create_entities` + `add_observations` |
| 重要的架构决策 | `create_entities` + `create_relations` |
| 项目特定的约定 | `add_observations` |
| 反复出现的模式 | `add_observations` |

### 4.2 实体类型规范

| entityType | 用途 | 示例 |
|------------|------|------|
| preference | 用户偏好 | "使用中文响应" |
| decision | 架构决策 | "选择 PostgreSQL 而非 MongoDB" |
| pattern | 代码模式 | "API 统一返回 ApiResponse 格式" |
| convention | 项目约定 | "commit 格式用 conventional commits" |
| project | 项目信息 | "项目名称、技术栈、目录结构" |

### 4.3 会话开始时

每次会话开始，应检查记忆：

```
search_nodes("当前项目名") → 加载项目上下文
search_nodes("用户偏好") → 加载用户偏好
```

---

## 五、ace-tool - 代码语义检索

### 5.1 适用场景

- 不知道文件位置时的语义搜索
- 理解代码库整体架构
- 编辑前获取相关符号的详细信息

### 5.2 与 Grep/Glob 的区别

| 工具 | 适用场景 |
|------|----------|
| ace-tool | 语义搜索："处理用户认证的函数在哪" |
| Grep | 精确匹配：`handleAuth`、`class UserService` |
| Glob | 文件名匹配：`**/*.test.ts`、`src/**/index.ts` |

### 5.3 查询技巧

- 用自然语言描述 + 关键词：`"用户登录验证逻辑 Keywords: auth, login, validate"`
- 编辑前查询所有相关符号，一次性获取完整上下文
- 必须提供 `project_root_path` 参数

---

## 六、sequential-thinking - 深度推理

### 6.1 强制触发场景

| 场景 | 说明 |
|------|------|
| 多步骤推理 | 需要 3 步以上逻辑推导 |
| 架构设计 | 系统设计、模块划分 |
| 疑难调试 | 常规方法无法定位的 bug |
| 方案对比 | 2 个以上方案需要权衡 |

### 6.2 关键参数

| 参数 | 说明 |
|------|------|
| `thought` | 当前推理步骤内容 |
| `thoughtNumber` | 当前步骤编号 |
| `totalThoughts` | 预估总步骤数（可动态调整） |
| `nextThoughtNeeded` | 是否需要继续推理 |
| `isRevision` | 是否修正之前的推理 |
| `branchFromThought` | 分支推理的起点 |

---

## 七、工具选择总决策树

```
需要信息：
├─ 项目内代码 → ace-tool / Grep / Glob
├─ 库/框架文档 → context7
├─ 开源项目 → deepwiki
├─ 通用技术问题 → WebSearch
├─ 在线页面 → fetch / WebFetch
└─ 历史决策/偏好 → memory

需要推理：
├─ 简单判断 → 直接推理
└─ 复杂多步 → sequential-thinking

需要持久化：
├─ 用户偏好 → memory (create_entities)
├─ 架构决策 → memory (create_entities + relations)
└─ 会话状态 → sessions/ 目录
```
