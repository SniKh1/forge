# Forge

**开箱即用的 Claude Code 配置框架**

Forge 将社区最佳实践打包为一套可直接安装的 Claude Code 配置方案。一条命令安装全部 115 个 Skills、10 个 Agents、20 个 Commands。

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

---

## 包含什么

| 组件 | 数量 | 说明 |
|------|------|------|
| Skills | 115 | 前端、后端、Java、Python、Go、安全、文档等 — 全部内置 |
| Agents | 10 | 覆盖完整开发生命周期的交互式代理 |
| Commands | 20 | 常用工作流的斜杠命令快捷入口 |
| Rules | 8 | 安全、代码风格、测试、Git 规范 |
| Contexts | 3 | dev / review / research 模式切换 |
| Stacks | 3 | 技术栈规范（前端、Java、Python） |

---

## 快速安装

### Windows (PowerShell)

```powershell
git clone https://github.com/SniKh1/forge.git $env:TEMP\forge
& $env:TEMP\forge\install.ps1
```

### macOS / Linux

```bash
git clone https://github.com/SniKh1/forge.git /tmp/forge
bash /tmp/forge/install.sh
```

安装脚本会自动：复制文件 → 替换模板变量 → 安装全部 115 个 Skills。

### 前置条件

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)（hooks 需要）
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI 已安装并完成认证

---

## Skills

全部 115 个 Skills 随安装脚本一起安装，无需单独下载或选择模块。

| 分类 | 示例 |
|------|------|
| 核心工作流 | superpowers、continuous-learning、tdd-workflow、coding-standards、verification-loop |
| 前端 | frontend-design、frontend-patterns、theme-factory、canvas-design、algorithmic-art |
| 后端 | backend-patterns、postgres-patterns、clickhouse-io、api-design、deployment-patterns |
| Java | java-coding-standards、jpa-patterns、springboot-patterns/security/tdd/verification |
| Python | python-patterns、python-testing、django-patterns/security/tdd/verification |
| Go | golang-patterns、golang-testing |
| 安全 | security-review、security-scan |
| 文档 | doc-coauthoring、docx、pdf、pptx、xlsx、internal-comms |
| 测试 | webapp-testing、e2e-testing、cpp-testing |
| AI/ML | ai-multimodal、google-adk-python |
| MCP | mcp-builder、mcp-management |

完整列表见 [SKILLS-CATALOG.md](SKILLS-CATALOG.md)。

---

## 安装后使用

安装完成后正常使用 Claude Code 即可，Forge 从 `~/.claude/` 自动加载。

```bash
claude

/plan          # 创建实施计划
/tdd           # 测试驱动开发
/code-review   # 代码审查
/build-fix     # 修复构建错误
/e2e           # 端到端测试
/learn         # 提取可复用模式
/evolve        # 演化 instincts
```

Claude Code 会自动：
- 根据上下文将任务路由到合适的 Agent
- 应用代码风格、安全、测试规则
- 检测关键词并调用匹配的 Skill
- 通过自动学习系统追踪可复用模式

---

## 目录结构

```
~/.claude/
├── CLAUDE.md              # 核心路由表与原则
├── agents/                # 10 个交互式 Agent
├── commands/              # 20 个斜杠命令
├── contexts/              # 3 种上下文模式（dev / review / research）
├── hooks/                 # Hook 脚本与模板
├── rules/                 # 8 条行为规则
├── stacks/                # 技术栈规范（frontend, java, python）
├── scripts/
│   └── verify.*           # 安装验证脚本
├── skills/                # 115 个 Skills（全部内置）
│   └── learned/           # 自动学习的模式（跨安装保留）
├── settings.json.template
└── mcp.json.template
```

---

## Agents

| Agent | 职责 |
|-------|------|
| planner | 将复杂功能拆解为实施计划 |
| architect | 系统设计与架构决策 |
| tdd-guide | 测试驱动开发 — 先写测试，再实现 |
| code-reviewer | 代码完成后的审查 |
| security-reviewer | 提交前的安全分析 |
| build-error-resolver | 诊断并修复构建失败 |
| e2e-runner | Playwright 端到端测试 |
| database-reviewer | 数据库 schema 与查询优化 |
| doc-updater | 保持文档与代码同步 |
| refactor-cleaner | 死代码清理与合并 |

---

## 自定义

**添加技术栈规范** — 在 `stacks/` 中创建 `<stack>.md`，在 `CLAUDE.md` 中引用。

**添加规则** — 在 `rules/` 中创建 `.md` 文件，Claude Code 自动加载。

**添加命令** — 在 `commands/` 中创建 `.md` 文件，通过 `/command-name` 调用。

**添加 MCP 服务器** — 编辑本地 `.mcp.json`。模板包含常用服务器 (exa, playwright, sequential-thinking, memory, deepwiki, fetch)。安装时会提示输入 Exa API key。

---

## 常见问题

**会覆盖我现有的配置吗？**
安装脚本会先询问确认，现有配置会备份到 `~/.claude-backup-<timestamp>/`。

**如何配置 Exa API key？**
安装时脚本会提示输入 Exa API key。如果跳过，可以手动编辑 `~/.claude/.mcp.json`，将 `{{EXA_API_KEY}}` 替换为实际的 key。

**Skills 从哪里来？**
全部 115 个 Skills 内置在仓库中，来源于 [anthropics/skills](https://github.com/anthropics/skills)、[obra/superpowers](https://github.com/obra/superpowers)、[everything-claude-code](https://github.com/affaan-m/everything-claude-code) 等社区开源仓库。

**如何更新？**
重新运行安装脚本即可，会自动覆盖为最新版本。

**可以后续添加更多 Skills 吗？**
可以。在 `~/.claude/skills/` 中放入 skill 目录即可，Claude Code 会自动加载。

---

## Skill 来源

| 来源 | 仓库 | Skills 数 |
|------|------|-----------|
| Superpowers | [obra/superpowers](https://github.com/obra/superpowers) | 14 |
| Anthropic Skills | [anthropics/skills](https://github.com/anthropics/skills) | 16 |
| Everything Claude Code | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 32 |
| NotebookLM | [PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill) | 1 |
| Obsidian Skills | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 1 |
| Planning with Files | [ryanmac/planning-with-files](https://github.com/ryanmac/planning-with-files) | 1 |
| Skill Prompt Generator | [disler/skill-prompt-generator](https://github.com/disler/skill-prompt-generator) | 1 |

---

## 致谢

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — Skills、Agents、Commands、Rules
- **[superpowers](https://github.com/obra/superpowers)** — 核心工作流 Skills

---

## 许可证

MIT. 见 [LICENSE](LICENSE)。
