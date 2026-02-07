#!/bin/bash
# ============================================
# Forge - Claude Code Configuration Framework
# install.sh - macOS/Linux
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_HOME="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"

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

# --- Check dependencies ---
check_deps() {
  echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"
  if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}  OK${NC}"
}

# --- Backup existing config ---
backup_existing() {
  echo -e "${YELLOW}[2/5] Checking existing configuration...${NC}"

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

# --- Copy files ---
copy_files() {
  echo -e "${YELLOW}[3/5] Installing configuration files...${NC}"

  for f in CLAUDE.md CAPABILITIES.md USAGE-GUIDE.md AGENTS.md GUIDE.md; do
    [ -f "$SCRIPT_DIR/$f" ] && cp "$SCRIPT_DIR/$f" "$CLAUDE_HOME/$f"
  done

  for d in agents commands contexts rules stacks hooks scripts; do
    if [ -d "$SCRIPT_DIR/$d" ]; then
      rm -rf "$CLAUDE_HOME/$d"
      cp -r "$SCRIPT_DIR/$d" "$CLAUDE_HOME/$d"
    fi
  done

  if [ -d "$SCRIPT_DIR/.trellis" ]; then
    rm -rf "$CLAUDE_HOME/.trellis"
    cp -r "$SCRIPT_DIR/.trellis" "$CLAUDE_HOME/.trellis"
  fi

  if [ -d "$SCRIPT_DIR/.cursor" ]; then
    rm -rf "$CLAUDE_HOME/.cursor"
    cp -r "$SCRIPT_DIR/.cursor" "$CLAUDE_HOME/.cursor"
  fi

  echo -e "${GREEN}  Files installed${NC}"
}

# --- Apply templates ---
apply_templates() {
  echo -e "${YELLOW}[4/5] Applying templates...${NC}"

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

# --- Optional: Install Skills ---
install_skills() {
  echo -e "${YELLOW}[5/5] Optional components...${NC}"

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

# --- Main ---
main() {
  check_deps
  backup_existing
  copy_files
  apply_templates
  install_skills

  echo ""
  echo -e "${GREEN}  Installation complete!${NC}"
  echo -e "  Config location: ${BLUE}$CLAUDE_HOME${NC}"
  echo ""
}

main
