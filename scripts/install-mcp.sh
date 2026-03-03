#!/bin/bash

# Forge MCP 配置安装脚本
# 使用 claude mcp add 命令正确配置 MCP 服务器

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== 配置 MCP 服务器 ===${NC}"
echo ""

# 检查是否在用户主目录（全局配置）
if [ "$PWD" != "$HOME" ]; then
  echo -e "${YELLOW}切换到用户主目录以配置全局 MCP 服务器...${NC}"
  cd ~
fi

# 检查依赖
echo "1. 检查依赖..."

if ! command -v claude >/dev/null 2>&1; then
  echo -e "${RED}错误: claude 命令未找到${NC}"
  echo "请先安装 Claude Code CLI"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo -e "${RED}错误: npx 未找到${NC}"
  echo "请先安装 Node.js"
  exit 1
fi

# 检查 uvx
if ! command -v uvx >/dev/null 2>&1; then
  echo -e "${YELLOW}uvx 未安装，正在安装...${NC}"
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # 添加到 PATH
  export PATH="$HOME/.local/bin:$PATH"

  # 添加到 shell 配置
  if [ -f ~/.zshrc ]; then
    if ! grep -q '.local/bin' ~/.zshrc; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    fi
  elif [ -f ~/.bashrc ]; then
    if ! grep -q '.local/bin' ~/.bashrc; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    fi
  fi

  echo -e "${GREEN}✓ uvx 已安装${NC}"
fi

echo ""
echo "2. 配置 MCP 服务器..."

# 提示输入 Exa API key
echo ""
echo -e "${YELLOW}请输入你的 Exa API key (或按 Enter 跳过):${NC}"
read -r EXA_KEY

# 移除可能存在的旧配置
echo "  - 清理旧配置..."
claude mcp remove exa 2>/dev/null || true
claude mcp remove sequential-thinking 2>/dev/null || true
claude mcp remove memory 2>/dev/null || true
claude mcp remove deepwiki 2>/dev/null || true
claude mcp remove playwright 2>/dev/null || true
claude mcp remove fetch 2>/dev/null || true

# 添加 MCP 服务器
echo "  - 添加 exa..."
if [ -n "$EXA_KEY" ]; then
  claude mcp add exa -e EXA_API_KEY="$EXA_KEY" -- npx -y exa-mcp-server
else
  echo -e "${YELLOW}    跳过 exa (未提供 API key)${NC}"
fi

echo "  - 添加 sequential-thinking..."
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking

echo "  - 添加 memory..."
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

echo "  - 添加 deepwiki..."
claude mcp add deepwiki -- npx -y deepwiki-mcp

echo "  - 添加 playwright..."
claude mcp add playwright -- npx -y @executeautomation/playwright-mcp-server

echo "  - 添加 fetch..."
claude mcp add fetch -- uvx mcp-server-fetch

echo ""
echo -e "${GREEN}=== MCP 服务器配置完成 ===${NC}"
echo ""
echo "已配置的服务器:"
echo "  ✓ exa (网络搜索)"
echo "  ✓ sequential-thinking (深度推理)"
echo "  ✓ memory (跨会话记忆)"
echo "  ✓ deepwiki (开源项目文档)"
echo "  ✓ playwright (浏览器自动化)"
echo "  ✓ fetch (网页抓取)"
echo ""
echo "下一步:"
echo "  1. 重启 Claude Code"
echo "  2. 测试 WebSearch 等 MCP 工具"
echo ""
echo "配置文件位置: ~/.claude.json"
