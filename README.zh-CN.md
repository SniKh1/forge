# Forge

**开箱即用的 Claude Code 配置框架**

Forge 将社区最佳实践打包为一套可直接安装的 Claude Code 配置方案。Skills 按角色按需安装，不再下载 79MB 用不到的文件。

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

---

## 包含什么

| 组件 | 数量 | 说明 |
|------|------|------|
| Skills | 66 | 按模块按需安装 — 前端、后端、Java、Python、Go、安全、文档… |
| Agents | 10 | 覆盖完整开发生命周期的交互式代理 |
| Commands | 20 | 常用工作流的斜杠命令快捷入口 |
| Rules | 8 | 安全、代码风格、测试、Git 规范 |
| Contexts | 3 | dev / review / research 模式切换 |
| Stacks | 3 | 技术栈规范（前端、Java、Python） |
| 角色预设 | 8 | fullstack、frontend-dev、backend-dev、java-dev、python-dev 等 |

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

安装脚本会自动：备份现有配置 → 复制文件 → 替换模板变量 → 可选安装 Skill 模块。

### 前置条件

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)（Skill 安装器和 hooks 需要）
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI 已安装并完成认证

---

## Skill 模块

Skills 按 12 个模块组织。选择一个角色预设，或自由组合模块。

### 角色预设

| 预设 | 包含模块 | Skills 数 |
|------|----------|-----------|
| `fullstack` | core + frontend + backend + docs + testing | 41 |
| `frontend-dev` | core + frontend + testing + docs | 38 |
| `backend-dev` | core + backend + testing + docs | 34 |
| `java-dev` | core + backend + java + testing + docs | 40 |
| `python-dev` | core + backend + python + ai-ml + docs | 39 |
| `security-eng` | core + security + testing | 26 |
| `devops-eng` | core + security + docs | 31 |
| `all` | 全部模块 | 66 |

### 模块列表

| 模块 | Skills 数 | 包含 |
|------|-----------|------|
| core（必装） | 22 | superpowers、continuous-learning、tdd-workflow、coding-standards、verification-loop |
| frontend | 7 | frontend-design、frontend-patterns、theme-factory、canvas-design、algorithmic-art |
| backend | 3 | backend-patterns、postgres-patterns、clickhouse-io |
| java | 6 | java-coding-standards、jpa-patterns、springboot-patterns/security/tdd/verification |
| python | 6 | python-patterns、python-testing、django-patterns/security/tdd/verification |
| golang | 2 | golang-patterns、golang-testing |
| security | 2 | security-review、security-scan |
| docs | 7 | doc-coauthoring、docx、pdf、pptx、xlsx、internal-comms、nutrient-document-processing |
| testing | 2 | webapp-testing、cpp-testing |
| ai-ml | 1 | notebooklm |
| mcp | 1 | mcp-builder |
| extras | 7 | obsidian-skills、skill-creator、planning-with-files、slack-gif-creator |

### 单独安装 Skills

```bash
# 交互模式 — 从菜单选择预设或模块
bash ~/.claude/scripts/install-skills.sh

# 命令行模式
bash ~/.claude/scripts/install-skills.sh --preset fullstack
bash ~/.claude/scripts/install-skills.sh --modules frontend,backend,docs
bash ~/.claude/scripts/install-skills.sh --list
```

```powershell
# PowerShell
& ~/.claude/scripts/install-skills.ps1
& ~/.claude/scripts/install-skills.ps1 --preset fullstack
```

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
│   ├── install-skills.*   # Skill 模块安装器（bash + PowerShell）
│   └── lib/               # skills-registry.json + modules.json
├── skills/                # 已安装的 Skill 模块（按需）
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

**添加 MCP 服务器** — 编辑本地 `.mcp.json`，模板仅包含通用服务器。

---

## 常见问题

**会覆盖我现有的配置吗？**
安装脚本会先询问确认，现有配置会备份到 `~/.claude-backup-<timestamp>/`。

**Skills 从哪里下载？**
按需从 GitHub 开源仓库下载，只安装你选择的模块。详见下方来源表。

**如何更新？**
重新运行安装脚本即可，会自动备份并覆盖。再次运行 `install-skills.sh` 更新 Skills。

**可以后续添加更多 Skills 吗？**
可以。运行 `install-skills.sh --modules <module>` 添加模块，或运行 `install-skills.sh` 进入交互菜单。

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
