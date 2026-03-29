# MCP 配置指南

## 概述

Forge 的 MCP 配置完全由 catalog 驱动，用户可以灵活选择需要的 MCP 服务器，不与技术栈绑定。

## 核心原则

1. **Catalog 驱动**：所有 MCP 定义在 `core/mcp-servers.json`
2. **用户选择**：通过环境变量或 CLI 参数选择需要的 MCP
3. **独立于 stack**：MCP 配置不与技术栈耦合
4. **客户端适配**：安装脚本根据客户端能力自动适配

## 配置来源

### Core Catalog (`core/mcp-servers.json`)

唯一的 MCP 定义来源，包括：
- 必选服务器（`optional: false`）：默认安装
- 可选服务器（`optional: true`）：用户选择安装
- 客户端支持（`clients`）：指定哪些客户端支持
- 平台限制（`platforms`）：指定支持的操作系统

### 用户选择方式

**环境变量**：
```bash
FORGE_MCP_SERVERS="figma,bing-search,n8n" forge setup
```

**CLI 参数**：
```bash
forge setup --servers figma,bing-search,n8n
```

**交互式选择**（未来支持）：
```bash
forge setup --interactive
```

## MCP 类型

### stdio (本地进程)

大多数 MCP 使用 stdio transport：

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "package-name"],
  "env": {
    "API_KEY": "{{API_KEY}}"
  }
}
```

### remote (HTTP transport)

部分 MCP 使用 remote transport（仅 Codex/Gemini 支持）：

```json
{
  "type": "remote",
  "url": "https://mcp.example.com/mcp",
  "bearer_token_env_var": "TOKEN_VAR",
  "http_headers": {
    "X-Custom-Header": "value"
  }
}
```

## 客户端差异

| 客户端 | stdio | remote | 配置文件 |
|--------|-------|--------|----------|
| Claude | ✓ | ✗ | `~/.claude/.mcp.json` |
| Codex | ✓ | ✓ | `~/.codex/config.toml` |
| Gemini | ✓ | ✓ | `~/.gemini/config.toml` |

## 可用 MCP 列表

查看所有可用 MCP：
```bash
cat core/mcp-servers.json | jq '.servers | keys'
```

查看 MCP 详情：
```bash
cat core/mcp-servers.json | jq '.servers.figma'
```

## Figma MCP 配置示例

Figma 使用 remote MCP，需要 OAuth token：

1. 访问 https://www.figma.com/settings
2. 生成 Personal Access Token
3. 设置环境变量：
   ```bash
   export FIGMA_OAUTH_TOKEN=your_token
   ```
4. 安装时选择：
   ```bash
   FORGE_MCP_SERVERS=figma forge setup
   ```

## 添加新 MCP

编辑 `core/mcp-servers.json`：

```json
{
  "servers": {
    "your-mcp": {
      "optional": true,
      "summary": "简短描述",
      "clients": ["claude", "codex", "gemini"],
      "config": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "your-package"],
        "env": {
          "YOUR_API_KEY": "{{YOUR_API_KEY}}"
        }
      }
    }
  }
}
```

## 工作流程

1. 用户运行 `forge setup --servers figma,exa`
2. 安装脚本读取 `core/mcp-servers.json`
3. 过滤出用户选择的 MCP + 必选 MCP
4. 根据客户端能力生成配置文件
5. 写入客户端配置目录

## 注意事项

- 不要创建 `mcp.json.template`，所有配置从 catalog 生成
- 环境变量占位符格式：`{{VAR_NAME}}`
- remote MCP 仅在 Codex/Gemini 可用
- 平台限制通过 `platforms` 字段指定

