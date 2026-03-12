# Forge

**面向 Claude、Codex 和 Gemini 的开源桌面安装器与配置分发仓库。**

Forge 的目标很直接：让用户以尽可能低的门槛，在 `macOS` 和 `Windows` 上为 `Claude`、`Codex`、`Gemini` 安装统一的 AI capability 配置；同时保留 CLI 与脚本入口给高级用户。

<p align="center">
  简体中文 | <a href="README.en.md">English</a>
</p>

## 支持范围

- 平台：`macOS`、`Windows`
- 客户端：`Claude`、`Codex`、`Gemini`
- 分发形态：`Forge Desktop` 桌面应用 + CLI / 兼容脚本

## 下载与安装

### 桌面应用（推荐）

从 [GitHub Releases](https://github.com/SniKh1/forge/releases) 下载最新版本：

- `macOS`：桌面安装包 / 应用归档
- `Windows`：桌面安装包

桌面应用适合终端经验较少的用户。它会负责：

- 检测本机已安装客户端
- 让用户选择安装项
- 写入 Forge 配置
- 运行安装后验证

### CLI / 脚本（高级用法）

```bash
node packages/forge-cli/bin/forge.js setup
node packages/forge-cli/bin/forge.js verify
node packages/forge-cli/bin/forge.js doctor
```

兼容脚本入口仍然保留：

```bash
bash install.sh
bash codex/install-codex.sh
bash gemini/install-gemini.sh
```

```powershell
.\install.ps1
.\codex\install-codex.ps1
.\gemini\install-gemini.ps1
```

这些入口适合已有终端工作流的用户，也适合作为自动化和排障入口。

## Forge 会安装什么

Forge 按客户端适配安装以下能力：

- `MCP`：联网搜索、记忆、文档检索、浏览器自动化等扩展能力
- `Hooks`：关键动作前后的自动检查点
- `Skills`：面向开发任务的能力包
- `Rules`：统一行为约束与提示词规则
- `Stacks`：前端 / Java / Python 等技术栈规范
- `Memory / Learned`：项目记忆与学习沉淀
- `Commands / Playbooks`：常见工作流入口

桌面端允许用户按平台和组件进行选择；CLI 和脚本保留高级控制能力。

## 常见使用方式

### 作为终端用户

- 下载桌面应用
- 选择 `Claude`、`Codex` 或 `Gemini`
- 选择要安装的组件
- 执行安装或修复

### 作为高级用户

- 用 CLI 做安装、验证、诊断
- 用兼容脚本集成现有 shell 流程
- 从源码运行桌面端进行本地开发

### 从源码运行桌面端

```bash
npm install
cd apps/forge-desktop
npm run tauri:dev
```

## 问题反馈

GitHub Issues 是唯一公开反馈入口：

- [Bug Report](https://github.com/SniKh1/forge/issues/new/choose)
- [Feature Request](https://github.com/SniKh1/forge/issues/new/choose)
- [Question](https://github.com/SniKh1/forge/issues/new/choose)

请优先附带：

- 平台与版本
- 目标客户端
- 复现步骤
- 日志或错误截图

## 版本与兼容性

Forge 现在使用统一的仓库版本线：`0.x`。

这意味着：

- CLI 与桌面端共享同一版本号
- Git tag 与 Release 名称保持一致
- `0.x` 表示项目仍在快速迭代，但已经按公开开源仓库治理

完整变更记录见 [CHANGELOG.md](CHANGELOG.md)。

## 提交约定

推荐使用以下提交前缀：

- `feat`
- `fix`
- `docs`
- `chore`
- `ci`
- `release`

## 仓库说明

除 `README.md`、`README.en.md`、`CHANGELOG.md`、`LICENSE` 外，其余文档与实现资料保留在仓库中，但不作为主导航公开入口。它们仍用于维护、安装链路和内部演进。

## License

Forge 使用 [MIT License](LICENSE)。
