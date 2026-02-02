# Everything Claude Code 操作指南

**版本**：v2.0
**更新日期**：2026-02-03
**来源**：基于 [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) 项目

---

## 一、能力概览

### 1.1 核心组件

| 组件类型 | 数量 | 说明 |
|----------|------|------|
| Agents | 10 | 专业化子代理，处理特定任务 |
| Commands | 20 | 斜杠命令，快速执行工作流 |
| Skills | 50+ | 工作流定义和领域知识 |
| Rules | 8 | 始终遵循的规范 |
| Contexts | 3 | 动态上下文注入 |
| Hooks | 多个 | 基于事件的自动化 |

### 1.2 设计理念

1. **Token 优化** - 模型选择、系统提示精简、后台进程
2. **记忆持久化** - 跨会话自动保存/加载上下文
3. **持续学习** - 从会话中自动提取模式为可复用技能
4. **验证循环** - 检查点评估、持续验证
5. **并行化** - Git worktrees、级联方法、多实例扩展
6. **子代理编排** - 上下文问题解决、迭代检索模式

---

## 二、Agents（子代理）

### 2.1 Agent 列表

| Agent | 用途 | 触发方式 | 重要性 |
|-------|------|----------|--------|
| **planner** | 功能实施规划 | 复杂功能请求时自动/手动 | 高 |
| **architect** | 系统架构设计 | 架构决策时自动/手动 | 高 |
| **tdd-guide** | 测试驱动开发 | 新功能/修bug时自动 | 高 |
| **code-reviewer** | 代码质量审查 | 代码写完后自动 | 高 |
| **security-reviewer** | 安全漏洞分析 | 提交前自动 | 高 |
| **build-error-resolver** | 构建错误修复 | 构建失败时自动 | 中 |
| **e2e-runner** | E2E 测试 (Playwright) | 关键用户流程 | 中 |
| **refactor-cleaner** | 死代码清理 | 代码维护时 | 中 |
| **doc-updater** | 文档同步更新 | 代码变更后 | 低 |
| **database-reviewer** | 数据库审查 | 数据库变更时 | 中 |

### 2.2 Agent 调用规则

**自动触发场景**：
- 复杂功能请求 → `planner`
- 代码写完/修改后 → `code-reviewer`
- 新功能/修 bug → `tdd-guide`
- 架构决策 → `architect`
- 构建失败 → `build-error-resolver`
- 提交前 → `security-reviewer`

**手动调用**：
```
Task(subagent_type="planner", prompt="规划用户认证功能")
```

### 2.3 并行执行原则

独立操作必须并行执行：
```markdown
# 正确：并行执行
同时启动 3 个 Agent：
1. security-reviewer 分析 auth.ts
2. code-reviewer 审查 cache 系统
3. tdd-guide 检查 utils.ts

# 错误：不必要的串行
先 agent 1，再 agent 2，再 agent 3
```

---

## 三、Commands（斜杠命令）

### 3.1 核心命令

| 命令 | 用途 | 触发 Agent | 重要性 |
|------|------|------------|--------|
| `/plan` | 创建实施计划 | planner | 高 |
| `/tdd` | 测试驱动开发 | tdd-guide | 高 |
| `/code-review` | 代码审查 | code-reviewer | 高 |
| `/build-fix` | 修复构建错误 | build-error-resolver | 高 |
| `/e2e` | E2E 测试生成 | e2e-runner | 中 |
| `/refactor-clean` | 死代码清理 | refactor-cleaner | 中 |
| `/verify` | 运行验证循环 | - | 中 |
| `/update-docs` | 更新文档 | doc-updater | 低 |

### 3.2 学习系统命令

| 命令 | 用途 | 说明 |
|------|------|------|
| `/learn` | 提取模式 | 从当前会话提取可复用模式 |
| `/evolve` | 演化 instinct | 将 instinct 聚类为 skill |
| `/instinct-status` | 查看学习状态 | 显示已学习的 instincts |
| `/instinct-import` | 导入 instincts | 从他人导入 |
| `/instinct-export` | 导出 instincts | 分享给他人 |
| `/skill-create` | 创建 skill | 从 git 历史生成 skill |

### 3.3 其他命令

| 命令 | 用途 | 说明 |
|------|------|------|
| `/checkpoint` | 保存验证状态 | 验证循环检查点 |
| `/eval` | 评估命令 | 运行评估 |
| `/orchestrate` | 编排命令 | 多代理编排 |
| `/setup-pm` | 包管理器设置 | 配置 npm/pnpm/yarn/bun |
| `/test-coverage` | 测试覆盖率 | 检查覆盖率 |
| `/update-codemaps` | 代码地图更新 | 更新代码索引 |

---

## 四、Skills（技能）

### 4.1 已集成的核心 Skills

| Skill | 用途 | 状态 |
|-------|------|------|
| aesthetic | UI/UX 美学设计 | 已集成 |
| ai-multimodal | 多媒体处理 (Gemini) | 已集成 |
| backend-development | 后端 API 开发 | 已集成 |
| better-auth | 认证授权实现 | 已集成 |
| databases | 数据库操作 (MongoDB/PostgreSQL) | 已集成 |
| devops | 部署运维 (Cloudflare) | 已集成 |
| frontend-design | 前端界面开发 | 已集成 |
| frontend-development | React/TypeScript 开发 | 已集成 |
| web-frameworks | Next.js/Turborepo | 已集成 |
| ui-styling | shadcn/ui + Tailwind | 已集成 |

### 4.2 调试与问题解决 Skills

| Skill | 用途 | 状态 |
|-------|------|------|
| debugging/systematic-debugging | 系统化调试 | 已集成 |
| debugging/root-cause-tracing | 根因追踪 | 已集成 |
| debugging/defense-in-depth | 深度防御 | 已集成 |
| debugging/verification-before-completion | 完成前验证 | 已集成 |
| problem-solving/when-stuck | 卡住时的策略 | 已集成 |
| problem-solving/collision-zone-thinking | 碰撞区思维 | 已集成 |
| problem-solving/inversion-exercise | 逆向思维 | 已集成 |
| problem-solving/meta-pattern-recognition | 元模式识别 | 已集成 |
| problem-solving/scale-game | 规模游戏 | 已集成 |
| problem-solving/simplification-cascades | 简化级联 | 已集成 |

---

## 五、Contexts（上下文模式）

### 5.1 可用上下文

| Context | 模式 | 行为特点 |
|---------|------|----------|
| **dev** | 开发模式 | 先写代码后解释，偏好可用方案 |
| **review** | 审查模式 | 彻底阅读，按严重性排序问题 |
| **research** | 研究模式 | 广泛阅读，先理解后行动 |

### 5.2 Context 使用场景

**dev.md** - 开发模式：
- 优先级：能用 → 正确 → 整洁
- 工具偏好：Edit, Write, Bash

**review.md** - 审查模式：
- 检查清单：逻辑错误、边界情况、安全、性能
- 输出格式：按文件分组，严重性优先

**research.md** - 研究模式：
- 流程：理解问题 → 探索代码 → 形成假设 → 验证 → 总结
- 工具偏好：Read, Grep, WebSearch

---

## 六、Rules（规则）

### 6.1 规则列表

| Rule | 用途 | 状态 |
|------|------|------|
| security.md | 安全检查 | 已有 |
| coding-style.md | 不可变性、文件组织 | 已有 |
| testing.md | TDD、80%覆盖率 | 已有 |
| git-workflow.md | 提交格式、PR流程 | 已有 |
| agents.md | 何时委托子代理 | 已有 |
| performance.md | 模型选择、上下文管理 | 已有 |
| hooks.md | Hook 系统说明 | 已有 |
| patterns.md | 常用模式 | 已有 |

---

## 七、Hooks（钩子）

### 7.1 Hook 类型

| 类型 | 触发时机 | 用途 |
|------|----------|------|
| PreToolUse | 工具执行前 | 验证、参数修改 |
| PostToolUse | 工具执行后 | 自动格式化、检查 |
| Stop | 会话结束时 | 最终验证 |
| Notification | 通知事件 | 状态提醒 |

### 7.2 推荐 Hooks

**PreToolUse**：
- tmux 提醒：长时间命令建议使用 tmux
- git push 审查：推送前打开编辑器审查
- 文档拦截：阻止创建不必要的 .md/.txt 文件

**PostToolUse**：
- Prettier：编辑后自动格式化 JS/TS
- TypeScript 检查：编辑 .ts/.tsx 后运行 tsc
- console.log 警告：检测调试日志

---

## 八、集成状态汇总

### 8.1 已完成集成

**Agents（10个）** - 全部已集成
- planner, architect, tdd-guide, code-reviewer, security-reviewer
- build-error-resolver, e2e-runner, refactor-cleaner, doc-updater, database-reviewer

**Commands（20个）** - 全部已集成
- 核心：plan, tdd, code-review, build-fix, e2e, refactor-clean, verify, update-docs
- 学习：learn, evolve, instinct-status, instinct-import, instinct-export, skill-create
- 其他：checkpoint, eval, orchestrate, setup-pm, test-coverage, update-codemaps

**Skills（50+个）** - 全部已集成
- 开发：frontend-design, backend-development, databases, web-frameworks, ui-styling
- 调试：debugging/*, problem-solving/*
- 高级：continuous-learning, continuous-learning-v2, iterative-retrieval
- 高级：strategic-compact, eval-harness, verification-loop
- 文档：doc-coauthoring, docs-seeker, changelog-generator
- 多媒体：ai-multimodal, media-processing, canvas-design

**Contexts（3个）** - 全部已集成
- dev.md, review.md, research.md

### 8.2 可选扩展（按需添加）

| 组件 | 说明 |
|------|------|
| Go 相关 Agent | go-build-resolver, go-reviewer |
| Go 相关 Command | go-build, go-review, go-test |
| 特定技术 Skill | golang-patterns, clickhouse-io 等 |

---

## 九、扩展指南

### 9.1 添加新 Skill

```powershell
# 从 everything-claude-code 复制特定 skill
Copy-Item -Recurse "C:\Users\12240\Desktop\pro\everything-claude-code\skills\<skill-name>" "C:\Users\12240\.claude\skills\"
```

### 9.2 创建自定义 Skill

使用 `/skill-create` 命令或参考 `skill-creator` Skill 创建新技能。

---

## 十、重要注意事项

### 10.1 上下文窗口管理

**关键**：不要同时启用所有 MCP。200k 上下文窗口可能因工具过多而缩减到 70k。

经验法则：
- 配置 20-30 个 MCP
- 每个项目启用不超过 10 个
- 活跃工具不超过 80 个

### 10.2 模型选择策略

| 模型 | 场景 | 成本 |
|------|------|------|
| Haiku 4.5 | 轻量代理、频繁调用 | 低 |
| Sonnet 4.5 | 主要开发工作 | 中 |
| Opus 4.5 | 复杂架构决策 | 高 |

---

## 十一、Vibe Coding 工作流

### 11.1 核心理念

**说需求 → 出代码 → 看效果 → 调整**

用户负责"感觉对不对"（vibe check），Claude 负责编码实现。

### 11.2 标准流程

| 步骤 | 动作 | Skill/工具 |
|------|------|------------|
| 1 | 需求细化 | superpowers:brainstorm |
| 2 | 代码生成 | frontend-design / backend-development |
| 3 | 实时预览 | webapp-testing / browser |
| 4 | 效果检查 | chrome-devtools 截图 |
| 5 | 快速调整 | 重复 2-4 |
| 6 | 质量保障 | code-reviewer / tdd-guide |

### 11.3 关键 Skills

| 阶段 | Skill | 用途 |
|------|-------|------|
| 需求 | superpowers:brainstorm | 交互式需求细化 |
| 开发 | frontend-design | 前端界面 |
| 开发 | backend-development | 后端 API |
| 预览 | webapp-testing | Web 应用测试 |
| 预览 | browser | 浏览器自动化 |
| 调试 | chrome-devtools | 截图/调试 |
| 质量 | code-reviewer | 代码审查 |

### 11.4 快速迭代原则

- **dev 模式**：先能用，再正确，后整洁
- **小步快跑**：每次改动尽量小
- **即时反馈**：改完立即预览
- **自动修复**：遇错用 debugging skill

---

## 更新记录

- **v2.1** (2026-02-03) - Vibe Coding 增强版
  - 新增第十一章 Vibe Coding 工作流
  - 定义标准流程和关键 Skills
  - 添加快速迭代原则

- **v2.0** (2026-02-03) - 全面集成版
  - 更新组件数量：Agents 10, Commands 20, Skills 50+
  - 移除 Go 相关组件（可选扩展）
  - 标记所有核心组件为已集成
  - 简化快速补充指南为扩展指南

- **v1.0** (2026-02-02) - 初始版本
  - 完整能力梳理
  - 遗漏项汇总
  - 快速补充指南
