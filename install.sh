#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# install.sh - macOS/Linux 安装脚本
# ============================================

set -e

REPO_URL="https://github.com/SniKh1/forge.git"
CLAUDE_HOME="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="/tmp/forge-install-$$"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     Forge - Claude Code Framework     ║"
echo "  ║         Installation Script           ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# --- 检测依赖 ---
check_deps() {
  echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"

  if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
  fi

  if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Warning: node is not installed. Hooks will not work.${NC}"
  fi

  echo -e "${GREEN}  Dependencies OK${NC}"
}

# --- 备份现有配置 ---
backup_existing() {
  echo -e "${YELLOW}[2/6] Checking existing configuration...${NC}"

  if [ -d "$CLAUDE_HOME" ]; then
    echo -e "  Found existing ~/.claude/"
    read -p "  Backup existing config? (y/n): " do_backup
    if [ "$do_backup" = "y" ]; then
      cp -r "$CLAUDE_HOME" "$BACKUP_DIR"
      echo -e "${GREEN}  Backed up to $BACKUP_DIR${NC}"
    fi
  else
    mkdir -p "$CLAUDE_HOME"
    echo -e "  Created ~/.claude/"
  fi
}

# --- 克隆仓库 ---
clone_repo() {
  echo -e "${YELLOW}[3/6] Cloning Forge...${NC}"
  git clone --depth 1 "$REPO_URL" "$TEMP_DIR"
  echo -e "${GREEN}  Clone complete${NC}"
}

# --- 复制配置文件 ---
copy_files() {
  echo -e "${YELLOW}[4/6] Installing configuration files...${NC}"

  # 核心文件
  for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
    [ -f "$TEMP_DIR/$f" ] && cp "$TEMP_DIR/$f" "$CLAUDE_HOME/$f"
  done

  # 目录
  for d in agents commands contexts rules stacks hooks scripts; do
    if [ -d "$TEMP_DIR/$d" ]; then
      cp -r "$TEMP_DIR/$d" "$CLAUDE_HOME/"
    fi
  done

  # Trellis
  if [ -d "$TEMP_DIR/.trellis" ]; then
    cp -r "$TEMP_DIR/.trellis" "$CLAUDE_HOME/"
  fi

  # Cursor 适配
  if [ -d "$TEMP_DIR/.cursor" ]; then
    cp -r "$TEMP_DIR/.cursor" "$CLAUDE_HOME/"
  fi

  echo -e "${GREEN}  Files installed${NC}"
}

# --- 模板替换 ---
apply_templates() {
  echo -e "${YELLOW}[5/6] Applying templates...${NC}"

  # settings.json
  if [ -f "$CLAUDE_HOME/settings.json.template" ]; then
    cp "$CLAUDE_HOME/settings.json.template" "$CLAUDE_HOME/settings.json"
  fi

  # .mcp.json
  if [ -f "$CLAUDE_HOME/mcp.json.template" ]; then
    cp "$CLAUDE_HOME/mcp.json.template" "$CLAUDE_HOME/.mcp.json"
  fi

  # hooks.json - 替换 {{CLAUDE_HOME}}
  if [ -f "$CLAUDE_HOME/hooks/hooks.json.template" ]; then
    ESCAPED_HOME=$(echo "$CLAUDE_HOME" | sed 's/\//\\\//g')
    sed "s/{{CLAUDE_HOME}}/$ESCAPED_HOME/g" \
      "$CLAUDE_HOME/hooks/hooks.json.template" > "$CLAUDE_HOME/hooks/hooks.json"
  fi

  echo -e "${GREEN}  Templates applied${NC}"
}

# --- 可选：安装 Skills ---
install_skills() {
  echo -e "${YELLOW}[6/6] Optional components...${NC}"

  read -p "  Install Skills from everything-claude-code? (y/n): " install_sk
  if [ "$install_sk" = "y" ]; then
    echo "  Cloning everything-claude-code..."
    git clone --depth 1 https://github.com/affaan-m/everything-claude-code /tmp/ecc-$$
    cp -r /tmp/ecc-$$/skills "$CLAUDE_HOME/skills"
    rm -rf /tmp/ecc-$$
    echo -e "${GREEN}  Skills installed${NC}"
  else
    echo "  Skipped Skills installation"
  fi
}

# --- 清理 ---
cleanup() {
  rm -rf "$TEMP_DIR"
}

# --- 主函数 ---
main() {
  check_deps
  backup_existing
  clone_repo
  copy_files
  apply_templates
  install_skills
  cleanup

  echo ""
  echo -e "${GREEN}  Installation complete!${NC}"
  echo -e "  Config location: ${BLUE}$CLAUDE_HOME${NC}"
  echo ""
}

main
