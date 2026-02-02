# Skill 系统使用规范

> **Purpose**: 定义 Skill 的强制使用规则、匹配逻辑和触发条件，确保每次交互都能调用最合适的 Skill。

---

## 一、Skill 铁律（最高优先级）

> **如果有 1% 的可能性某个 Skill 适用于当前任务，必须立即调用该 Skill。**

这不是建议，是强制要求。

### 1.1 禁止的思维模式

| 错误想法 | 正确做法 |
|----------|----------|
| "这只是个简单问题" | 简单问题也要检查 Skill |
| "我先了解一下情况" | Skill 告诉你如何了解情况 |
| "让我先探索代码库" | Skill 告诉你如何探索 |
| "这个任务不需要 Skill" | 如果 Skill 存在，就必须使用 |
| "我先做这一件事" | 做任何事之前先检查 Skill |

### 1.2 违规检测

以下行为视为违规：
- 直接开始写代码而没有调用任何 Skill
- 遇到错误直接尝试修复而没有调用 debugging Skill
- 完成任务没有调用 code-review 验证

---

## 二、关键词匹配表

收到用户消息后，必须先检查此表：

| 关键词 | 立即调用的 Skill |
|--------|------------------|
| 前端/UI/组件/页面 | `frontend-design` + `aesthetic` |
| React/Vue/Next.js | `frontend-design` + `web-frameworks` |
| Electron/Tauri/桌面 | `frontend-design` |
| 后端/API/服务 | `backend-development` |
| Java/Spring | `backend-development` |
| Python/FastAPI | `backend-development` |
| 数据库/SQL | `databases` |
| 登录/认证 | `better-auth` |
| 部署/Docker | `devops` |
| 调试/报错 | `debugging/systematic-debugging` |
| 计划/方案 | `superpowers:brainstorm` |
| 文档编写 | `doc-coauthoring` |

---

## 三、强制触发规则

以下场景必须调用对应 Skill，无需用户指示：

| 场景 | 必须调用的 Skill |
|------|------------------|
| 遇到 bug/错误/测试失败 | `debugging/systematic-debugging` |
| 开始新功能开发 | `superpowers:brainstorm` → `superpowers:write-plan` |
| 需要写计划/方案 | `superpowers:brainstorm` |
| 完成任务后 | `code-review`（验证完成度） |
| 调试卡住/尝试 3 次失败 | `problem-solving/when-stuck` |
| 需要创建文档 | `doc-coauthoring` |
| 前端 UI 开发 | `frontend-design` + `aesthetic` |
| 后端 API 开发 | `backend-development` |
| 数据库操作 | `databases` |

---

## 四、Skill 调用流程

```
收到用户消息
    │
    ├─ 1. 检查关键词匹配表（第二章）
    │     └─ 匹配到 → 立即调用对应 Skill
    │
    ├─ 2. 检查强制触发规则（第三章）
    │     └─ 符合场景 → 调用对应 Skill
    │
    ├─ 3. 宣布使用哪个 Skill
    │
    └─ 4. 按 Skill 指导执行任务
```

---

## 五、与 Trellis 流水线的集成

### 5.1 流水线模式下的 Skill 使用

当通过 `/trellis:parallel` 启动流水线时：
- **plan 阶段**: 自动调用 `superpowers:brainstorm` 细化需求
- **implement 阶段**: 根据 dev_type 自动调用对应 Skill
- **check 阶段**: 自动调用 `code-review`
- **debug 阶段**: 自动调用 `debugging/systematic-debugging`

### 5.2 日常交互模式下的 Skill 使用

非流水线模式下，按本文档的匹配表和触发规则执行。

---

## 六、技术栈规范加载

根据任务类型，按需加载对应技术栈规范：

| 任务类型 | 加载文件 |
|----------|----------|
| 前端/桌面端/UI | `~/.claude/stacks/frontend.md` |
| Java 后端 | `~/.claude/stacks/java.md` |
| Python 开发 | `~/.claude/stacks/python.md` |

加载时机：Skill 调用后、编码前。
