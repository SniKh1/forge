# Forge

**开箱即用的 Claude Code 完整配置框架**

> [everything-claude-code](https://github.com/affaan-m/everything-claude-code) + [Trellis](https://github.com/mindfold-ai/Trellis)，整合即用。

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

---

## Forge 是什么？

Forge 将社区最佳实践和结构化流水线打包为一套可直接安装的 Claude Code 配置方案。

| 特性 | 说明 |
|------|------|
| 50+ Skills | 前端、后端、调试、文档、DevOps、多媒体 |
| 16 Agents | 三层架构（Pipeline + Interactive + Built-in） |
| 34+ Commands | 常用工作流的斜杠命令快捷入口 |
| 8 Rules | 安全、代码风格、测试、Git 规范 |
| 3 Contexts | dev / review / research 模式切换 |
| Trellis 流水线 | Hook 驱动的多代理并行开发 |
| 自动学习 | 从会话中提取可复用模式为 instincts |

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

安装脚本会自动：备份现有配置 → 复制文件 → 替换模板变量 → 可选安装 Skills。

### 前置条件

- [Git](https://git-scm.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI 已安装并完成认证

### 安装后使用

安装完成后，正常使用 Claude Code 即可。Forge 会从 `~/.claude/` 自动加载。

```bash
# 在任意项目目录启动 Claude Code
claude

# 使用斜杠命令
/plan          # 需求分析 + 实施计划
/tdd           # 测试驱动开发
/code-review   # 代码审查
/build-fix     # 构建错误修复
```

Claude Code 会自动：
- 根据上下文将任务路由到合适的 Agent
- 应用代码风格、安全、测试等规则
- 检测到相关关键词时调用匹配的 Skill
- 通过自动学习系统记录可复用模式

---

## 架构

```
~/.claude/
├── CLAUDE.md              # 核心路由表
├── CAPABILITIES.md        # 完整能力索引
├── USAGE-GUIDE.md         # 使用指南
├── agents/                # 10 个 Agent 定义
├── commands/trellis/      # 14 个 Trellis 命令
├── contexts/              # 3 个上下文模式
├── hooks/                 # Hook 脚本
├── rules/                 # 8 条行为规范
├── stacks/                # 技术栈规范
├── scripts/               # 自动化脚本
├── skills/                # 50+ Skills（可选安装）
└── .trellis/              # Trellis 流水线配置
    └── spec/guides/       # 11 个详细指南
```

---

## Agents

三层架构：

| 层级 | Agents | 职责 |
|------|--------|------|
| Pipeline (Trellis) | implement, check, debug, research, dispatch, plan | Hook 驱动自动化 |
| Interactive | planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner | 按需调用，覆盖开发全流程 |
| Built-in | Explore, Plan, Bash, general-purpose | Claude Code 原生能力 |

## Skills (50+)

- **前端**: frontend-design, aesthetic, web-frameworks, ui-styling, theme-factory
- **后端**: backend-development, databases, better-auth
- **调试**: systematic-debugging, build-fix, break-loop
- **文档**: doc-coauthoring, changelog-generator, pdf, docx, pptx, xlsx
- **DevOps**: devops, repomix, mcp-builder
- **多媒体**: ai-multimodal, media-processing, algorithmic-art, canvas-design
- **工作流**: continuous-learning, sequential-thinking, strategic-compact, eval-harness

## Commands

```
/plan          — 需求分析 + 实施计划
/tdd           — 测试驱动开发
/code-review   — 代码审查
/build-fix     — 构建错误修复
/e2e           — 端到端测试
/learn         — 提取可复用模式
/evolve        — 进化 instincts
```

完整列表见 `commands/` 目录。

---

## 自定义

**添加技术栈规范** — 在 `stacks/` 下创建 `<stack>.md`，在 `CLAUDE.md` 中引用。

**添加规则** — 在 `rules/` 下创建 `.md` 文件，Claude Code 自动加载。

**添加命令** — 在 `commands/` 下创建 `.md` 文件，通过 `/command-name` 调用。

**添加 MCP 服务器** — 编辑本地 `.mcp.json`。模板仅包含通用服务器。

---

## FAQ

**安装后会覆盖现有配置吗？**
安装脚本会先询问是否备份，确认后原配置保存到 `~/.claude-backup-<timestamp>/`。

**Skills 为什么不在仓库里？**
Skills 目录包含 5000+ 文件，体积较大。安装脚本可选从 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 拉取。

**如何更新？**
重新运行安装脚本即可，会自动备份并覆盖。

---

## 致谢

- **[everything-claude-code](https://github.com/affaan-m/everything-claude-code)** — Skills, Agents, Commands, Rules
- **[Trellis](https://github.com/mindfold-ai/Trellis)** — 多代理流水线, spec/guides, Worktree 管理

---

## License

MIT. See [LICENSE](LICENSE).