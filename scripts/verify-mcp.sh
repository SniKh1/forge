#!/bin/bash

# MCP 服务器验证脚本
# 用于测试所有 MCP 服务器是否能正常启动

set -e

# 添加 uv 到 PATH
export PATH="$HOME/.local/bin:$PATH"

echo "=== MCP 服务器验证 ==="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_mcp_server() {
  local name=$1
  local command=$2
  shift 2
  local args=("$@")

  echo -n "测试 $name ... "

  # 尝试启动服务器（超时 3 秒）
  if timeout 3 $command "${args[@]}" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ 可用${NC}"
    return 0
  else
    # 检查是否是因为 stdio 模式正常启动
    if $command "${args[@]}" 2>&1 | grep -qE "stdio|MCP|server|running" 2>/dev/null; then
      echo -e "${GREEN}✓ 可用${NC}"
      return 0
    else
      echo -e "${RED}✗ 失败${NC}"
      return 1
    fi
  fi
}

# 检查依赖
echo "1. 检查依赖..."
echo -n "  - npx: "
if command -v npx >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} $(npx --version)"
else
  echo -e "${RED}✗ 未安装${NC}"
  exit 1
fi

echo -n "  - uvx: "
if command -v uvx >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} $(uvx --version | head -1)"
else
  echo -e "${RED}✗ 未安装${NC}"
  echo -e "${YELLOW}提示: 运行 'curl -LsSf https://astral.sh/uv/install.sh | sh' 安装${NC}"
  exit 1
fi

echo ""
echo "2. 测试 MCP 服务器..."

# 测试各个服务器
test_mcp_server "exa" npx -y exa-mcp-server
test_mcp_server "sequential-thinking" npx -y @modelcontextprotocol/server-sequential-thinking
test_mcp_server "memory" npx -y @modelcontextprotocol/server-memory
test_mcp_server "deepwiki" npx -y deepwiki-mcp
test_mcp_server "playwright" npx -y @executeautomation/playwright-mcp-server
test_mcp_server "fetch" uvx mcp-server-fetch

echo ""
echo "3. 检查 Claude Code 配置..."
if [ -f ~/.claude.json ]; then
  echo -n "  - ~/.claude.json: "
  echo -e "${GREEN}✓ 存在${NC}"

  # 检查用户级别配置
  if command -v jq >/dev/null 2>&1; then
    server_count=$(jq '.projects["/Users/'$USER'"].mcpServers | length' ~/.claude.json 2>/dev/null || echo 0)
    echo "  - 已配置 MCP 服务器: $server_count 个"
  fi
else
  echo -e "  - ~/.claude.json: ${RED}✗ 不存在${NC}"
fi

echo ""
echo -e "${GREEN}=== 验证完成 ===${NC}"
echo ""
echo "下一步:"
echo "1. 重启 Claude Code"
echo "2. 测试 WebSearch 等 MCP 工具"
echo "3. 如果仍有问题，检查 Claude Code 日志"
