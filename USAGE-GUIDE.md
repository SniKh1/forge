# Claude Code 使用指南

**版本**：v2.1
**更新日期**：2026-02-26

> 本文档面向实际项目使用者，介绍每项功能的作用、适用场景和使用方法。

---

## 一、快速开始

### 1.1 日常开发（最常用）

直接向 Claude 描述需求即可。系统会自动：
1. 匹配合适的 Skill（如前端任务自动调用 `frontend-design`）
2. 在需要时调用 Agent（如代码写完后自动调用 `code-reviewer`）
3. 遵循 rules/ 中的规范（安全、代码风格、测试等）

**示例**：
```
用户：帮我写一个用户登录页面
Claude：自动调用 frontend-design + better-auth Skill → 生成代码 → 调用 code-reviewer 审查
```

### 1.2 使用斜杠命令

| 场景 | 命令 | 说明 |
|------|------|------|
| 开始规划 | `/plan` | 创建实施计划 |
| 测试驱动 | `/tdd` | 先写测试再实现 |
| 代码审查 | `/code-review` | 审查当前代码 |
| 构建修复 | `/build-fix` | 修复构建错误 |
| E2E 测试 | `/e2e` | 生成端到端测试 |

### 1.3 切换上下文模式

| 说法 | 模式 | 行为 |
|------|------|------|
| "进入开发模式" | dev | 先写代码后解释，优先可用方案 |
| "进入审查模式" | review | 彻底阅读，按严重性排序 |
| "进入研究模式" | research | 广泛阅读，先理解后行动 |

---

## 二、Skill 模块安装

Skills 不再随主安装脚本捆绑，改为按需下载。安装后的 Skills 位于 `~/.claude/skills/`。

### 2.1 交互式安装（推荐）

```bash
# macOS/Linux
bash ~/.claude/scripts/install-skills.sh

# Windows PowerShell
powershell ~/.claude/scripts/install-skills.ps1
```

运行后会显示角色预设菜单，选择对应角色即可自动安装所需 Skills。

### 2.2 命令行安装

```bash
# 安装角色预设
bash ~/.claude/scripts/install-skills.sh --preset fullstack

# 安装指定模块
bash ~/.claude/scripts/install-skills.sh --modules frontend,backend,docs

# 查看可用模块和预设
bash ~/.claude/scripts/install-skills.sh --list

# 查看已安装的 Skills
bash ~/.claude/scripts/install-skills.sh --installed
```

### 2.3 角色预设速查

| 预设 | 包含模块 | 适合 |
|------|----------|------|
| fullstack | frontend + backend + docs + testing + debugging | 全栈开发者 |
| frontend-dev | frontend + testing + docs | 前端开发者 |
| backend-dev | backend + testing + docs | 后端开发者 |
| java-dev | backend + java + testing + docs | Java 开发者 |
| python-dev | backend + python + ai-ml + docs | Python 开发者 |
| security-eng | security + testing + devops | 安全工程师 |
| devops-eng | devops + security + docs | DevOps 工程师 |
| all | 所有模块 | 全部安装 |

> Core 模块（26 个基础 Skill）始终自动安装。完整目录见 `SKILLS-CATALOG.md`。

---

## 三、Skill 使用场景

### 3.1 前端开发

**适用场景**：构建 UI 界面、组件、页面

| Skill | 何时使用 |
|-------|----------|
| `frontend-design` | 创建页面/组件 |
| `aesthetic` | 需要高质量 UI 设计 |
| `ui-styling` | shadcn/ui + Tailwind 样式 |
| `web-frameworks` | Next.js/Turborepo 项目 |

**示例**：
```
用户：帮我做一个仪表盘页面，要好看
→ 自动调用 frontend-design + aesthetic
```

### 3.2 后端开发

**适用场景**：API 接口、服务端逻辑、数据库操作

| Skill | 何时使用 |
|-------|----------|
| `backend-development` | API/服务端开发 |
| `databases` | 数据库设计与操作 |
| `better-auth` | 登录/认证/授权 |
| `devops` | 部署/Docker/CI |

### 3.3 调试与问题解决

**适用场景**：遇到 bug、测试失败、构建错误

| Skill | 何时使用 |
|-------|----------|
| `debugging/systematic-debugging` | 系统化排查 bug |
| `debugging/root-cause-tracing` | 追踪根因 |
| `problem-solving/when-stuck` | 尝试 3 次仍失败时 |
| `problem-solving/collision-zone-thinking` | 多系统交互问题 |

**示例**：
```
用户：这个接口一直返回 500 错误
→ 自动调用 debugging/systematic-debugging
```

### 3.4 文档与设计

| Skill | 何时使用 |
|-------|----------|
| `doc-coauthoring` | 协作编写文档 |
| `canvas-design` | 创建海报/视觉设计 |
| `ai-multimodal` | 处理音频/图片/视频 |

---

## 四、Agent 使用场景

### 4.1 日常交互 Agent（自动触发）

以下 Agent 会在合适时机自动调用，无需手动操作：

| 场景 | 自动调用 Agent | 做什么 |
|------|---------------|--------|
| 你提出复杂功能需求 | `planner` | 拆解任务、制定计划 |
| 代码刚写完 | `code-reviewer` | 审查代码质量 |
| 新功能或修 bug | `tdd-guide` | 引导先写测试 |
| 涉及架构决策 | `architect` | 评估架构方案 |
| 构建失败 | `build-error-resolver` | 分析并修复错误 |
| 准备提交代码 | `security-reviewer` | 安全漏洞扫描 |

---

## 五、学习系统

### 5.1 自动学习（无需操作）

系统会自动记录你的工具使用模式，在会话结束时提取为 instincts。

### 5.2 手动学习命令

| 命令 | 用途 |
|------|------|
| `/learn` | 从当前会话提取模式 |
| `/evolve` | 将 instinct 演化为 skill |
| `/instinct-status` | 查看已学习内容 |
| `/instinct-export` | 导出分享给他人 |
| `/instinct-import` | 从他人导入 |

### 5.3 跨会话记忆

Claude 会自动将重要决策和偏好保存到 `mcp__memory`，下次会话可以回忆。

**自动记忆的内容**：用户偏好、架构决策、项目约定、反复出现的模式

---

## 六、MCP 工具使用场景

| 场景 | 工具 | 示例 |
|------|------|------|
| 查库文档 | `context7` | "React useEffect 怎么用" |
| 查开源项目 | `deepwiki` | "Next.js 的路由怎么工作" |
| 搜索代码 | `ace-tool` | "用户认证在哪里实现的" |
| 联网搜索 | `WebSearch` | "2026 年最新的 Next.js 特性" |
| 复杂推理 | `sequential-thinking` | 架构设计、方案对比 |

---

## 七、Vibe Coding 工作流

**核心理念**：说需求 → 出代码 → 看效果 → 调整

**标准流程**：
1. 用自然语言描述你想要什么
2. Claude 自动选择 Skill 生成代码
3. 预览效果（浏览器/截图）
4. 告诉 Claude 哪里需要调整
5. 重复 2-4 直到满意

**原则**：先能用 → 再正确 → 后整洁

---

## 八、技术栈规范

开发特定技术栈时，Claude 会自动加载对应规范：

| 技术栈 | 规范文件 | 内容 |
|--------|----------|------|
| 前端/桌面 | `stacks/frontend.md` | React 19、Tauri 2.0、Tailwind |
| Java | `stacks/java.md` | Java 21 LTS、Spring Boot |
| Python | `stacks/python.md` | Python 3.13、FastAPI |

---

## 九、常见工作流示例

### 9.1 新功能开发

```
1. 描述需求 → Claude 调用 planner 规划
2. 确认计划 → Claude 调用 tdd-guide 先写测试
3. 实现代码 → Claude 自动调用 code-reviewer
4. 修复问题 → 准备提交
5. 提交前 → Claude 调用 security-reviewer
```

### 9.2 修复 Bug

```
1. 描述问题 → Claude 调用 debugging/systematic-debugging
2. 定位根因 → Claude 调用 tdd-guide 补测试
3. 修复代码 → Claude 调用 code-reviewer 验证
```

---

## 十、注意事项

1. **上下文窗口**：不要同时启用过多 MCP，活跃工具控制在 80 个以内
2. **模型选择**：日常用 Sonnet，复杂架构用 Opus，轻量任务用 Haiku
3. **安全**：禁止硬编码密钥，提交前必须安全审查
4. **测试**：目标 80% 覆盖率，优先 TDD 工作流
