# MCP 配置完整指南

## 问题总结

### 发现的问题

1. **错误理解**: 以为 `~/.claude/.mcp.json` 是全局配置文件
2. **实际情况**: Claude Code 的 MCP 配置存储在 `~/.claude.json` 中，按项目分别配置
3. **包名错误**:
   - ❌ `@cognitionnow/deepwiki-mcp` → ✅ `deepwiki-mcp`
   - ❌ `@modelcontextprotocol/server-exa` → ✅ `exa-mcp-server`
4. **缺少依赖**: `uvx` (uv 包管理器) 未安装

## 正确的配置方式

### 方法 1: 使用安装脚本（推荐）

```bash
cd /path/to/forge
bash scripts/install-mcp.sh
```

### 方法 2: 手动配置

```bash
# 1. 安装 uv (如果未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# 2. 切换到用户主目录（全局配置）
cd ~

# 3. 添加 MCP 服务器
claude mcp add exa -e EXA_API_KEY=your-key -- npx -y exa-mcp-server
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
claude mcp add deepwiki -- npx -y deepwiki-mcp
claude mcp add playwright -- npx -y @executeautomation/playwright-mcp-server
claude mcp add fetch -- uvx mcp-server-fetch
```

## 配置文件结构

### ~/.claude.json

```json
{
  "projects": {
    "/Users/username": {
      "mcpServers": {
        "exa": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "exa-mcp-server"],
          "env": {
            "EXA_API_KEY": "your-key"
          }
        },
        "sequential-thinking": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
          "env": {}
        },
        "memory": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-memory"],
          "env": {}
        },
        "deepwiki": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "deepwiki-mcp"],
          "env": {}
        },
        "playwright": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@executeautomation/playwright-mcp-server"],
          "env": {}
        },
        "fetch": {
          "type": "stdio",
          "command": "uvx",
          "args": ["mcp-server-fetch"],
          "env": {}
        }
      }
    }
  }
}
```

## MCP 服务器列表

| 服务器 | 包名 | 用途 |
|--------|------|------|
| exa | `exa-mcp-server` | 网络搜索 (需要 API key) |
| sequential-thinking | `@modelcontextprotocol/server-sequential-thinking` | 深度推理 |
| memory | `@modelcontextprotocol/server-memory` | 跨会话记忆 |
| deepwiki | `deepwiki-mcp` | 开源项目文档 |
| playwright | `@executeautomation/playwright-mcp-server` | 浏览器自动化 |
| fetch | `mcp-server-fetch` (via uvx) | 网页抓取 |

## 验证配置

### 1. 检查配置文件

```bash
cat ~/.claude.json | jq '.projects["/Users/'$USER'"].mcpServers | keys'
```

### 2. 运行验证脚本

```bash
bash scripts/verify-mcp.sh
```

### 3. 测试 MCP 工具

重启 Claude Code 后，尝试使用：
- `WebSearch` - 测试 exa
- `mcp__playwright__*` - 测试 playwright
- `mcp__memory__*` - 测试 memory

## 常见问题

### Q: 为什么 WebSearch 返回空结果？

A: 可能的原因：
1. MCP 服务器未正确配置
2. Claude Code 未重启
3. Exa API key 未配置或无效
4. 配置在项目级别而非用户级别

### Q: uvx 命令未找到？

A: 安装 uv 包管理器：
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

### Q: 如何更新 Exa API key？

A:
```bash
cd ~
claude mcp remove exa
claude mcp add exa -e EXA_API_KEY=new-key -- npx -y exa-mcp-server
```

### Q: ~/.claude/.mcp.json 的作用是什么？

A: 这是项目级别的 MCP 配置模板，需要用户批准才会加载。不是全局自动加载的配置文件。

## 全局 vs 项目配置

### 全局配置（推荐）

```bash
cd ~
claude mcp add server-name -- command args
```

配置存储在: `~/.claude.json` → `projects["/Users/username"]`

### 项目配置

```bash
cd /path/to/project
claude mcp add server-name -- command args
```

配置存储在: `~/.claude.json` → `projects["/path/to/project"]`

## 依赖要求

- Node.js (npx)
- uv (uvx) - Python 包管理器
- Claude Code CLI

## 下一步

1. ✅ 运行 `scripts/install-mcp.sh` 配置 MCP 服务器
2. ✅ 运行 `scripts/verify-mcp.sh` 验证配置
3. ✅ 重启 Claude Code
4. ✅ 测试 WebSearch 等工具
5. ✅ 如有问题，检查 `~/.claude.json` 配置

## 更新记录

- 2026-03-03: 修复 deepwiki 和 exa 包名错误
- 2026-03-03: 添加 uvx 依赖安装
- 2026-03-03: 创建自动化安装脚本
