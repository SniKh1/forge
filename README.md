# Forge

<p align="center">
  <strong>面向 Claude、Codex、Gemini 的统一安装器与能力配置分发仓库。</strong>
</p>

<p align="center">
  <a href="https://github.com/SniKh1/forge/releases">Releases</a> ·
  <a href="https://github.com/SniKh1/forge/issues">Issues</a> ·
  <a href="README.en.md">English</a>
</p>

<p align="center">
  <img alt="Release" src="https://img.shields.io/github/v/release/SniKh1/forge?display_name=tag">
  <img alt="License" src="https://img.shields.io/github/license/SniKh1/forge">
  <img alt="Platforms" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-111827">
</p>

Forge 的定位很简单：把分散在不同客户端、不同目录、不同脚本入口里的 AI capability 配置，收口成一套可安装、可验证、可修复的统一分发方案。

对终端用户，Forge 提供图形化安装器。  
对高级用户，Forge 保留 CLI 与脚本入口。  
对维护者，Forge 提供统一的规则、技能、记忆与工作流治理基础。

## 快速入口

| 目标 | 推荐入口 |
| --- | --- |
| 普通用户安装 | [GitHub Releases](https://github.com/SniKh1/forge/releases) |
| 高级用户安装/修复 | `forge.js setup / verify / doctor` |
| 查看变更 | [CHANGELOG.md](CHANGELOG.md) |
| 分支与发布治理 | [BRANCHING.md](BRANCHING.md) |

## 支持矩阵

| 维度 | 当前支持 |
| --- | --- |
| 平台 | `macOS`、`Windows` |
| 客户端 | `Claude`、`Codex`、`Gemini` |
| 主产品名称 | `Forge` |
| 分发形态 | 图形化应用 + CLI + 兼容脚本 |
| macOS 发布策略 | Apple Silicon `.dmg` |

## Forge 会安装什么

Forge 会按客户端和平台写入一整套可协作能力层：

- `MCP`：联网搜索、记忆、文档检索、浏览器自动化等扩展能力
- `Hooks`：关键操作前后的自动检查点
- `Skills`：任务能力包
- `Rules`：全局行为约束与提示路由
- `Stacks`：前端 / Java / Python 等栈规范
- `Memory / Learned`：项目记忆与学习沉淀
- `Commands / Playbooks`：常见工作流入口

## 安装方式

### 图形化安装器

从 [GitHub Releases](https://github.com/SniKh1/forge/releases) 下载最新版本：

- `macOS`：Apple Silicon `.dmg`
- `Windows`：`.msi`

图形化安装器适合终端经验较少的用户，它会负责：

- 检测本机已安装客户端
- 展示平台可安装项
- 写入 Forge 配置
- 执行安装后验证与修复

### CLI / 脚本入口

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

## 从源码运行

```bash
npm install
cd apps/forge-desktop
npm run tauri:dev
```

说明：

- 对外产品名已经统一为 `Forge`
- 仓库内部仍保留 `apps/forge-desktop` 作为桌面壳路径，避免一次性打断已有构建链

## 分支模型

Forge 使用一套刻意收敛的分支策略：

| 分支 | 用途 |
| --- | --- |
| `public` | 对外稳定线，也是唯一允许打 release tag 的分支 |
| `dev` | 你的主开发线，保留完整演进内容 |
| `feature/*` | 短命功能分支 |
| `hotfix/*` | 短命修复分支 |

完整说明与推荐保护规则见 [BRANCHING.md](BRANCHING.md)。

## 反馈与协作

公开反馈入口统一走 GitHub Issues：

- [Bug Report](https://github.com/SniKh1/forge/issues/new/choose)
- [Feature Request](https://github.com/SniKh1/forge/issues/new/choose)
- [Question](https://github.com/SniKh1/forge/issues/new/choose)

建议附带：

- 平台与版本
- 目标客户端
- 复现步骤
- 日志或截图

## 版本策略

Forge 使用统一仓库版本线：

- CLI 与图形化应用共享版本号
- Git tag 与 GitHub Release 名称保持一致
- `0.x` 表示项目仍在快速迭代，但已经按公开仓库方式治理

## License

Forge 使用 [MIT License](LICENSE)。
