# MCP 全局同步问题解决方案

## 问题描述

在 Forge 项目中使用 `claude mcp add` 添加的 MCP 服务器只在项目级别生效，无法在全局使用。

## 根本原因

Claude Code 的 MCP 配置有两个层级：
1. **全局配置**：`~/.claude.json` 中的 `mcpServers`
2. **项目配置**：项目目录下的 `.claude.json` 或通过 `claude mcp add` 添加

项目配置会覆盖全局配置，导致在项目外无法使用这些 MCP。

## 解决方案

### 方法 1：使用同步脚本（推荐）

运行以下命令将项目 MCP 配置同步到全局：

```bash
npm run forge:mcp:sync
```

这个脚本会：
- 读取 `core/mcp-servers.json` 中的 MCP 定义
- 转换为 Claude 配置格式
- 写入全局 `~/.claude.json`
- 自动处理 Claude 特定的 override

### 方法 2：手动编辑全局配置

直接编辑 `~/.claude.json`，在 `mcpServers` 字段中添加所需的 MCP 服务器。

## 当前已配置的全局 MCP

以下 MCP 已成功配置到全局：

1. **sequential-thinking** - 复杂问题分步推理
2. **context7** - 文档与示例检索
3. **memory** - 跨会话记忆
4. **fetch** - HTTP 抓取
5. **deepwiki** - 开源仓库检索
6. **exa** - 联网搜索（已配置 API key）

## 验证

重启 Claude Code 后，在任意目录运行：

```bash
claude
/mcp
```

应该能看到所有已配置的 MCP 服务器。

## 注意事项

- 修改 `core/mcp-servers.json` 后需要重新运行同步脚本
- 添加新的 API key 后需要重新同步
- 项目级别的 MCP 配置会覆盖全局配置
